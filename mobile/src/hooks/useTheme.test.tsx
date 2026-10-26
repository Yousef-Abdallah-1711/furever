import { act, renderHook, waitFor } from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './useTheme';
import { trackMobileEvent } from '../lib/observability';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('nativewind', () => ({ useColorScheme: () => ({ setColorScheme: jest.fn() }) }));
jest.mock('../lib/observability', () => ({ trackMobileEvent: jest.fn() }));

test('tracks user initiated theme changes only, not hydration or unchanged values', async () => {
  jest.mocked(AsyncStorage.getItem).mockResolvedValue('light');
  const { result } = renderHook(() => useTheme());

  await waitFor(() => expect(result.current.isHydrated).toBe(true));
  expect(trackMobileEvent).not.toHaveBeenCalled();

  await act(async () => {
    await result.current.setTheme('dark');
  });
  expect(trackMobileEvent).toHaveBeenCalledTimes(1);
  expect(trackMobileEvent).toHaveBeenCalledWith('theme_changed', 'dark');

  await act(async () => {
    await result.current.setTheme('dark');
  });
  expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  expect(trackMobileEvent).toHaveBeenCalledTimes(1);
});
