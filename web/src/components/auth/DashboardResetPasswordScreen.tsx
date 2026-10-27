"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { ShellControls } from "@/components/ShellControls";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/browser";

type RecoveryState =
  | "checking"
  | "invalid"
  | "ready"
  | "saving"
  | "signout-error";

export function DashboardResetPasswordScreen() {
  const t = useTranslations("screens.auth.dashboard");
  const router = useRouter();
  const [state, setState] = useState<RecoveryState>("checking");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const client = createClient();
    const { data } = client.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session?.user) setState("ready");
    });
    const timeout = window.setTimeout(() => {
      setState((current) => (current === "checking" ? "invalid" : current));
    }, 8000);
    return () => {
      window.clearTimeout(timeout);
      data.subscription.unsubscribe();
    };
  }, []);

  async function signOutAndReturn() {
    const { error: signOutError } = await createClient().auth.signOut();
    if (signOutError) setState("signout-error");
    else router.replace("/login");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state !== "ready" || password.length < 6 || password !== confirmation) {
      setError(true);
      return;
    }
    setError(false);
    setState("saving");
    try {
      const { error: updateError } = await createClient().auth.updateUser({
        password,
      });
      if (updateError) {
        setError(true);
        setState("ready");
        return;
      }
      await signOutAndReturn();
    } catch {
      setError(true);
      setState("ready");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-sp-6 bg-background p-sp-6 text-text-primary sm:p-sp-8">
      <ShellControls />
      <Card pad={32}>
        <h1 className="text-fs-heading font-semibold text-primary">
          {t("resetTitle")}
        </h1>
        {state === "checking" ? (
          <p className="mt-sp-4 text-fs-body text-text-secondary">
            {t("checkingSession")}
          </p>
        ) : null}
        {state === "invalid" ? (
          <div className="mt-sp-4 flex flex-col gap-sp-3">
            <p className="text-fs-body text-text-secondary">
              {t("resetInvalid")}
            </p>
            <Link
              href="/forgot-password"
              className="text-fs-caption text-primary underline"
            >
              {t("forgotTitle")}
            </Link>
          </div>
        ) : null}
        {state === "signout-error" ? (
          <div className="mt-sp-4 flex flex-col gap-sp-3">
            <p className="text-fs-body text-text-secondary">
              {t("resetSavedSignOutError")}
            </p>
            <Button block onClick={() => void signOutAndReturn()}>
              {t("signOutAndContinue")}
            </Button>
          </div>
        ) : null}
        {state === "ready" || state === "saving" ? (
          <form
            className="mt-sp-5 flex flex-col gap-sp-4"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <Input
              label={t("newPassword")}
              type="password"
              ltr
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Input
              label={t("confirmPassword")}
              type="password"
              ltr
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
            {error ? (
              <p className="text-fs-caption text-danger" role="alert">
                {password.length < 6
                  ? t("passwordTooShort")
                  : password !== confirmation
                    ? t("passwordMismatch")
                    : t("resetError")}
              </p>
            ) : null}
            <Button
              block
              type="submit"
              loading={state === "saving"}
              disabled={!password || !confirmation}
            >
              {state === "saving" ? t("resetSaving") : t("resetSubmit")}
            </Button>
          </form>
        ) : null}
      </Card>
    </main>
  );
}
