"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { ShellControls } from "@/components/ShellControls";
import { verifyTotp } from "@/lib/dashboard-auth";
import {
  enrollOwnTotp,
  listOwnTotpFactors,
  removeOwnTotp,
  type SettingsTotpFactor,
  updateOwnDisplayName,
  updateOwnPassword,
} from "@/lib/dashboard-settings";
import { createClient } from "@/lib/supabase/browser";

type Enrollment = { factorId: string; qrCode: string; secret: string };

export function PersonalSettingsScreen({
  email,
  fullName,
}: {
  email: string;
  fullName: string;
}) {
  const t = useTranslations("screens.admin.settings");
  const authT = useTranslations("screens.auth.dashboard");
  const [name, setName] = useState(fullName);
  const [savedName, setSavedName] = useState(fullName);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMessage, setProfileMessage] = useState<
    "saved" | "error" | null
  >(null);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<
    "saved" | "error" | null
  >(null);
  const [factors, setFactors] = useState<
    SettingsTotpFactor[] | null | undefined
  >(undefined);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [enrollmentCode, setEnrollmentCode] = useState("");
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [removeCode, setRemoveCode] = useState("");
  const [factorBusy, setFactorBusy] = useState(false);
  const [factorError, setFactorError] = useState(false);
  const [factorNotice, setFactorNotice] = useState<"added" | "removed" | null>(
    null,
  );

  async function refreshFactors() {
    const next = await listOwnTotpFactors(createClient());
    setFactors(next);
  }

  useEffect(() => {
    let active = true;
    void listOwnTotpFactors(createClient())
      .then((next) => {
        if (active) setFactors(next);
      })
      .catch(() => {
        if (active) setFactors(null);
      });
    return () => {
      active = false;
    };
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (profileBusy || !name.trim()) return;
    setProfileBusy(true);
    setProfileMessage(null);
    try {
      const saved = await updateOwnDisplayName(createClient(), name.trim());
      setProfileMessage(saved ? "saved" : "error");
      if (saved) setSavedName(name.trim());
    } catch {
      setProfileMessage("error");
    } finally {
      setProfileBusy(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (passwordBusy || password.length < 6 || password !== passwordConfirm)
      return;
    setPasswordBusy(true);
    setPasswordMessage(null);
    try {
      const saved = await updateOwnPassword(createClient(), password);
      setPasswordMessage(saved ? "saved" : "error");
      if (saved) {
        setPassword("");
        setPasswordConfirm("");
      }
    } catch {
      setPasswordMessage("error");
    } finally {
      setPasswordBusy(false);
    }
  }

  async function beginEnrollment() {
    setFactorBusy(true);
    setFactorError(false);
    setFactorNotice(null);
    try {
      const next = await enrollOwnTotp(createClient());
      if (!next) setFactorError(true);
      else {
        setEnrollment(next);
        setEnrollmentCode("");
      }
    } catch {
      setFactorError(true);
    } finally {
      setFactorBusy(false);
    }
  }

  async function confirmEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enrollment || factorBusy || !/^\d{6}$/.test(enrollmentCode)) return;
    setFactorBusy(true);
    setFactorError(false);
    try {
      const verified = await verifyTotp(
        createClient(),
        enrollment.factorId,
        enrollmentCode,
      );
      if (!verified) {
        setFactorError(true);
        return;
      }
      setEnrollment(null);
      setEnrollmentCode("");
      setFactorNotice("added");
      await refreshFactors();
    } catch {
      setFactorError(true);
    } finally {
      setFactorBusy(false);
    }
  }

  async function confirmRemoval(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!removeTarget || factorBusy) return;
    setFactorBusy(true);
    setFactorError(false);
    try {
      const removed = await removeOwnTotp(
        createClient(),
        removeTarget,
        removeCode,
      );
      if (!removed) {
        setFactorError(true);
        return;
      }
      setRemoveTarget(null);
      setRemoveCode("");
      setFactorNotice("removed");
      await refreshFactors();
    } catch {
      setFactorError(true);
    } finally {
      setFactorBusy(false);
    }
  }

  const verifiedFactors =
    factors?.filter((factor) => factor.status === "verified") ?? [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-sp-6 bg-background p-sp-6 text-text-primary sm:p-sp-8">
      <ShellControls />
      <header>
        <h1 className="text-fs-heading font-semibold text-primary">
          {t("title")}
        </h1>
        <p className="mt-sp-2 text-fs-body text-text-secondary">
          {t("description")}
        </p>
      </header>
      <Card pad={24}>
        <h2 className="text-fs-h3 font-semibold">{t("accountTitle")}</h2>
        <form
          className="mt-sp-4 flex flex-col gap-sp-4"
          onSubmit={(event) => void saveProfile(event)}
        >
          <Input
            label={t("name")}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <div>
            <p className="text-fs-caption text-text-secondary">{t("email")}</p>
            <p dir="ltr" className="mt-sp-1 text-start text-fs-body">
              {email || t("notSet")}
            </p>
          </div>
          {profileMessage ? (
            <p
              role={profileMessage === "error" ? "alert" : "status"}
              className={`text-fs-caption ${profileMessage === "error" ? "text-danger" : "text-success"}`}
            >
              {profileMessage === "saved"
                ? t("profileSaved")
                : t("profileError")}
            </p>
          ) : null}
          <Button
            type="submit"
            loading={profileBusy}
            disabled={!name.trim() || name.trim() === savedName}
          >
            {profileBusy ? t("saving") : t("saveProfile")}
          </Button>
        </form>
      </Card>
      <Card pad={24}>
        <h2 className="text-fs-h3 font-semibold">{t("preferencesTitle")}</h2>
        <p className="mt-sp-2 text-fs-body text-text-secondary">
          {t("preferencesDescription")}
        </p>
        <div className="mt-sp-4">
          <ShellControls />
        </div>
      </Card>
      <Card pad={24}>
        <h2 className="text-fs-h3 font-semibold">{t("passwordTitle")}</h2>
        <p className="mt-sp-2 text-fs-body text-text-secondary">
          {t("passwordDescription")}
        </p>
        <form
          className="mt-sp-4 flex flex-col gap-sp-4"
          onSubmit={(event) => void changePassword(event)}
        >
          <Input
            label={authT("newPassword")}
            type="password"
            ltr
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Input
            label={authT("confirmPassword")}
            type="password"
            ltr
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
          />
          {passwordMessage ? (
            <p
              role={passwordMessage === "error" ? "alert" : "status"}
              className={`text-fs-caption ${passwordMessage === "error" ? "text-danger" : "text-success"}`}
            >
              {passwordMessage === "saved"
                ? t("passwordSaved")
                : t("passwordError")}
            </p>
          ) : null}
          <Button
            type="submit"
            loading={passwordBusy}
            disabled={password.length < 6 || password !== passwordConfirm}
          >
            {passwordBusy ? t("saving") : t("changePassword")}
          </Button>
        </form>
      </Card>
      <Card pad={24}>
        <h2 className="text-fs-h3 font-semibold">{t("mfaTitle")}</h2>
        <p className="mt-sp-2 text-fs-body text-text-secondary">
          {t("mfaDescription")}
        </p>
        {factors === null ? (
          <p role="alert" className="mt-sp-4 text-fs-caption text-danger">
            {t("mfaLoadError")}
          </p>
        ) : null}
        {factors === null ||
        factors === undefined ? null : verifiedFactors.length ? (
          <ul className="mt-sp-4 flex flex-col gap-sp-3">
            {verifiedFactors.map((factor) => (
              <li
                key={factor.id}
                className="flex flex-wrap items-center justify-between gap-sp-3 rounded-r-control bg-surface-secondary p-sp-3"
              >
                <span className="text-fs-body">
                  {factor.friendly_name || t("authenticator")}
                </span>
                <Button
                  size="s"
                  variant="secondary"
                  onClick={() => {
                    setRemoveTarget(factor.id);
                    setRemoveCode("");
                    setFactorError(false);
                  }}
                >
                  {t("removeAuthenticator")}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-sp-4">
            <Button
              loading={factorBusy}
              disabled={factorBusy}
              onClick={() => void beginEnrollment()}
            >
              {t("addAuthenticator")}
            </Button>
          </div>
        )}
        {enrollment ? (
          <div className="mt-sp-5 flex flex-col items-center gap-sp-3">
            <Image
              src={enrollment.qrCode}
              unoptimized
              width={220}
              height={220}
              alt={authT("mfaQrCodeAlt")}
              className="rounded-r-control bg-white p-sp-2"
            />
            <p className="text-fs-caption text-text-secondary">
              {authT("mfaManualSecret")}
            </p>
            <code
              dir="ltr"
              className="select-all rounded-r-control bg-surface-secondary p-sp-3 text-fs-caption text-text-primary"
            >
              {enrollment.secret}
            </code>
            <form
              className="w-full flex flex-col gap-sp-4"
              onSubmit={(event) => void confirmEnrollment(event)}
            >
              <Input
                label={authT("mfaCode")}
                inputMode="numeric"
                ltr
                value={enrollmentCode}
                onChange={(event) =>
                  setEnrollmentCode(
                    event.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
              />
              <Button
                block
                type="submit"
                loading={factorBusy}
                disabled={factorBusy || enrollmentCode.length !== 6}
              >
                {authT("mfaConfirmEnrollment")}
              </Button>
            </form>
          </div>
        ) : null}
        {removeTarget ? (
          <form
            className="mt-sp-5 flex flex-col gap-sp-4"
            onSubmit={(event) => void confirmRemoval(event)}
          >
            <p className="text-fs-caption text-text-secondary">
              {t("confirmRemove")}
            </p>
            <Input
              label={authT("mfaCode")}
              inputMode="numeric"
              ltr
              value={removeCode}
              onChange={(event) =>
                setRemoveCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
            <div className="flex flex-wrap gap-sp-3">
              <Button
                type="submit"
                variant="secondary"
                loading={factorBusy}
                disabled={factorBusy || removeCode.length !== 6}
              >
                {t("confirmRemoveAuthenticator")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={factorBusy}
                onClick={() => {
                  setRemoveTarget(null);
                  setRemoveCode("");
                }}
              >
                {t("cancel")}
              </Button>
            </div>
          </form>
        ) : null}
        {factorError ? (
          <p role="alert" className="mt-sp-4 text-fs-caption text-danger">
            {t("mfaActionError")}
          </p>
        ) : null}
        {factorNotice ? (
          <p role="status" className="mt-sp-4 text-fs-caption text-success">
            {factorNotice === "added" ? t("mfaAdded") : t("mfaRemoved")}
          </p>
        ) : null}
      </Card>
    </main>
  );
}
