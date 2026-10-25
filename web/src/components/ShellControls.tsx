'use client';

import { useTheme } from 'next-themes';
import { useLocale } from 'next-intl';
import { useSyncExternalStore } from 'react';
import { Link } from '@/i18n/navigation';

const noopSubscribe = () => () => {};
/** True once running on the client, without a setState-in-effect (avoids react-hooks/set-state-in-effect). */
function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function ShellControls() {
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const otherLocale = locale === 'en' ? 'ar' : 'en';
  // Until mounted, next-themes hasn't resolved the persisted theme yet; render the
  // server's assumption (defaultTheme="light" -> "Dark" to switch) to avoid a
  // hydration mismatch between server and client text.
  const isDark = mounted && theme === 'dark';
  return (
    <div className="flex gap-3">
      <Link href="/login" locale={otherLocale} className="rounded-md border px-3 py-2" data-testid="locale-switch">
        {locale === 'en' ? 'العربية' : 'English'}
      </Link>
      <button type="button" className="rounded-md border px-3 py-2" data-testid="theme-switch"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {isDark ? 'Light' : 'Dark'}
      </button>
    </div>
  );
}
