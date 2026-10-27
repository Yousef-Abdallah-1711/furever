import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Share, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { LtrText } from "@/components/LtrText";
import { ScreenHeader } from "@/components/ScreenHeader";
import { linkGoogleAccount } from "@/features/account/linking";
import { supabase } from "@/lib/supabase";

type AccountData = { email: string; providers: Set<string> };

export default function AccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkMessage, setLinkMessage] = useState<
    "linked" | "conflict" | "error" | null
  >(null);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<"ready" | "error" | null>(
    null,
  );
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(false);

  const readAccount = useCallback(async (): Promise<AccountData> => {
    const [{ data: auth, error: authError }, identities] = await Promise.all([
      supabase.auth.getUser(),
      supabase.auth.getUserIdentities(),
    ]);
    if (authError || identities.error || !auth.user)
      throw new Error("account unavailable");
    const providers = new Set(
      (identities.data.identities ?? []).map((identity) => identity.provider),
    );
    return { email: auth.user.email ?? "", providers };
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const next = await readAccount();
        if (active) setAccount(next);
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [readAccount]);

  async function addGoogleAccount() {
    if (linking) return;
    setLinking(true);
    setLinkMessage(null);
    try {
      const result = await linkGoogleAccount();
      if (result.status === "cancelled") return;
      if (result.status === "conflict") {
        setLinkMessage("conflict");
        return;
      }
      if (result.status === "error") {
        setLinkMessage("error");
        return;
      }
      setAccount(await readAccount());
      setLinkMessage("linked");
    } catch {
      setLinkMessage("error");
    } finally {
      setLinking(false);
    }
  }

  async function exportData() {
    if (exporting) return;
    setExporting(true);
    setExportMessage(null);
    try {
      const { data, error } = await supabase.functions.invoke("export-my-data");
      if (error || !data) throw new Error("export unavailable");
      await Share.share({
        title: t("screens.auth.account.exportData"),
        message: JSON.stringify(data, null, 2),
      });
      setExportMessage("ready");
    } catch {
      setExportMessage("error");
    } finally {
      setExporting(false);
    }
  }

  async function logOut() {
    if (loggingOut) return;
    setLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    setLoggingOut(false);
    if (error) {
      setLogoutError(true);
      return;
    }
    router.replace("/welcome");
  }

  const accountT = (key: string) => t(`screens.auth.account.${key}`);
  const methods = [
    ["email", accountT("emailCode")],
    ["google", accountT("google")],
    ["apple", accountT("apple")],
  ] as const;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-sp-5 px-sp-5 py-sp-5"
    >
      <ScreenHeader title={accountT("title")} back={() => router.back()} />
      {loading ? (
        <ActivityIndicator accessibilityLabel={t("common.loading")} />
      ) : loadError || !account ? (
        <Text accessibilityRole="alert" className="text-fs-body text-danger">
          {t("screens.tabsProfile.profileLoadError")}
        </Text>
      ) : (
        <>
          <Card>
            <Text className="text-fs-caption text-text-secondary">
              {accountT("emailCode")}
            </Text>
            <LtrText className="mt-sp-1 text-fs-body text-text-primary">
              {account.email}
            </LtrText>
            <View className="mt-sp-4 gap-sp-3">
              {methods.map(([provider, label]) => (
                <View
                  key={provider}
                  className="flex-row items-center justify-between gap-sp-3"
                >
                  <Text className="text-fs-body text-text-primary">
                    {label}
                  </Text>
                  <Text className="text-fs-caption text-text-secondary">
                    {account.providers.has(provider)
                      ? accountT("linked")
                      : accountT("notLinked")}
                  </Text>
                </View>
              ))}
            </View>
            {!account.providers.has("google") ? (
              <View className="mt-sp-5">
                <Button
                  block
                  loading={linking}
                  disabled={linking}
                  onClick={() => void addGoogleAccount()}
                >
                  {linking
                    ? accountT("addingGoogleAccount")
                    : accountT("addGoogleAccount")}
                </Button>
              </View>
            ) : null}
            {linkMessage ? (
              <Text
                accessibilityRole={
                  linkMessage === "error" || linkMessage === "conflict"
                    ? "alert"
                    : undefined
                }
                accessibilityLiveRegion="polite"
                className={`mt-sp-3 text-fs-caption ${linkMessage === "error" || linkMessage === "conflict" ? "text-danger" : "text-success"}`}
              >
                {linkMessage === "linked"
                  ? accountT("googleAccountAdded")
                  : linkMessage === "conflict"
                    ? accountT("linkConflict")
                    : t("screens.auth.signIn.providerError")}
              </Text>
            ) : null}
          </Card>
          <Card>
            <Text className="text-fs-h3 text-text-primary">
              {accountT("exportData")}
            </Text>
            <Text className="mt-sp-2 text-fs-caption text-text-secondary">
              {accountT("exportDataDescription")}
            </Text>
            {exportMessage ? (
              <Text
                accessibilityRole={
                  exportMessage === "error" ? "alert" : undefined
                }
                accessibilityLiveRegion="polite"
                className={`mt-sp-3 text-fs-caption ${exportMessage === "error" ? "text-danger" : "text-success"}`}
              >
                {accountT(
                  exportMessage === "ready" ? "exportReady" : "exportFailed",
                )}
              </Text>
            ) : null}
            <View className="mt-sp-4">
              <Button
                block
                variant="secondary"
                loading={exporting}
                disabled={exporting}
                onClick={() => void exportData()}
              >
                {exporting
                  ? accountT("preparingExport")
                  : accountT("exportData")}
              </Button>
            </View>
          </Card>
          <Button
            block
            variant="outline"
            loading={loggingOut}
            disabled={loggingOut}
            onClick={() => void logOut()}
          >
            {loggingOut ? accountT("loggingOut") : accountT("logOut")}
          </Button>
          {logoutError ? (
            <Text
              accessibilityRole="alert"
              className="text-fs-caption text-danger"
            >
              {accountT("logOutError")}
            </Text>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}
