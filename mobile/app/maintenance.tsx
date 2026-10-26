import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";
import { Card } from "@/components/Card";
import { ScreenHeader } from "@/components/ScreenHeader";
import { supabase } from "@/lib/supabase";
import { readMaintenanceMessage } from "@/lib/system-messages";

type AppConfigResponse = { app_config?: { maintenance?: unknown } };

export default function MaintenanceScreen() {
  const { t, i18n } = useTranslation();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void supabase.functions
      .invoke<AppConfigResponse>("app-config")
      .then(({ data }) => {
        if (active)
          setMessage(readMaintenanceMessage(data?.app_config, i18n.language));
      })
      .catch(() => {
        if (active) setMessage(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [i18n.language]);

  return (
    <View className="flex-1 justify-center bg-background px-sp-6 py-sp-8">
      <View className="mx-auto w-full max-w-xl gap-sp-6">
        <ScreenHeader title={t("screens.auth.platform.maintenanceTitle")} />
        <Card pad={24}>
          <Text className="text-fs-body text-text-primary">
            {message ?? t("screens.auth.platform.maintenanceMessage")}
          </Text>
          {loading ? (
            <View className="mt-sp-5 flex-row items-center gap-sp-3">
              <ActivityIndicator accessibilityLabel={t("common.loading")} />
              <Text className="text-fs-caption text-text-secondary">
                {t("common.loading")}
              </Text>
            </View>
          ) : null}
        </Card>
      </View>
    </View>
  );
}
