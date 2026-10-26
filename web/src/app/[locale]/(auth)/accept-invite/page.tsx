import { setRequestLocale } from "next-intl/server";
import { AcceptInviteForm } from "@/components/auth/AcceptInviteForm";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AcceptInviteForm />;
}
