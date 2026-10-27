import { setRequestLocale } from "next-intl/server";
import { DashboardLoginForm } from "@/components/auth/DashboardLoginForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DashboardLoginForm />;
}
