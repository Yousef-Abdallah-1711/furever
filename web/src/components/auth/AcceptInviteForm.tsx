"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { ShellControls } from "@/components/ShellControls";
import { Link, useRouter } from "@/i18n/navigation";
import { acceptStaffInvitation } from "@/lib/accept-staff-invitation";
import { createClient } from "@/lib/supabase/browser";

type PageStatus =
  | "checking"
  | "ready"
  | "missing-session"
  | "submitting"
  | "complete";

export function AcceptInviteForm() {
  const t = useTranslations("screens.auth.acceptInvite");
  const router = useRouter();
  const [status, setStatus] = useState<PageStatus>("checking");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void createClient()
      .auth.getUser()
      .then(({ data, error: authError }) => {
        if (active)
          setStatus(authError || !data.user ? "missing-session" : "ready");
      })
      .catch(() => {
        if (active) setStatus("missing-session");
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "ready") return;
    setError(null);
    setStatus("submitting");
    const client = createClient();
    const result = await acceptStaffInvitation(
      client,
      password,
      confirmation,
      () => {
        setStatus("complete");
        router.replace("/clinic");
      },
    );
    if (!result.ok) {
      setStatus("ready");
      setError(
        result.reason === "password_mismatch"
          ? t("passwordMismatch")
          : result.reason === "password_too_short"
            ? t("passwordTooShort")
            : result.reason === "session_missing"
              ? t("invalidInvitation")
              : t("acceptanceFailed"),
      );
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-sp-6 bg-background p-sp-6 text-text-primary sm:p-sp-8">
      <ShellControls />
      <div className="w-full">
        <Card pad={32}>
          <h1 className="text-fs-heading font-semibold text-primary">
            {t("title")}
          </h1>
          <p className="mt-sp-3 text-fs-body text-text-secondary">
            {t("description")}
          </p>

          {status === "checking" ? (
            <p className="mt-sp-6" role="status">
              {t("checkingInvitation")}
            </p>
          ) : null}
          {status === "missing-session" ? (
            <div className="mt-sp-6 space-y-sp-4" role="alert">
              <p>{t("invalidInvitation")}</p>
              <Link className="text-primary underline" href="/login">
                {t("signIn")}
              </Link>
            </div>
          ) : null}
          {status === "ready" || status === "submitting" ? (
            <form
              className="mt-sp-6 flex flex-col gap-sp-4"
              onSubmit={handleSubmit}
            >
              <Input
                label={t("password")}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                ltr
                disabled={status === "submitting"}
                hint={t("passwordHint")}
              />
              <Input
                label={t("confirmPassword")}
                type="password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                ltr
                disabled={status === "submitting"}
              />
              {error ? (
                <p className="text-fs-caption text-danger" role="alert">
                  {error}
                </p>
              ) : null}
              <Button
                type="submit"
                block
                loading={status === "submitting"}
                disabled={password.length < 6 || confirmation.length < 6}
              >
                {status === "submitting" ? t("accepting") : t("setPassword")}
              </Button>
            </form>
          ) : null}
          {status === "complete" ? (
            <p className="mt-sp-6" role="status">
              {t("success")}
            </p>
          ) : null}
        </Card>
      </div>
    </main>
  );
}
