import { setRequestLocale } from "next-intl/server";
import { DashboardMfaScreen } from "@/components/auth/DashboardMfaScreen";

export default async function MfaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DashboardMfaScreen />;
}
