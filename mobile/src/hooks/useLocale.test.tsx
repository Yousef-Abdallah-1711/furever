import { act, renderHook, waitFor } from '@testing-library/react-native';
import { expect, jest, test } from '@jest/globals';
import { useLocale } from './useLocale';
import { changeLocale, readSavedLocale } from '../i18n';
import { trackMobileEvent } from '../lib/observability';

jest.mock('../i18n', () => ({
  changeLocale: jest.fn(),
  readSavedLocale: jest.fn(),
}));
jest.mock('../lib/rtl', () => ({ applyRtlForLocale: jest.fn() }));
jest.mock('../lib/observability', () => ({ trackMobileEvent: jest.fn() }));

test('tracks user initiated locale changes only, not hydration or unchanged values', async () => {
  jest.mocked(readSavedLocale).mockResolvedValue('en');
  const { result } = renderHook(() => useLocale());

  await waitFor(() => expect(result.current.isHydrated).toBe(true));
  expect(trackMobileEvent).not.toHaveBeenCalled();

  await act(async () => {
    await result.current.setLocale('ar');
  });
  expect(trackMobileEvent).toHaveBeenCalledTimes(1);
  expect(trackMobileEvent).toHaveBeenCalledWith('language_changed', 'ar');

  await act(async () => {
    await result.current.setLocale('ar');
  });
  expect(changeLocale).toHaveBeenCalledTimes(1);
  expect(trackMobileEvent).toHaveBeenCalledTimes(1);
});
