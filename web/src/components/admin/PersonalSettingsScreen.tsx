"use client";

import { Card } from "@/components/Card";
import { ShellControls } from "@/components/ShellControls";
import { useTranslations } from "next-intl";

export function PersonalSettingsScreen({
  email,
  fullName,
}: {
  email: string;
  fullName: string;
}) {
  const t = useTranslations("screens.admin.settings");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-sp-6 bg-background p-sp-6 text-text-primary sm:p-sp-8">
      <ShellControls />
      <header>
        <h1 className="text-fs-heading font-semibold text-primary">{t("title")}</h1>
        <p className="mt-sp-2 text-fs-body text-text-secondary">{t("description")}</p>
      </header>
      <Card pad={24}>
        <h2 className="text-fs-h3 font-semibold">{t("accountTitle")}</h2>
        <dl className="mt-sp-4 grid gap-sp-4 sm:grid-cols-2">
          <div>
            <dt className="text-fs-caption text-text-secondary">{t("name")}</dt>
            <dd className="mt-sp-1 text-fs-body">{fullName || t("notSet")}</dd>
          </div>
          <div>
            <dt className="text-fs-caption text-text-secondary">{t("email")}</dt>
            <dd dir="ltr" className="mt-sp-1 text-start text-fs-body">{email || t("notSet")}</dd>
          </div>
        </dl>
      </Card>
      <Card pad={24}>
        <h2 className="text-fs-h3 font-semibold">{t("preferencesTitle")}</h2>
        <p className="mt-sp-2 text-fs-body text-text-secondary">{t("preferencesDescription")}</p>
        <div className="mt-sp-4"><ShellControls /></div>
      </Card>
      <p className="text-fs-caption text-text-secondary">{t("securityNote")}</p>
    </main>
  );
}
