"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ShellControls } from "@/components/ShellControls";
import { Link, useRouter } from "@/i18n/navigation";
import { signOutAndReturnToLogin } from "@/lib/sign-out";
import { createClient } from "@/lib/supabase/browser";

export function NoAccessScreen() {
  const t = useTranslations("screens.auth.noAccess");
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setError(false);
    const ok = await signOutAndReturnToLogin(createClient(), () =>
      router.replace("/login"),
    );
    if (!ok) {
      setSigningOut(false);
      setError(true);
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
            {t("message")}
          </p>
          {error ? (
            <p className="mt-sp-4 text-fs-caption text-danger" role="alert">
              {t("signOutFailed")}
            </p>
          ) : null}
          <div className="mt-sp-6 flex flex-col gap-sp-3">
            <Button block loading={signingOut} onClick={handleSignOut}>
              {signingOut ? t("signingOut") : t("signOut")}
            </Button>
            <Link
              className="text-center text-fs-caption text-primary underline"
              href="/login"
            >
              {t("backToSignIn")}
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
