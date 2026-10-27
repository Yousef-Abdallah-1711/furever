import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { ProtectedRouteLayout } from "@/components/ProtectedRouteLayout";

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <ProtectedRouteLayout>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="home"
          options={{
            title: t("nav.tabs.home"),
            tabBarIcon: ({ size }) => <Icon name="house" size={size} />,
          }}
        />
        <Tabs.Screen
          name="pets"
          options={{
            title: t("nav.tabs.pets"),
            tabBarIcon: ({ size }) => <Icon name="paw-print" size={size} />,
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: t("nav.tabs.bookings"),
            tabBarIcon: ({ size }) => <Icon name="calendar-days" size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t("nav.tabs.profile"),
            tabBarIcon: ({ size }) => <Icon name="user-round" size={size} />,
          }}
        />
      </Tabs>
    </ProtectedRouteLayout>
  );
}
