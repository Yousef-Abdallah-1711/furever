import { act, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLocale } from '..';
import { I18nProvider } from '../provider';
import ar from '../../../../packages/i18n/ar.json';
import { expect, jest, test } from '@jest/globals';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

function LocaleString() {
  const { t } = useTranslation();
  return <Text>{t('common.shellProof')}</Text>;
}

test('switching language changes a rendered mobile shell string', async () => {
  render(<I18nProvider><LocaleString /></I18nProvider>);
  await act(async () => { await changeLocale('en'); });
  expect(screen.getByText('A token-styled shell is ready.')).toBeTruthy();
  await act(async () => { await changeLocale('ar'); });
  expect(await screen.findByText(ar.common.shellProof)).toBeTruthy();
  await act(async () => { await changeLocale('en'); });
});
