import { useQuery } from '@tanstack/react-query';
import { Image, Platform, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { supabase } from '@/lib/supabase';

export function AttachmentViewer({ path }: { path: string }) {
  const { t } = useTranslation();
  const isPdf = path.toLowerCase().endsWith('.pdf');
  const scale = useSharedValue(1);
  const animatedImageStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const pinch = Gesture.Pinch()
    // Reanimated shared values are intentionally mutated on the UI thread.
    // eslint-disable-next-line react-hooks/immutability
    .onUpdate((event) => { scale.value = Math.min(4, Math.max(1, event.scale)); })
    // eslint-disable-next-line react-hooks/immutability
    .onEnd(() => { scale.value = 1; });
  const signed = useQuery({
    queryKey: ['private-pet-document', path],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from('pet-documents').createSignedUrl(path, 300);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: Boolean(path),
    staleTime: 60_000,
    meta: { persist: false },
  });

  if (signed.isPending) return <Text accessibilityRole="progressbar" className="text-fs-body text-text-secondary">{t('common.loading')}</Text>;
  if (signed.isError || !signed.data) return <Text accessibilityRole="alert" className="text-fs-body text-text-secondary">{t('screens.pets.documentUnavailable')}</Text>;

  if (isPdf) {
    return (
      <View className="items-center gap-sp-4 rounded-r-card bg-surface p-sp-6">
        <Icon name="file-text" size={40} />
        <Text className="text-center text-fs-body text-text-primary">{t('screens.pets.pdfReady')}</Text>
        <Button onClick={() => {
          void WebBrowser.openBrowserAsync(signed.data);
        }}>{t('screens.pets.openPdf')}</Button>
      </View>
    );
  }

  const image = <Image accessibilityLabel={t('screens.pets.documentPreview')} source={{ uri: signed.data }} className="aspect-square w-full" resizeMode="contain" />;
  if (Platform.OS === 'web') return image;
  return (
    <View className="overflow-hidden rounded-r-card bg-surface-secondary">
      <GestureDetector gesture={pinch}>
        <Animated.Image accessibilityLabel={t('screens.pets.documentPreview')} source={{ uri: signed.data }} className="aspect-square w-full" resizeMode="contain" style={animatedImageStyle} />
      </GestureDetector>
    </View>
  );
}

export function DocumentAttachmentRoute() {
  const params = useLocalSearchParams<{ path?: string | string[] }>();
  const { t } = useTranslation();
  const path = Array.isArray(params.path) ? params.path.join('/') : params.path ?? '';
  const segments = path.split('/');
  const valid = segments.length === 3 && segments.every((segment) => segment && segment !== '.' && segment !== '..');

  if (!valid) return <Text accessibilityRole="alert" className="text-fs-body text-text-secondary">{t('screens.pets.documentUnavailable')}</Text>;
  return <AttachmentViewer path={path} />;
}
