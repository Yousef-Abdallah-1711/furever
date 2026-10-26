import { PersonalSettingsScreen } from "@/components/admin/PersonalSettingsScreen";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return (
    <PersonalSettingsScreen
      email={data.user?.email ?? ""}
      fullName={
        typeof data.user?.user_metadata?.full_name === "string"
          ? data.user.user_metadata.full_name
          : ""
      }
    />
  );
}
