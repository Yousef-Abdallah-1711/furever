"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { ShellControls } from "@/components/ShellControls";
import { useRouter } from "@/i18n/navigation";
import { signInDashboard } from "@/lib/dashboard-auth";
import { createClient } from "@/lib/supabase/browser";

export function DashboardLoginForm() {
  const t = useTranslations("screens.auth.dashboard");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(false);
    setLoading(true);
    try {
      const result = await signInDashboard(
        createClient(),
        email.trim().toLowerCase(),
        password,
      );
      if (result.ok) router.replace(result.destination);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-sp-6 bg-background p-sp-6 text-text-primary sm:p-sp-8">
      <ShellControls />
      <Card pad={32}>
        <h1 className="text-fs-heading font-semibold text-primary">
          {t("loginTitle")}
        </h1>
        <p className="mt-sp-2 text-fs-body text-text-secondary">
          {t("loginDescription")}
        </p>
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
          <Input
            label={t("password")}
            type="password"
            ltr
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? (
            <p className="text-fs-caption text-danger" role="alert">
              {t("loginError")}
            </p>
          ) : null}
          <Button
            block
            type="submit"
            loading={loading}
            disabled={!email.trim() || !password}
          >
            {loading ? t("signingIn") : t("signIn")}
          </Button>
        </form>
      </Card>
    </main>
  );
}
