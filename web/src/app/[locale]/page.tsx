import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('common');

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>{t('appName')} dashboard shell · {locale}</p>
    </main>
  );
}
