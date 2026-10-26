import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";
import { Card } from "@/components/Card";
import { ScreenHeader } from "@/components/ScreenHeader";
import { supabase } from "@/lib/supabase";
import { readMinimumMobileVersion } from "@/lib/system-messages";

type AppConfigResponse = { app_config?: { min_mobile_version?: unknown } };

export default function ForceUpdateScreen() {
  const { t } = useTranslation();
  const [minimumVersion, setMinimumVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void supabase.functions
      .invoke<AppConfigResponse>("app-config")
      .then(({ data }) => {
        if (active)
          setMinimumVersion(readMinimumMobileVersion(data?.app_config));
      })
      .catch(() => {
        if (active) setMinimumVersion(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <View className="flex-1 justify-center bg-background px-sp-6 py-sp-8">
      <View className="mx-auto w-full max-w-xl gap-sp-6">
        <ScreenHeader title={t("screens.auth.platform.forceUpdateTitle")} />
        <Card pad={24}>
          <Text className="text-fs-body text-text-primary">
            {t("screens.auth.platform.forceUpdateMessage")}
          </Text>
          {loading ? (
            <View className="mt-sp-5 flex-row items-center gap-sp-3">
              <ActivityIndicator accessibilityLabel={t("common.loading")} />
              <Text className="text-fs-caption text-text-secondary">
                {t("common.loading")}
              </Text>
            </View>
          ) : minimumVersion ? (
            <Text className="mt-sp-5 text-fs-caption text-text-secondary">
              {t("screens.auth.platform.minimumMobileVersion", {
                version: minimumVersion,
              })}
            </Text>
          ) : null}
          <Text className="mt-sp-4 text-fs-caption text-text-secondary">
            {t("screens.auth.platform.updateFromStore")}
          </Text>
          <Text className="mt-sp-2 text-fs-caption text-text-secondary">
            {t("screens.auth.platform.currentMobileVersion", {
              version: Constants.expoConfig?.version ?? "—",
            })}
          </Text>
        </Card>
      </View>
    </View>
  );
}
