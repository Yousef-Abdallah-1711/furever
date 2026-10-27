import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Card } from "@/components/Card";
import { ListRow } from "@/components/ListRow";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useLocale } from "@/hooks/useLocale";
import { supabase } from "@/lib/supabase";

type ProfileSummary = {
  full_name: string | null;
  email: string;
  city_id: string | null;
};
type City = { id: string; name_en: string; name_ar: string };

export default function ProfileTabScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { locale } = useLocale();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("profile unavailable");
      const [
        { data: row, error: profileError },
        { data: cities, error: cityError },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name,email,city_id")
          .eq("id", auth.user.id)
          .maybeSingle(),
        supabase
          .from("cities")
          .select("id,name_en,name_ar")
          .eq("is_active", true),
      ]);
      if (profileError || cityError || !row)
        throw new Error("profile unavailable");
      if (!active) return;
      setProfile(row);
      setCity((cities ?? []).find((item) => item.id === row.city_id) ?? null);
    })()
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-sp-5 px-sp-5 py-sp-5"
    >
      <ScreenHeader title={t("screens.tabsProfile.profile")} />
      {loading ? (
        <ActivityIndicator accessibilityLabel={t("common.loading")} />
      ) : error ? (
        <Text accessibilityRole="alert" className="text-fs-body text-danger">
          {t("screens.tabsProfile.profileLoadError")}
        </Text>
      ) : (
        <Card>
          <Text className="text-fs-h3 text-text-primary">
            {profile?.full_name || t("screens.tabsProfile.profileNameFallback")}
          </Text>
          <Text className="mt-sp-1 text-fs-body text-text-secondary">
            {profile?.email}
          </Text>
          {city ? (
            <Text className="mt-sp-1 text-fs-caption text-text-secondary">
              {locale === "ar" ? city.name_ar : city.name_en}
            </Text>
          ) : null}
        </Card>
      )}
      <View className="rounded-r-card bg-surface-card px-sp-4">
        <ListRow
          icon="user-round-pen"
          label={t("screens.tabsProfile.editProfile")}
          onClick={() => router.push("/profile/edit")}
        />
        <ListRow
          icon="settings-2"
          label={t("screens.tabsProfile.settings")}
          onClick={() => router.push("/profile/settings")}
        />
        <ListRow
          icon="circle-help"
          label={t("screens.tabsProfile.help")}
          onClick={() => router.push("/profile/help")}
        />
        <ListRow
          icon="info"
          label={t("screens.tabsProfile.about")}
          onClick={() => router.push("/profile/about")}
          showDivider={false}
        />
      </View>
    </ScrollView>
  );
}
