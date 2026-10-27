"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { ShellControls } from "@/components/ShellControls";
import { Link, useRouter } from "@/i18n/navigation";
import { prepareTotp, verifyTotp } from "@/lib/dashboard-auth";
import { createClient } from "@/lib/supabase/browser";

type SetupState =
  | { kind: "checking" }
  | { kind: "error" }
  | { kind: "enroll"; factorId: string; qrCode: string; secret: string }
  | { kind: "verify"; factorId: string };
type SetupResult = SetupState | { kind: "redirect"; path: string };

export function DashboardMfaScreen() {
  const t = useTranslations("screens.auth.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const [setup, setSetup] = useState<SetupState>({ kind: "checking" });
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const setupPromise = useRef<Promise<SetupResult> | null>(null);

  useEffect(() => {
    let active = true;
    setupPromise.current ??= (async (): Promise<SetupResult> => {
      const client = createClient();
      const { data: auth, error: authError } = await client.auth.getUser();
      if (authError || !auth.user) return { kind: "redirect", path: "/login" };
      const claims = await client.auth.getClaims();
      const role = claims.data?.claims?.user_role;
      if (claims.error || (role !== "admin" && role !== "super_admin")) {
        return {
          kind: "redirect",
          path: role === "clinic_staff" ? "/clinic" : "/no-access",
        };
      }
      const assurance = await client.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assurance.error) throw assurance.error;
      if (assurance.data.currentLevel === "aal2")
        return { kind: "redirect", path: "/admin" };
      const next = await prepareTotp(client);
      if (!next) throw new Error("TOTP setup unavailable");
      return next;
    })();
    void setupPromise.current
      .then((result) => {
        if (!active) return;
        if (result.kind === "redirect") router.replace(result.path);
        else setSetup(result);
      })
      .catch(() => {
        if (active) setSetup({ kind: "error" });
      });
    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (setup.kind !== "enroll" && setup.kind !== "verify") return;
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      const supabase = createClient();
      const valid = await verifyTotp(supabase, setup.factorId, code.trim());
      if (!valid) {
        setError(true);
        return;
      }
      const [user, assurance] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      ]);
      if (
        user.error ||
        !user.data.user ||
        assurance.error ||
        assurance.data.currentLevel !== "aal2"
      ) {
        setError(true);
        return;
      }
      // A full request carries the newly persisted AAL2 cookie through middleware.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/${locale}/admin`);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  const ready = setup.kind === "enroll" || setup.kind === "verify";
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-sp-6 bg-background p-sp-6 text-text-primary sm:p-sp-8">
      <ShellControls />
      <Card pad={32}>
        <h1 className="text-fs-heading font-semibold text-primary">
          {setup.kind === "enroll" ? t("mfaEnrollTitle") : t("mfaVerifyTitle")}
        </h1>
        <p className="mt-sp-2 text-fs-body text-text-secondary">
          {setup.kind === "enroll"
            ? t("mfaEnrollDescription")
            : t("mfaVerifyDescription")}
        </p>
        {setup.kind === "checking" ? (
          <p className="mt-sp-5 text-fs-caption text-text-secondary">
            {t("checkingSession")}
          </p>
        ) : null}
        {setup.kind === "error" ? (
          <div className="mt-sp-5 flex flex-col gap-sp-4">
            <p className="text-fs-caption text-danger" role="alert">
              {t("mfaSetupError")}
            </p>
            <Link
              href="/login"
              className="text-fs-caption text-primary underline"
            >
              {t("returnToSignIn")}
            </Link>
          </div>
        ) : null}
        {setup.kind === "enroll" ? (
          <div className="mt-sp-5 flex flex-col items-center gap-sp-3">
            {/* Supabase returns an SVG data URI, so the QR stays local and the TOTP secret is not sent to a third party. */}
            <Image
              src={setup.qrCode.trimEnd()}
              unoptimized
              width={220}
              height={220}
              alt={t("mfaQrCodeAlt")}
              className="rounded-r-control bg-white p-sp-2"
            />
            <p className="text-fs-caption text-text-secondary">
              {t("mfaManualSecret")}
            </p>
            <code
              dir="ltr"
              className="select-all rounded-r-control bg-surface-secondary p-sp-3 text-fs-caption text-text-primary"
            >
              {setup.secret}
            </code>
          </div>
        ) : null}
        {ready ? (
          <form
            className="mt-sp-5 flex flex-col gap-sp-4"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <Input
              label={t("mfaCode")}
              inputMode="numeric"
              ltr
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
            {error ? (
              <p className="text-fs-caption text-danger" role="alert">
                {t("mfaCodeError")}
              </p>
            ) : null}
            <Button
              block
              type="submit"
              loading={busy}
              disabled={code.length !== 6}
            >
              {busy
                ? t("mfaVerifying")
                : setup.kind === "enroll"
                  ? t("mfaConfirmEnrollment")
                  : t("mfaVerify")}
            </Button>
          </form>
        ) : null}
      </Card>
    </main>
  );
}
