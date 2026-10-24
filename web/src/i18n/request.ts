import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import en from '../../../packages/i18n/en.json';
import ar from '../../../packages/i18n/ar.json';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = routing.locales.includes(requested as (typeof routing.locales)[number])
    ? (requested as (typeof routing.locales)[number])
    : routing.defaultLocale;

  return { locale, messages: locale === 'ar' ? ar : en };
});
