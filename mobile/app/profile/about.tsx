import Constants from "expo-constants";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { Card } from "@/components/Card";
import { ScreenHeader } from "@/components/ScreenHeader";

export default function ProfileAboutScreen() {
  const { t } = useTranslation();
  const version = Constants.expoConfig?.version;
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-sp-5 px-sp-5 py-sp-5"
    >
      <ScreenHeader title={t("screens.tabsProfile.about")} />
      <Card>
        <Text className="text-fs-h2 text-text-primary">
          {t("common.appName")}
        </Text>
        <Text className="mt-sp-2 text-fs-body text-text-secondary">
          {t("screens.tabsProfile.aboutDescription")}
        </Text>
        <View className="mt-sp-5 flex-row items-center justify-between border-t border-border pt-sp-4">
          <Text className="text-fs-body text-text-primary">
            {t("screens.tabsProfile.appVersion")}
          </Text>
          <Text selectable className="text-fs-body text-text-secondary">
            {version || t("screens.tabsProfile.versionUnavailable")}
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}
