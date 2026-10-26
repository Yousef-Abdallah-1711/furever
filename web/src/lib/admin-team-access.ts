export function canViewPlatformAdminDirectory(input: {
  jwtRole: unknown;
  profileRole: unknown;
  hasAuthenticatedUser: boolean;
}): boolean {
  return (
    input.hasAuthenticatedUser &&
    input.jwtRole === "super_admin" &&
    input.profileRole === "super_admin"
  );
}
