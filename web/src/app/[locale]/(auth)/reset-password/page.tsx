import { setRequestLocale } from "next-intl/server";
import { DashboardResetPasswordScreen } from "@/components/auth/DashboardResetPasswordScreen";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DashboardResetPasswordScreen />;
}
