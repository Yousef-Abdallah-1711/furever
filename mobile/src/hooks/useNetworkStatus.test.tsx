import { act, renderHook } from '@testing-library/react-native';
import { NetInfoStateType, type NetInfoState } from '@react-native-community/netinfo';
import { expect, jest, test } from '@jest/globals';
import { useNetworkStatus } from './useNetworkStatus';

jest.mock('@react-native-community/netinfo', () => ({
  NetInfoStateType: { none: 'none', other: 'other' },
  addEventListener: (listener: (state: NetInfoState) => void) => {
    mockAddEventListener(listener);
    return mockUnsubscribe;
  },
}));

const mockAddEventListener = jest.fn<(listener: (state: NetInfoState) => void) => void>();
const mockUnsubscribe = jest.fn();

test('starts offline, falls back when reachability is unknown, and follows connectivity changes', () => {
  let onChange: ((state: NetInfoState) => void) | undefined;
  mockAddEventListener.mockImplementation((listener) => {
    onChange = listener;
  });
  mockUnsubscribe.mockClear();

  const { result, unmount } = renderHook(() => useNetworkStatus());

  expect(result.current.isOnline).toBe(false);

  act(() => {
    onChange?.({
      type: NetInfoStateType.other,
      isConnected: true,
      isInternetReachable: null,
      details: { isConnectionExpensive: false },
    });
  });
  expect(result.current.isOnline).toBe(true);

  act(() => {
    onChange?.({
      type: NetInfoStateType.other,
      isConnected: true,
      isInternetReachable: true,
      details: { isConnectionExpensive: false },
    });
  });
  expect(result.current.isOnline).toBe(true);

  act(() => {
    onChange?.({
      type: NetInfoStateType.none,
      isConnected: false,
      isInternetReachable: false,
      details: null,
    });
  });
  expect(result.current.isOnline).toBe(false);

  unmount();
  expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
});
