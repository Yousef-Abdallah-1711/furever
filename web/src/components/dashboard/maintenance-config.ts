export type MaintenanceMessage = {
  enabled: boolean;
  message: string | null;
};

export function readMaintenanceMessage(
  value: unknown,
  locale: "en" | "ar",
): MaintenanceMessage | null {
  if (typeof value !== "object" || value === null || !("enabled" in value))
    return null;
  const config = value as Record<string, unknown>;
  if (typeof config.enabled !== "boolean") return null;
  if (!config.enabled) return { enabled: false, message: null };
  const localized = locale === "ar" ? config.message_ar : config.message_en;
  const fallback =
    locale === "ar"
      ? "تعمل FurEver على تحسين الخدمة. يرجى المحاولة مرة أخرى لاحقًا."
      : "FurEver is improving the service. Please try again later.";
  return {
    enabled: true,
    message:
      typeof localized === "string" && localized.trim()
        ? localized.trim()
        : fallback,
  };
}
