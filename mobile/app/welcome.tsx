import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { onboardingRoutes } from '@/features/onboarding/router';
import { signInWithGoogle } from '@/features/auth/google-signin';
import { signInWithApple } from '@/features/auth/apple-signin';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);
  const [hasError, setHasError] = useState(false);

  async function continueWith(provider: 'google' | 'apple') {
    if (loading) return;
    setLoading(provider);
    setHasError(false);
    const result = provider === 'google' ? await signInWithGoogle() : await signInWithApple();
    setLoading(null);
    if (result.status === 'signed-in') router.replace(onboardingRoutes.home);
    else if (result.status === 'error') setHasError(true);
  }

  return (
    <View className="flex-1 justify-center bg-background px-sp-6 py-sp-8">
      <View className="mx-auto w-full max-w-xl items-center gap-sp-5 rounded-r-card bg-surface p-sp-8">
        <Text accessibilityRole="header" className="text-center text-fs-heading font-semibold text-primary">
          {t('screens.welcome.welcomeToFurEver')}
        </Text>
        <Text className="text-center text-fs-body text-text-secondary">
          {t('screens.welcome.theBestCareForYourFurFamily')}
        </Text>
        {hasError ? (
          <Text accessibilityRole="alert" className="text-center text-fs-caption text-danger">
            {t('screens.auth.signIn.providerError')}
          </Text>
        ) : null}
        <View className="w-full gap-sp-3">
          <Button block loading={loading === 'google'} onClick={() => void continueWith('google')}>
            {t('screens.auth.signIn.continueWithGoogle')}
          </Button>
          {Platform.OS === 'ios' ? (
            <Button block variant="secondary" loading={loading === 'apple'} onClick={() => void continueWith('apple')}>
              {t('screens.auth.signIn.continueWithApple')}
            </Button>
          ) : null}
          <Button block variant="outline" onClick={() => router.push(onboardingRoutes.signIn)}>
            {t('screens.welcome.continueWithEmail')}
          </Button>
        </View>
      </View>
    </View>
  );
}
