import { Stack } from "expo-router";
import { ProtectedRouteLayout } from "@/components/ProtectedRouteLayout";

export default function ProfileLayout() {
  return (
    <ProtectedRouteLayout>
      <Stack screenOptions={{ headerShown: false }} />
    </ProtectedRouteLayout>
  );
}
