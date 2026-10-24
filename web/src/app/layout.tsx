import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "FurEver",
  description: "FurEver clinic dashboard",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html
      suppressHydrationWarning
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
