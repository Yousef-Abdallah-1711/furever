import { setRequestLocale } from "next-intl/server";
import { NoAccessScreen } from "@/components/auth/NoAccessScreen";

export default async function NoAccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <NoAccessScreen />;
}
