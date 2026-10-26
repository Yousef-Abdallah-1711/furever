import Constants from "expo-constants";
import { type Href, Redirect, Tabs, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { Icon } from "@/components/Icon";
import { type GuardRoute, getProtectedRouteRedirect } from "@/lib/route-guard";
import { supabase } from "@/lib/supabase";

type AppConfigResponse = {
  app_config?: {
    maintenance?: unknown;
    min_mobile_version?: unknown;
  };
};

async function loadGuardRedirect(): Promise<GuardRoute> {
  try {
    const { data: userResult, error: authError } =
      await supabase.auth.getUser();
    if (authError || !userResult.user) {
      return getProtectedRouteRedirect({
        session: authError ? "expired" : "missing",
        profile: "unknown",
        configuration: "failed",
        currentVersion: Constants.expoConfig?.version ?? "",
      });
    }

    const [
      { data: profile, error: profileError },
      { data: consentRows, error: consentError },
      configResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("status,full_name,city_id")
        .eq("id", userResult.user.id)
        .maybeSingle(),
      supabase
        .from("consents")
        .select("type")
        .eq("user_id", userResult.user.id)
        .in("type", ["terms", "privacy"]),
      supabase.functions.invoke<AppConfigResponse>("app-config"),
    ]);

    if (profileError || consentError || !profile) {
      return getProtectedRouteRedirect({
        session: "valid",
        profile: "unknown",
        configuration: "failed",
        currentVersion: Constants.expoConfig?.version ?? "",
      });
    }

    const types = new Set((consentRows ?? []).map((row) => row.type));
    const profileState =
      profile.status === "suspended"
        ? "suspended"
        : profile.status === "deleted"
          ? "deleted"
          : profile.status !== "active"
            ? "unknown"
            : profile.full_name?.trim() &&
                profile.city_id &&
                types.has("terms") &&
                types.has("privacy")
              ? "complete"
              : "incomplete";

    const config = configResult.data?.app_config;
    const maintenance = config?.maintenance;
    const maintenanceEnabled =
      typeof maintenance === "object" && maintenance !== null
        ? (maintenance as Record<string, unknown>).enabled
        : undefined;
    const minimumVersion = config?.min_mobile_version;
    const configurationValid =
      !configResult.error &&
      typeof config === "object" &&
      config !== null &&
      (maintenance === undefined || typeof maintenanceEnabled === "boolean") &&
      (minimumVersion === undefined ||
        (typeof minimumVersion === "object" &&
          minimumVersion !== null &&
          typeof (minimumVersion as Record<string, unknown>).version ===
            "string"));

    return getProtectedRouteRedirect({
      session: "valid",
      profile: profileState,
      configuration: configurationValid ? "loaded" : "failed",
      currentVersion: Constants.expoConfig?.version ?? "",
      minimumVersion,
      maintenanceEnabled,
    });
  } catch {
    return "/welcome";
  }
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [authGeneration, setAuthGeneration] = useState(0);
  const [guard, setGuard] = useState<{
    pathname: string;
    generation: number;
    redirect: GuardRoute;
  } | null>(null);

  useEffect(() => {
    let current = true;
    void loadGuardRedirect().then((redirect) => {
      if (current) setGuard({ pathname, generation: authGeneration, redirect });
    });
    return () => {
      current = false;
    };
  }, [authGeneration, pathname]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      // Incrementing this generation immediately hides the prior authorized
      // view; the next effect verifies the new session after the callback.
      setAuthGeneration((generation) => generation + 1);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  if (
    !guard ||
    guard.pathname !== pathname ||
    guard.generation !== authGeneration
  ) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator accessibilityLabel={t("common.loading")} />
      </View>
    );
  }
  // This guard runs only inside (tabs); every destination is outside that
  // route group, so redirected screens cannot be caught in a guard loop.
  if (guard.redirect) return <Redirect href={guard.redirect as Href} />;

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.tabs.home"),
          tabBarIcon: ({ size }) => <Icon name="house" size={size} />,
        }}
      />
      <Tabs.Screen
        name="pets"
        options={{
          title: t("nav.tabs.pets"),
          tabBarIcon: ({ size }) => <Icon name="paw-print" size={size} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: t("nav.tabs.bookings"),
          tabBarIcon: ({ size }) => <Icon name="calendar-days" size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("nav.tabs.profile"),
          tabBarIcon: ({ size }) => <Icon name="user-round" size={size} />,
        }}
      />
    </Tabs>
  );
}
