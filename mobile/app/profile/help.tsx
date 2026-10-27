import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { Card } from "@/components/Card";
import { Icon } from "@/components/Icon";
import { ScreenHeader } from "@/components/ScreenHeader";
import { supabase } from "@/lib/supabase";

type SupportContacts = { email?: string; phone?: string; whatsapp?: string };
type ConfigResponse = { app_config?: { support?: unknown } };

function readSupportContacts(value: unknown): SupportContacts {
  if (typeof value !== "object" || value === null) return {};
  const source = value as Record<string, unknown>;
  return {
    email:
      typeof source.email === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(source.email)
        ? source.email
        : undefined,
    phone:
      typeof source.phone === "string" &&
      /^\+?[0-9][0-9 ()-]{4,20}$/.test(source.phone)
        ? source.phone
        : undefined,
    whatsapp: typeof source.whatsapp === "string" ? source.whatsapp : undefined,
  };
}

function safeWhatsappUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      ["wa.me", "api.whatsapp.com"].includes(url.hostname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export default function ProfileHelpScreen() {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<SupportContacts>({});
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [contactError, setContactError] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.functions
      .invoke<ConfigResponse>("app-config")
      .then(({ data, error }) => {
        if (active && !error)
          setContacts(readSupportContacts(data?.app_config?.support));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  async function openContact(url: string) {
    try {
      await Linking.openURL(url);
      setContactError(false);
    } catch {
      setContactError(true);
    }
  }

  const faq = [
    [
      "language",
      t("screens.tabsProfile.faqLanguageQuestion"),
      t("screens.tabsProfile.faqLanguageAnswer"),
    ],
    [
      "profile",
      t("screens.tabsProfile.faqProfileQuestion"),
      t("screens.tabsProfile.faqProfileAnswer"),
    ],
  ] as const;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-sp-5 px-sp-5 py-sp-5"
    >
      <ScreenHeader title={t("screens.tabsProfile.help")} />
      <Text className="text-fs-body text-text-secondary">
        {t("screens.tabsProfile.helpDescription")}
      </Text>
      {faq.map(([id, question, answer]) => (
        <Card key={id} pad={0}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: openFaq === id }}
            onPress={() => setOpenFaq(openFaq === id ? null : id)}
            className="flex-row items-center justify-between gap-sp-3 p-sp-4"
          >
            <Text className="flex-1 text-fs-body font-semibold text-text-primary">
              {question}
            </Text>
            <Icon name={openFaq === id ? "chevron-up" : "chevron-down"} />
          </Pressable>
          {openFaq === id ? (
            <Text className="px-sp-4 pb-sp-4 text-fs-body text-text-secondary">
              {answer}
            </Text>
          ) : null}
        </Card>
      ))}
      <View className="gap-sp-2">
        <Text className="text-fs-h3 text-text-primary">
          {t("screens.tabsProfile.contactSupport")}
        </Text>
        {contacts.email ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void openContact(`mailto:${contacts.email}`)}
            className="rounded-r-card bg-surface-card p-sp-4"
          >
            <Text className="text-fs-body text-primary">
              {t("screens.tabsProfile.supportEmail", { email: contacts.email })}
            </Text>
          </Pressable>
        ) : null}
        {contacts.phone ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              void openContact(`tel:${contacts.phone?.replace(/[^+0-9]/g, "")}`)
            }
            className="rounded-r-card bg-surface-card p-sp-4"
          >
            <Text className="text-fs-body text-primary">
              {t("screens.tabsProfile.supportPhone", { phone: contacts.phone })}
            </Text>
          </Pressable>
        ) : null}
        {safeWhatsappUrl(contacts.whatsapp) ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              void openContact(safeWhatsappUrl(contacts.whatsapp) as string)
            }
            className="rounded-r-card bg-surface-card p-sp-4"
          >
            <Text className="text-fs-body text-primary">
              {t("screens.tabsProfile.supportWhatsapp")}
            </Text>
          </Pressable>
        ) : null}
        {!contacts.email &&
        !contacts.phone &&
        !safeWhatsappUrl(contacts.whatsapp) ? (
          <Text className="text-fs-caption text-text-secondary">
            {t("screens.tabsProfile.noSupportContacts")}
          </Text>
        ) : null}
        {contactError ? (
          <Text
            accessibilityRole="alert"
            className="text-fs-caption text-danger"
          >
            {t("screens.tabsProfile.contactOpenError")}
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}
