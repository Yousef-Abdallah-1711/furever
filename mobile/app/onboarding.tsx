import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Stepper } from '@/components/Stepper';
import { onboardingRoutes } from '@/features/onboarding/router';

const slideKeys = [
  ['digitalHealthPassport', 'vaccinesAndRecordsForEveryPetInOnePlace'],
  ['bookingWithLiveQueue', 'bookAVisitAndWatchYourTurnInRealTime'],
  ['emergencyCare', 'find24HourVetsNearYouFast'],
] as const;

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [titleKey, bodyKey] = slideKeys[current];

  function next() {
    if (current < slideKeys.length - 1) setCurrent((step) => step + 1);
    else router.replace(onboardingRoutes.welcome);
  }

  return (
    <View className="flex-1 justify-center bg-background px-sp-6 py-sp-8">
      <View className="mx-auto w-full max-w-xl gap-sp-6">
        <Stepper steps={slideKeys.map((_, index) => String(index + 1))} current={current} />
        <Card pad={24}>
          <View className="min-h-64 justify-center gap-sp-4">
            <Text className="text-center text-fs-h2 font-semibold text-primary">
              {t(`screens.slides.${titleKey}`)}
            </Text>
            <Text className="text-center text-fs-body text-text-secondary">
              {t(`screens.slides.${bodyKey}`)}
            </Text>
          </View>
        </Card>
        <View className="flex-row gap-sp-3">
          <Button variant="secondary" onClick={() => router.replace(onboardingRoutes.welcome)}>
            {t('screens.slides.skip')}
          </Button>
          <View className="flex-1">
            <Button block onClick={next}>
              {current === slideKeys.length - 1 ? t('screens.slides.getStarted') : t('screens.slides.next')}
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}
