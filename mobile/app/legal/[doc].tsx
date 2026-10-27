import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useLocale } from "@/hooks/useLocale";
import { getLegalDocuments, type LegalDocument, type LegalDocuments } from "@/features/onboarding/legal-documents";
import { supabase } from "@/lib/supabase";

type AppConfigResponse = { app_config?: Record<string, unknown> };
type LegalDocKind = "terms" | "privacy";

export default function LegalDocumentScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const kind: LegalDocKind | null = doc === "terms" || doc === "privacy" ? doc : null;

  useEffect(() => {
    let active = true;
    void supabase.functions
      .invoke<AppConfigResponse>("app-config")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setFailed(true);
          return;
        }
        const documents: LegalDocuments | null = getLegalDocuments(
          data?.app_config?.legal_documents,
        );
        if (kind && documents) setDocument(documents[kind]);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [kind]);

  const title =
    kind === "terms"
      ? t("screens.auth.profile.terms")
      : kind === "privacy"
        ? t("screens.auth.profile.privacyPolicy")
        : t("screens.auth.profile.title");
  const content = document
    ? locale === "ar"
      ? document.content_ar
      : document.content_en
    : null;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-sp-5 px-sp-5 py-sp-5">
      <ScreenHeader title={title} back={() => router.back()} />
      {loading ? (
        <View className="items-center py-sp-8">
          <ActivityIndicator accessibilityLabel={t("common.loading")} />
        </View>
      ) : content ? (
        <View className="gap-sp-3 rounded-r-card bg-surface p-sp-5">
          <Text className="text-fs-caption text-text-secondary">
            {document?.version}
          </Text>
          <Text
            className="text-start text-fs-body text-text-primary"
            style={{ writingDirection: locale === "ar" ? "rtl" : "ltr" }}
          >
            {content}
          </Text>
        </View>
      ) : (
        <Text accessibilityRole="alert" className="text-fs-body text-text-secondary">
          {failed
            ? t("screens.tabsProfile.profileLoadError")
            : t("screens.auth.profile.legalDocumentsUnavailable")}
        </Text>
      )}
    </ScrollView>
  );
}
