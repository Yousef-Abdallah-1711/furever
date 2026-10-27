import Constants from "expo-constants";
import { type Href, Redirect, usePathname } from "expo-router";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { loadProtectedRouteRedirect } from "@/lib/route-guard-runtime";
import { supabase } from "@/lib/supabase";

type AppConfigResponse = {
  app_config?: {
    maintenance?: unknown;
    min_mobile_version?: unknown;
  };
};

export function ProtectedRouteLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [authGeneration, setAuthGeneration] = useState(0);
  const [guard, setGuard] = useState<{
    pathname: string;
    generation: number;
    redirect: Awaited<ReturnType<typeof loadProtectedRouteRedirect>>;
  } | null>(null);

  useEffect(() => {
    let current = true;
    void loadProtectedRouteRedirect({
      currentVersion: Constants.expoConfig?.version ?? "",
      getUser: async () => {
        const { data, error } = await supabase.auth.getUser();
        return { user: data.user, failed: Boolean(error) };
      },
      getProfile: async (userId) => {
        const { data, error } = await supabase
          .from("profiles")
          .select("status,deleted_at,full_name,city_id")
          .eq("id", userId)
          .maybeSingle();
        return { profile: data, failed: Boolean(error) };
      },
      getConsentTypes: async (userId) => {
        const { data, error } = await supabase
          .from("consents")
          .select("type")
          .eq("user_id", userId)
          .in("type", ["terms", "privacy"]);
        return {
          types: (data ?? []).map((row) => row.type),
          failed: Boolean(error),
        };
      },
      getConfiguration: async () => {
        const { data, error } =
          await supabase.functions.invoke<AppConfigResponse>("app-config");
        return { response: data, failed: Boolean(error) };
      },
    }).then((redirect) => {
      if (current) setGuard({ pathname, generation: authGeneration, redirect });
    });
    return () => {
      current = false;
    };
  }, [authGeneration, pathname]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(() => {
      setAuthGeneration((generation) => generation + 1);
    });
    return () => data.subscription.unsubscribe();
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
  if (guard.redirect) return <Redirect href={guard.redirect as Href} />;
  return children;
}
