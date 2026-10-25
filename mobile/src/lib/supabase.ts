import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import {
  AESEncryptionKey,
  AESSealedData,
  aesDecryptAsync,
  aesEncryptAsync,
  getRandomBytesAsync,
} from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

const ENVELOPE_FORMAT = 'furever-session';
const ENVELOPE_PREFIX = `${ENVELOPE_FORMAT}:`;
const ENVELOPE_VERSION = 1;
const AES_KEY_SIZE_BITS = 256;
const GCM_NONCE_SIZE_BYTES = 12;
const GCM_TAG_SIZE_BYTES = 16;
const SECURE_STORE_KEY = 'furever.supabase.session-encryption-key.v1';

type AsyncKeyValueStorage = Pick<
  typeof AsyncStorage,
  'getItem' | 'setItem' | 'removeItem'
>;

type SecureKeyValueStorage = Pick<
  typeof SecureStore,
  'getItemAsync' | 'setItemAsync'
>;

export type SessionCrypto = {
  generateKey: () => Promise<string>;
  importKey: (encodedKey: string) => Promise<AESEncryptionKey>;
  randomBytes: (size: number) => Promise<Uint8Array>;
  encrypt: (value: string, key: AESEncryptionKey, nonce: Uint8Array, additionalData: Uint8Array) => Promise<string>;
  decrypt: (value: string, key: AESEncryptionKey, additionalData: Uint8Array) => Promise<string>;
};

type EncryptedSessionStorageOptions = {
  asyncStorage?: AsyncKeyValueStorage;
  secureStore?: SecureKeyValueStorage;
  crypto?: SessionCrypto;
};

type EncryptedEnvelope = {
  format: typeof ENVELOPE_FORMAT;
  version: typeof ENVELOPE_VERSION;
  algorithm: 'AES-256-GCM';
  ciphertext: string;
};

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder('utf-8', { fatal: true });

const crypto: SessionCrypto = {
  generateKey: async () =>
    (await AESEncryptionKey.generate(AES_KEY_SIZE_BITS)).encoded('hex'),
  importKey: (encodedKey) => AESEncryptionKey.import(encodedKey, 'hex'),
  randomBytes: getRandomBytesAsync,
  encrypt: async (value, key, nonce, additionalData) => {
    const sealed = await aesEncryptAsync(utf8Encoder.encode(value), key, {
      nonce: { bytes: nonce },
      additionalData,
      tagLength: GCM_TAG_SIZE_BYTES,
    });
    return sealed.combined('base64');
  },
  decrypt: async (value, key, additionalData) => {
    const sealed = AESSealedData.fromCombined(value);
    if (
      sealed.ivSize !== GCM_NONCE_SIZE_BYTES ||
      sealed.tagSize !== GCM_TAG_SIZE_BYTES ||
      sealed.combinedSize < GCM_NONCE_SIZE_BYTES + GCM_TAG_SIZE_BYTES
    ) {
      throw new Error('Invalid encrypted session payload');
    }
    const plaintext = await aesDecryptAsync(sealed, key, { output: 'bytes', additionalData });
    return utf8Decoder.decode(plaintext);
  },
};

function isValidBase64(value: string): boolean {
  if (value.length === 0 || value.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
    return false;
  }
  const paddingIndex = value.indexOf('=');
  if (paddingIndex >= 0 && paddingIndex < value.length - 2) return false;
  return true;
}

function parseEnvelope(raw: string): EncryptedEnvelope | null {
  if (!raw.startsWith(ENVELOPE_PREFIX)) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.slice(ENVELOPE_PREFIX.length));
  } catch {
    throw new Error('Malformed encrypted session envelope');
  }

  if (typeof parsed !== 'object' || parsed === null) throw new Error('Malformed encrypted session envelope');

  const value = parsed as Partial<EncryptedEnvelope>;
  if (
    value.format !== ENVELOPE_FORMAT ||
    value.version !== ENVELOPE_VERSION ||
    value.algorithm !== 'AES-256-GCM' ||
    typeof value.ciphertext !== 'string' ||
    !isValidBase64(value.ciphertext)
  ) {
    throw new Error('Malformed encrypted session envelope');
  }
  return value as EncryptedEnvelope;
}

function additionalDataFor(storageKey: string): Uint8Array {
  return utf8Encoder.encode(`${ENVELOPE_FORMAT}:${ENVELOPE_VERSION}:${storageKey}`);
}

/**
 * Supabase Auth storage that keeps only the AES key in SecureStore and stores
 * authenticated, versioned ciphertext in AsyncStorage.
 */
export class EncryptedSessionStorage {
  private readonly asyncStorage: AsyncKeyValueStorage;
  private readonly secureStore: SecureKeyValueStorage;
  private readonly crypto: SessionCrypto;
  private queue: Promise<void> = Promise.resolve();

  constructor(options: EncryptedSessionStorageOptions = {}) {
    this.asyncStorage = options.asyncStorage ?? AsyncStorage;
    this.secureStore = options.secureStore ?? SecureStore;
    this.crypto = options.crypto ?? crypto;
  }

  private serialize<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation);
    this.queue = result.then(() => undefined, () => undefined);
    return result;
  }

  private async getEncryptionKey(createIfMissing: boolean): Promise<AESEncryptionKey> {
    let encodedKey = await this.secureStore.getItemAsync(SECURE_STORE_KEY);
    if (encodedKey === null) {
      if (!createIfMissing) throw new Error('Encrypted session key is missing');
      const generatedKey = await this.crypto.generateKey();
      await this.secureStore.setItemAsync(SECURE_STORE_KEY, generatedKey);
      encodedKey = await this.secureStore.getItemAsync(SECURE_STORE_KEY);
      if (encodedKey !== generatedKey) {
        throw new Error('Unable to persist encrypted session key');
      }
    }
    if (!/^[0-9a-f]{64}$/i.test(encodedKey)) {
      throw new Error('Invalid encrypted session key');
    }
    return this.crypto.importKey(encodedKey);
  }

  private async makeEnvelope(storageKey: string, value: string): Promise<string> {
    const key = await this.getEncryptionKey(true);
    const nonce = await this.crypto.randomBytes(GCM_NONCE_SIZE_BYTES);
    const ciphertext = await this.crypto.encrypt(value, key, nonce, additionalDataFor(storageKey));
    const envelope: EncryptedEnvelope = {
      format: ENVELOPE_FORMAT,
      version: ENVELOPE_VERSION,
      algorithm: 'AES-256-GCM',
      ciphertext,
    };
    return `${ENVELOPE_PREFIX}${JSON.stringify(envelope)}`;
  }

  async getItem(storageKey: string): Promise<string | null> {
    return this.serialize(async () => {
      const storedValue = await this.asyncStorage.getItem(storageKey);
      if (storedValue === null) return null;

      const envelope = parseEnvelope(storedValue);
      if (envelope) {
        const key = await this.getEncryptionKey(false);
        return this.crypto.decrypt(envelope.ciphertext, key, additionalDataFor(storageKey));
      }

      // A legacy value is kept in memory and restored if encryption, persistence,
      // or the persistence read-back fails. AsyncStorage's overwrite is the
      // migration; successful ciphertext persistence replaces plaintext in place.
      try {
        const encryptedValue = await this.makeEnvelope(storageKey, storedValue);
        await this.asyncStorage.setItem(storageKey, encryptedValue);
        const persistedValue = await this.asyncStorage.getItem(storageKey);
        if (persistedValue !== encryptedValue) {
          throw new Error('Encrypted session migration could not be verified');
        }
        return storedValue;
      } catch (error) {
        try {
          await this.asyncStorage.setItem(storageKey, storedValue);
        } catch {
          throw new Error('Encrypted session migration failed and legacy recovery failed');
        }
        throw error;
      }
    });
  }

  async setItem(storageKey: string, value: string): Promise<void> {
    return this.serialize(async () => {
      const encryptedValue = await this.makeEnvelope(storageKey, value);
      await this.asyncStorage.setItem(storageKey, encryptedValue);
    });
  }

  async removeItem(storageKey: string): Promise<void> {
    return this.serialize(async () => {
      await this.asyncStorage.removeItem(storageKey);
    });
  }
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be configured');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new EncryptedSessionStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
