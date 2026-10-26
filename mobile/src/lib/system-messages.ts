export type SystemAppConfig = {
  maintenance?: unknown;
  min_mobile_version?: unknown;
};

export function readMinimumMobileVersion(
  config: SystemAppConfig | null | undefined,
): string | null {
  const value = config?.min_mobile_version;
  if (typeof value !== "object" || value === null) return null;
  const version = (value as Record<string, unknown>).version;
  return typeof version === "string" && /^\d+\.\d+\.\d+$/.test(version)
    ? version
    : null;
}

export function readMaintenanceMessage(
  config: SystemAppConfig | null | undefined,
  locale: string,
): string | null {
  const value = config?.maintenance;
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const message = record[locale === "ar" ? "message_ar" : "message_en"];
  return typeof message === "string" &&
    message.trim().length > 0 &&
    message.length <= 500
    ? message.trim()
    : null;
}
