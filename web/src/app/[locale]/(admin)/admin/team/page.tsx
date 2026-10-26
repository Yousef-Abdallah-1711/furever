import { AdminTeamScreen } from "@/components/admin/AdminTeamScreen";
import { canViewPlatformAdminDirectory } from "@/lib/admin-team-access";
import { createClient } from "@/lib/supabase/server";

export default async function AdminTeamPage() {
  const supabase = await createClient();
  const { data: userResult } = await supabase.auth.getUser();
  const { data: claimsResult } = await supabase.auth.getClaims();
  const role = claimsResult?.claims?.user_role;

  if (role !== "super_admin" || !userResult.user) {
    return <AdminTeamScreen role={role === "admin" ? "admin" : "other"} members={[]} />;
  }

  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userResult.user.id)
    .maybeSingle();
  if (
    !canViewPlatformAdminDirectory({
      jwtRole: role,
      profileRole: actorProfile?.role,
      hasAuthenticatedUser: Boolean(userResult.user),
    })
  ) {
    return <AdminTeamScreen role="other" members={[]} />;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, status")
    .in("role", ["admin", "super_admin"])
    .order("full_name", { ascending: true });

  return (
    <AdminTeamScreen
      role="super_admin"
      currentUserId={userResult.user.id}
      members={data ?? []}
      hasLoadError={Boolean(error)}
    />
  );
}
