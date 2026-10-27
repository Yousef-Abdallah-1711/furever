import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Select, type SelectOption } from "@/components/Select";
import { useLocale } from "@/hooks/useLocale";
import { optionalPhoneSchema } from "../../../packages/shared/src/schemas/base";
import { onboardingRoutes } from "@/features/onboarding/router";
import { getLegalDocuments, type LegalDocuments } from "@/features/onboarding/legal-documents";
import { supabase } from "@/lib/supabase";

type City = { id: string; name_en: string; name_ar: string };
type AppConfigResponse = { app_config?: Record<string, unknown> };

export default function CompleteProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { locale } = useLocale();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cityId, setCityId] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [legalDocuments, setLegalDocuments] = useState<LegalDocuments | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) {
        router.replace(onboardingRoutes.welcome);
        return;
      }
      const [profileResult, cityResult, configResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name,phone,city_id")
          .eq("id", auth.user.id)
          .maybeSingle(),
        supabase
          .from("cities")
          .select("id,name_en,name_ar")
          .eq("is_active", true),
        supabase.functions.invoke<AppConfigResponse>("app-config"),
      ]);
      if (profileResult.error || cityResult.error || !profileResult.data) {
        throw new Error("profile loading failed");
      }
      if (!active) return;
      setName(profileResult.data.full_name ?? "");
      setPhone(profileResult.data.phone ?? "");
      setCityId(profileResult.data.city_id ?? "");
      setCities(cityResult.data ?? []);
      setLegalDocuments(
        configResult.error
          ? null
          : getLegalDocuments(configResult.data?.app_config?.legal_documents),
      );
    })()
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [router]);

  const cityOptions = useMemo<SelectOption[]>(
    () =>
      cities.map((city) => ({
        value: city.id,
        label: locale === "ar" ? city.name_ar : city.name_en,
      })),
    [cities, locale],
  );

  async function submit() {
    if (saving) return;
    setError(null);
    const cleanName = name.trim();
    if (cleanName.length < 2) {
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
    if (!legalDocuments) {
      setError(t("screens.auth.profile.legalDocumentsUnavailable"));
      return;
    }
    if (!accepted) {
      setError(t("screens.auth.profile.termsAcceptanceRequired"));
      return;
    }

    setSaving(true);
    const { error: saveError } = await supabase.rpc("complete_owner_profile", {
      p_full_name: cleanName,
      p_city_id: cityId,
      p_phone: parsedPhone.data ?? null,
      p_accept_legal_documents: accepted,
      p_terms_version: legalDocuments.terms.version,
      p_privacy_version: legalDocuments.privacy.version,
    });
    setSaving(false);
    if (saveError) {
      setError(t("screens.tabsProfile.profileSaveError"));
      return;
    }
    router.replace(onboardingRoutes.home);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator accessibilityLabel={t("common.loading")} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-sp-5 px-sp-5 py-sp-5">
      <ScreenHeader title={t("screens.auth.profile.title")} />
      {loadError ? (
        <Text accessibilityRole="alert" className="text-fs-body text-danger">
          {t("screens.tabsProfile.profileLoadError")}
        </Text>
      ) : (
        <View className="gap-sp-4">
          <Input
            label={t("screens.auth.profile.fullName")}
            placeholder={t("screens.auth.profile.namePlaceholder")}
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={error === t("screens.auth.profile.nameRequired") ? error : undefined}
          />
          <Select
            label={t("screens.auth.profile.city")}
            placeholder={t("screens.auth.profile.selectCity")}
            value={cityId}
            options={cityOptions}
            onChange={setCityId}
            error={error === t("screens.auth.profile.cityRequired") ? error : undefined}
          />
          <Input
            label={t("screens.auth.profile.phoneOptional")}
            hint={t("screens.auth.profile.phoneHelp")}
            value={phone}
            inputMode="tel"
            ltr
            onChange={(event) => setPhone(event.target.value)}
            error={error === t("screens.auth.profile.invalidPhone") ? error : undefined}
          />
          <View className="gap-sp-2 rounded-r-card bg-surface-secondary p-sp-4">
            <View className="flex-row flex-wrap items-center gap-sp-2">
              <Pressable onPress={() => router.push("/legal/terms")}>
                <Text className="text-fs-body text-primary underline">
                  {t("screens.auth.profile.terms")}
                </Text>
              </Pressable>
              <Text className="text-fs-body text-text-secondary">·</Text>
              <Pressable onPress={() => router.push("/legal/privacy")}>
                <Text className="text-fs-body text-primary underline">
                  {t("screens.auth.profile.privacyPolicy")}
                </Text>
              </Pressable>
            </View>
            {!legalDocuments ? (
              <Text accessibilityRole="alert" className="text-fs-caption text-text-secondary">
                {t("screens.auth.profile.legalDocumentsUnavailable")}
              </Text>
            ) : (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: accepted }}
                className="flex-row items-center gap-sp-3"
                onPress={() => setAccepted((value) => !value)}
              >
                <View className={`h-sp-6 w-sp-6 items-center justify-center rounded-r-control border ${accepted ? "border-primary bg-primary" : "border-default bg-surface"}`}>
                  {accepted ? <Text className="text-on-primary">✓</Text> : null}
                </View>
                <Text className="flex-1 text-fs-body text-text-primary">
                  {t("screens.auth.profile.agreeToTermsAndPrivacy")}
                </Text>
              </Pressable>
            )}
          </View>
          {error ? (
            <Text accessibilityRole="alert" className="text-fs-body text-danger">
              {error}
            </Text>
          ) : null}
          <Button
            block
            loading={saving}
            disabled={loadError || !legalDocuments}
            onClick={() => void submit()}
          >
            {saving
              ? t("screens.auth.profile.savingProfile")
              : t("screens.auth.profile.saveAndContinue")}
          </Button>
        </View>
      )}
    </ScrollView>
  );
}
