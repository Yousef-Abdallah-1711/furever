"use client";

import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { ShellControls } from "@/components/ShellControls";
import { Link } from "@/i18n/navigation";
import { requestDashboardPasswordReset } from "@/lib/dashboard-auth";
import { createClient } from "@/lib/supabase/browser";

export function DashboardForgotPasswordForm() {
  const t = useTranslations("screens.auth.dashboard");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError(false);
    const redirectTo = new URL(
      `/${locale}/reset-password`,
      window.location.origin,
    ).toString();
    try {
      const ok = await requestDashboardPasswordReset(
        createClient(),
        email.trim().toLowerCase(),
        redirectTo,
      );
      if (ok) setSent(true);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-sp-6 bg-background p-sp-6 text-text-primary sm:p-sp-8">
      <ShellControls />
      <Card pad={32}>
        <h1 className="text-fs-heading font-semibold text-primary">
          {t("forgotTitle")}
        </h1>
        <p className="mt-sp-2 text-fs-body text-text-secondary">
          {t("forgotDescription")}
        </p>
        {sent ? (
          <p className="mt-sp-5 text-fs-body text-text-primary" role="status">
            {t("forgotSent")}
          </p>
        ) : (
          <form
            className="mt-sp-6 flex flex-col gap-sp-4"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <Input
              label={t("email")}
              type="email"
              inputMode="email"
              ltr
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {error ? (
              <p className="text-fs-caption text-danger" role="alert">
                {t("forgotError")}
              </p>
            ) : null}
            <Button
              block
              type="submit"
              loading={sending}
              disabled={!email.trim()}
            >
              {sending ? t("forgotSending") : t("forgotSubmit")}
            </Button>
          </form>
        )}
        <Link
          href="/login"
          className="mt-sp-5 inline-block text-fs-caption text-primary underline"
        >
          {t("returnToSignIn")}
        </Link>
      </Card>
    </main>
  );
}
