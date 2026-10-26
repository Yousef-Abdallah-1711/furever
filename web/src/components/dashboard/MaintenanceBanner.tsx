import { getLocale } from "next-intl/server";
import { Banner } from "@/components/Banner";
import { createClient } from "@/lib/supabase/server";
import { readMaintenanceMessage } from "./maintenance-config";

export async function MaintenanceBanner() {
  const locale = (await getLocale()) === "ar" ? "ar" : "en";
  let value: unknown;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "maintenance")
      .maybeSingle();
    if (error) return null;
    value = data?.value;
  } catch {
    return null;
  }
  const maintenance = readMaintenanceMessage(value, locale);
  if (!maintenance?.enabled || !maintenance.message) return null;
  return (
    <div className="px-sp-6 pt-sp-4" role="status">
      <Banner tone="warning">{maintenance.message}</Banner>
    </div>
  );
}
