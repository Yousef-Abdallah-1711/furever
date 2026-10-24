import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ShellControls } from '@/components/ShellControls';

export default async function LoginPlaceholder({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('common');
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-6 bg-background p-8 text-foreground">
      <ShellControls />
      <section className="w-full rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-primary">{t('appName')}</h1>
        <p className="mt-3 text-lg">{t('shellProof')}</p>
        <button data-testid="token-swatch" className="mt-6 rounded-md bg-primary px-5 py-3 text-primary-foreground">{t('tokenSample')}</button>
      </section>
    </main>
  );
}
