import { router } from 'expo-router';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DocumentAttachmentRoute } from '@/components/AttachmentViewer';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function DocumentViewerScreen() {
  const { t } = useTranslation();
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="flex-grow gap-sp-5 px-sp-5 py-sp-5">
      <ScreenHeader title={t('screens.pets.documentViewer')} back={() => router.back()} />
      <DocumentAttachmentRoute />
    </ScrollView>
  );
}
