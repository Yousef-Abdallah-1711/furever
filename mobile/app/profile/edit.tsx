import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Select, type SelectOption } from "@/components/Select";
import { useLocale } from "@/hooks/useLocale";
import { supabase } from "@/lib/supabase";
import { optionalPhoneSchema } from "../../../packages/shared/src/schemas/base";

type City = { id: string; name_en: string; name_ar: string };

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { locale } = useLocale();
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cityId, setCityId] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("session unavailable");
      const [
        { data: profile, error: profileError },
        { data: cityRows, error: cityError },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name,phone,city_id")
          .eq("id", auth.user.id)
          .maybeSingle(),
        supabase
          .from("cities")
          .select("id,name_en,name_ar")
          .eq("is_active", true),
      ]);
      if (profileError || cityError || !profile)
        throw new Error("profile unavailable");
      if (!active) return;
      setUserId(auth.user.id);
      setName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setCityId(profile.city_id ?? "");
      setCities(cityRows ?? []);
    })()
      .catch(() => {
        if (active) setError(t("screens.tabsProfile.profileLoadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [t]);

  const cityOptions = useMemo<SelectOption[]>(
    () =>
      cities.map((city) => ({
        value: city.id,
        label: locale === "ar" ? city.name_ar : city.name_en,
      })),
    [cities, locale],
  );

  async function save() {
    if (!userId || saving) return;
    setSaved(false);
    setError(null);
    const cleanName = name.trim();
    if (!cleanName) {
      setError(t("screens.auth.profile.nameRequired"));
      return;
    }
    if (!cityId) {
      setError(t("screens.auth.profile.cityRequired"));
      return;
    }
    const parsedPhone = optionalPhoneSchema.safeParse(phone.trim());
    if (!parsedPhone.success) {
      setError(t("screens.auth.profile.invalidPhone"));
      return;
    }
    setSaving(true);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: cleanName,
        city_id: cityId,
        phone: parsedPhone.data ?? null,
      })
      .eq("id", userId)
      .select("id")
      .single();
    if (updateError) setError(t("screens.tabsProfile.profileSaveError"));
    else {
      setSaved(true);
      router.back();
    }
    setSaving(false);
  }

  if (loading)
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator accessibilityLabel={t("common.loading")} />
      </View>
    );

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-sp-5 px-sp-5 py-sp-5"
    >
      <ScreenHeader
        title={t("screens.tabsProfile.editProfile")}
        back={() => router.back()}
      />
      <View className="gap-sp-4">
        <Input
          label={t("screens.auth.profile.fullName")}
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={!name.trim() && error ? error : undefined}
        />
        <Select
          label={t("screens.auth.profile.city")}
          placeholder={t("screens.auth.profile.selectCity")}
          value={cityId}
          options={cityOptions}
          onChange={setCityId}
          error={!cityId && error ? error : undefined}
        />
        <Input
          label={t("screens.auth.profile.phoneOptional")}
          hint={t("screens.auth.profile.phoneHelp")}
          value={phone}
          inputMode="tel"
          ltr
          onChange={(event) => setPhone(event.target.value)}
          error={
            error === t("screens.auth.profile.invalidPhone") ? error : undefined
          }
        />
        {error &&
        error !== t("screens.auth.profile.nameRequired") &&
        error !== t("screens.auth.profile.cityRequired") &&
        error !== t("screens.auth.profile.invalidPhone") ? (
          <Text accessibilityRole="alert" className="text-fs-body text-danger">
            {error}
          </Text>
        ) : null}
        {saved ? (
          <Text accessibilityRole="alert" className="text-fs-body text-success">
            {t("screens.auth.profile.profileSaved")}
          </Text>
        ) : null}
        <Button block loading={saving} onClick={() => void save()}>
          {saving
            ? t("screens.auth.profile.savingProfile")
            : t("screens.tabsProfile.saveChanges")}
        </Button>
      </View>
    </ScrollView>
  );
}
