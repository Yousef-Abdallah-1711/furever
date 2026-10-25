import { expect, jest, test } from '@jest/globals';
import type { AESEncryptionKey } from 'expo-crypto';
import type { SessionCrypto } from './supabase';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-test-key';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { EncryptedSessionStorage } = require('./supabase') as typeof import('./supabase');
const keyHex = 'a'.repeat(64);

function createHarness(initialValues: Record<string, string> = {}) {
  const values = new Map(Object.entries(initialValues));
  const secureValues = new Map<string, string>();
  const operations: string[] = [];
  const cryptoOperations: string[] = [];
  const ciphertextToPlaintext = new Map<string, string>();
  let nextCiphertext = 'dGVzdA==';

  const asyncStorage = {
    getItem: jest.fn(async (key: string) => values.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      operations.push('persist-async-value');
      values.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      values.delete(key);
    }),
  };
  const secureStore = {
    getItemAsync: jest.fn(async (key: string) => secureValues.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      secureValues.set(key, value);
    }),
  };
  const crypto: SessionCrypto = {
    generateKey: jest.fn(async () => {
      cryptoOperations.push('generate-key');
      return keyHex;
    }),
    importKey: jest.fn(async () => ({}) as AESEncryptionKey),
    randomBytes: jest.fn(async (size: number) => new Uint8Array(size).fill(7)),
    encrypt: jest.fn(async (value: string) => {
      cryptoOperations.push('encrypt');
      operations.push('encrypt');
      const ciphertext = nextCiphertext;
      ciphertextToPlaintext.set(ciphertext, value);
      nextCiphertext = ciphertext === 'dGVzdA==' ? 'c2Vjb25k' : 'dGVzdA==';
      return ciphertext;
    }),
    decrypt: jest.fn(async (value: string) => {
      cryptoOperations.push('decrypt');
      const plaintext = ciphertextToPlaintext.get(value);
      if (plaintext === undefined) throw new Error('Authentication failed');
      return plaintext;
    }),
  };

  return {
    storage: new EncryptedSessionStorage({ asyncStorage, secureStore, crypto }),
    values,
    secureValues,
    asyncStorage,
    secureStore,
    crypto,
    cryptoOperations,
    operations,
  };
}

test('round-trips through encrypted storage and persists only the AES key in SecureStore', async () => {
  const harness = createHarness();
  const session = JSON.stringify({ access_token: 'session-value', user: { name: 'Mina' } });

  await harness.storage.setItem('auth-session', session);
  const storedValue = harness.values.get('auth-session');

  expect(storedValue).toContain('furever-session:');
  expect(storedValue).not.toContain(session);
  expect(await harness.storage.getItem('auth-session')).toBe(session);
  expect([...harness.secureValues.values()]).toEqual([keyHex]);
  expect(harness.secureStore.setItemAsync).toHaveBeenCalledTimes(1);
});

test('migrates legacy plaintext only after ciphertext is persisted and verified', async () => {
  const legacy = JSON.stringify({ access_token: 'legacy-session', refresh_token: 'legacy-refresh' });
  const harness = createHarness({ 'auth-session': legacy });

  expect(await harness.storage.getItem('auth-session')).toBe(legacy);
  expect(harness.cryptoOperations).toEqual(['generate-key', 'encrypt']);
  expect(harness.operations).toEqual(['encrypt', 'persist-async-value']);
  expect(harness.values.get('auth-session')).toContain('furever-session:');
  expect(harness.values.get('auth-session')).not.toContain(legacy);
  expect(harness.asyncStorage.setItem).toHaveBeenCalledTimes(1);
});

test('restores the exact legacy value when encrypted persistence fails', async () => {
  const legacy = JSON.stringify({ access_token: 'keep-this-session' });
  const harness = createHarness({ 'auth-session': legacy });
  harness.asyncStorage.setItem.mockImplementationOnce(async () => {
    throw new Error('storage unavailable');
  });

  await expect(harness.storage.getItem('auth-session')).rejects.toThrow('storage unavailable');
  expect(harness.values.get('auth-session')).toBe(legacy);
  expect(harness.asyncStorage.setItem).toHaveBeenCalledTimes(2);
});

test('rejects malformed envelopes and encrypted values without a key', async () => {
  const malformed = createHarness({ 'auth-session': 'furever-session:{not-json' });
  await expect(malformed.storage.getItem('auth-session')).rejects.toThrow('Malformed encrypted session envelope');

  const missingKey = createHarness({
    'auth-session': 'furever-session:{"format":"furever-session","version":1,"algorithm":"AES-256-GCM","ciphertext":"dGVzdA=="}',
  });
  await expect(missingKey.storage.getItem('auth-session')).rejects.toThrow('Encrypted session key is missing');

  const tampered = createHarness({
    'auth-session': 'furever-session:{"format":"furever-session","version":1,"algorithm":"AES-256-GCM","ciphertext":"dGVzdA=="}',
  });
  tampered.secureValues.set('furever.supabase.session-encryption-key.v1', keyHex);
  await expect(tampered.storage.getItem('auth-session')).rejects.toThrow('Authentication failed');
});

test('serializes concurrent writes so they create one shared encryption key', async () => {
  const harness = createHarness();

  await Promise.all([
    harness.storage.setItem('auth-session', 'first-session'),
    harness.storage.setItem('auth-session-code-verifier', 'second-session'),
  ]);

  expect(harness.crypto.generateKey).toHaveBeenCalledTimes(1);
  expect(harness.secureStore.setItemAsync).toHaveBeenCalledTimes(1);
  expect(harness.values.get('auth-session')).toContain('furever-session:');
  expect(harness.values.get('auth-session-code-verifier')).toContain('furever-session:');
});
