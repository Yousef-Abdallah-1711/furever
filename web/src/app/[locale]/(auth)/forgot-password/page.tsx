import { setRequestLocale } from "next-intl/server";
import { DashboardForgotPasswordForm } from "@/components/auth/DashboardForgotPasswordForm";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DashboardForgotPasswordForm />;
}
