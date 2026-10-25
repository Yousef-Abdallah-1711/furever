import { act, renderHook } from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import { useOfflineGuardedAction } from './useOfflineGuardedAction';

let mockIsOnline = false;
const mockTranslate = jest.fn<(key: string) => string>();

jest.mock('./useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isOnline: mockIsOnline }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockTranslate }),
}));

test('blocks offline presses and exposes then clears the localized disabled reason', () => {
  mockIsOnline = false;
  mockTranslate.mockReturnValue("You're offline. Connect to continue.");
  const handler = jest.fn<(value: string) => void>();
  const { result, rerender } = renderHook(() => useOfflineGuardedAction(handler));
  const heldOnPress = result.current.onPress;

  expect(result.current.disabled).toBe(true);
  expect(result.current.disabledReason).toBe("You're offline. Connect to continue.");
  expect(mockTranslate).toHaveBeenCalledWith('common.offlineActionRequiresConnection');

  act(() => heldOnPress('offline'));
  expect(handler).not.toHaveBeenCalled();

  mockIsOnline = true;
  rerender(undefined);

  expect(result.current.disabled).toBe(false);
  expect(result.current.disabledReason).toBeNull();
  act(() => result.current.onPress('online'));
  expect(handler).toHaveBeenCalledWith('online');

  mockIsOnline = false;
  rerender(undefined);
  act(() => heldOnPress('stale offline'));
  expect(handler).toHaveBeenCalledTimes(1);
});
