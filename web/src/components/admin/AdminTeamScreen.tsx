"use client";

import { EmptyState } from "@/components/EmptyState";
import { ShellControls } from "@/components/ShellControls";
import { useTranslations } from "next-intl";

type Member = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "super_admin";
  status: "active" | "suspended" | "deleted";
};

export function AdminTeamScreen({
  role,
  currentUserId,
  members,
  hasLoadError = false,
}: {
  role: "super_admin" | "admin" | "other";
  currentUserId?: string;
  members: Member[];
  hasLoadError?: boolean;
}) {
  const t = useTranslations("screens.admin.team");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-sp-6 bg-background p-sp-6 text-text-primary sm:p-sp-8">
      <ShellControls />
      <header>
        <h1 className="text-fs-heading font-semibold text-primary">{t("title")}</h1>
        <p className="mt-sp-2 text-fs-body text-text-secondary">{t("description")}</p>
      </header>
      {role !== "super_admin" ? (
        <EmptyState icon="lock" title={t("restrictedTitle")} body={t("restrictedBody")} />
      ) : hasLoadError ? (
        <p role="alert" className="rounded-r-control border border-danger p-sp-4 text-danger">
          {t("loadError")}
        </p>
      ) : members.length === 0 ? (
        <EmptyState icon="users" title={t("empty")} />
      ) : (
        <div className="overflow-x-auto rounded-r-card border border-border bg-surface">
          <table className="w-full border-collapse text-start">
            <thead>
              <tr className="border-b border-border">
                {["name", "email", "role", "status"].map((key) => (
                  <th key={key} scope="col" className="px-sp-4 py-sp-3 text-start text-fs-caption font-medium text-text-secondary">
                    {t(`columns.${key}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-border last:border-0">
                  <td className="px-sp-4 py-sp-3 text-fs-body">
                    {member.id === currentUserId
                      ? t("nameWithYou", { name: member.full_name || t("unnamed") })
                      : member.full_name || t("unnamed")}
                  </td>
                  <td dir="ltr" className="px-sp-4 py-sp-3 text-start text-fs-body">{member.email}</td>
                  <td className="px-sp-4 py-sp-3 text-fs-body">{t(`roles.${member.role}`)}</td>
                  <td className="px-sp-4 py-sp-3 text-fs-body">
                    {t(`statuses.${member.status}`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-fs-caption text-text-secondary">{t("mutationsUnavailable")}</p>
    </main>
  );
}
