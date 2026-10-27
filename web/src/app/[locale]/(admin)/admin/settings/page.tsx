import { PersonalSettingsScreen } from "@/components/admin/PersonalSettingsScreen";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const profile = data.user
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", data.user.id)
        .maybeSingle()
    : { data: null };
  return (
    <PersonalSettingsScreen
      email={data.user?.email ?? ""}
      fullName={profile.data?.full_name ?? ""}
    />
  );
}
