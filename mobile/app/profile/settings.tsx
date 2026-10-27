import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useTokenColor } from "@/lib/resolveTokenColor";
import { supabase } from "@/lib/supabase";

type PreferenceKey = "vaccination_reminders" | "booking_updates" | "offers";
type Preferences = Record<PreferenceKey, boolean>;
const keys: PreferenceKey[] = [
  "vaccination_reminders",
  "booking_updates",
  "offers",
];

export default function ProfileSettingsScreen() {
  const { t } = useTranslation();
  const primaryColor = useTokenColor("primary");
  const trackColor = useTokenColor("surface-secondary");
  const thumbColor = useTokenColor("surface-card");
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [busy, setBusy] = useState<PreferenceKey | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("session unavailable");
      const { data, error: queryError } = await supabase
        .from("profiles")
        .select("notif_prefs")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (queryError || !data) throw new Error("preferences unavailable");
      const saved = data.notif_prefs as Partial<Preferences> | null;
      if (active)
        setPreferences(
          Object.fromEntries(
            keys.map((key) => [key, saved?.[key] ?? true]),
          ) as Preferences,
        );
    })().catch(() => {
      if (active) setError(true);
    });
    return () => {
      active = false;
    };
  }, []);

  async function toggle(key: PreferenceKey) {
    if (!preferences || busy) return;
    const next = { ...preferences, [key]: !preferences[key] };
    setBusy(key);
    setError(false);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setError(true);
      setBusy(null);
      return;
    }
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ notif_prefs: next })
      .eq("id", auth.user.id);
    if (updateError) setError(true);
    else setPreferences(next);
    setBusy(null);
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-sp-5 px-sp-5 py-sp-5"
    >
      <ScreenHeader title={t("screens.tabsProfile.settings")} />
      <View className="rounded-r-card bg-surface-card px-sp-4">
        {keys.map((key, index) => (
          <View
            key={key}
            className={`${index ? "border-t border-border" : ""} min-h-[var(--sp-12)] flex-row items-center justify-between gap-sp-4 py-sp-3`}
          >
            <Text className="flex-1 text-fs-body text-text-primary">
              {t(`screens.tabsProfile.${key}`)}
            </Text>
            {busy === key ? (
              <ActivityIndicator accessibilityLabel={t("common.loading")} />
            ) : (
              <Switch
                accessibilityLabel={t(`screens.tabsProfile.${key}`)}
                value={Boolean(preferences?.[key])}
                disabled={!preferences || busy !== null}
                onValueChange={() => void toggle(key)}
                trackColor={{ false: trackColor, true: primaryColor }}
                thumbColor={thumbColor}
              />
            )}
          </View>
        ))}
      </View>
      {error ? (
        <Text accessibilityRole="alert" className="text-fs-body text-danger">
          {t("screens.tabsProfile.settingsError")}
        </Text>
      ) : null}
    </ScrollView>
  );
}
