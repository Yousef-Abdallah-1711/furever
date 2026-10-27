import * as Crypto from 'expo-crypto';
import { File, UploadType } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Platform, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { MAX_ATTACHMENT_BYTES, validateAttachment, type AttachmentKind, DOCUMENT_MIME_TYPES } from '@/features/pets/attachment-policy';

type PickedAttachment = { uri: string; name: string; mimeType: string; size: number };

export function AttachmentUpload({
  petId,
  kind,
  onUploaded,
}: {
  petId: string;
  kind: AttachmentKind;
  onUploaded: (path: string) => void | Promise<void>;
}) {
  const { t } = useTranslation();
  const [picked, setPicked] = useState<PickedAttachment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const accept = (attachment: PickedAttachment) => {
    const validation = validateAttachment(attachment, kind);
    if (validation) {
      setError(t(`screens.pets.${validation}`));
      return;
    }
    setPicked(attachment);
    setError(null);
  };

  const choose = async () => {
    setError(null);
    try {
      if (kind === 'photo') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.88,
        });
        if (result.canceled || !result.assets[0]) return;
        const asset = result.assets[0];
        const compressed = await ImageManipulator.manipulateAsync(asset.uri, [
          { resize: { width: Math.min(asset.width || 1600, 1600) } },
        ], {
          format: ImageManipulator.SaveFormat.JPEG,
          compress: 0.82,
        });
        const size = Platform.OS === 'web'
          ? (await (await fetch(compressed.uri)).blob()).size
          : new File(compressed.uri).size;
        accept({
          uri: compressed.uri,
          name: `pet-${petId}.jpg`,
          mimeType: 'image/jpeg',
          size,
        });
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: [...DOCUMENT_MIME_TYPES],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      accept({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? '',
        size: asset.size ?? 0,
      });
    } catch {
      setError(t('screens.pets.pickFileError'));
    }
  };

  const upload = async () => {
    if (!picked) return;
    setProgress(0);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.getSession();
      if (authError || !data.session?.user.id || !data.session.access_token) {
        throw new Error('Attachment upload requires an active session');
      }
      const extension = picked.mimeType === 'application/pdf' ? 'pdf'
        : picked.mimeType === 'image/png' ? 'png'
          : picked.mimeType === 'image/webp' ? 'webp' : 'jpg';
      const path = `${data.session.user.id}/${petId}/${Crypto.randomUUID()}.${extension}`;
      const bucket = kind === 'photo' ? 'pet-photos' : 'pet-documents';
      if (Platform.OS === 'web') {
        setProgress(25);
        const response = await fetch(picked.uri);
        if (!response.ok) throw new Error('The selected file could not be read');
        const bytes = await response.arrayBuffer();
        if (bytes.byteLength > MAX_ATTACHMENT_BYTES) throw new Error('File exceeds the size limit');
        setProgress(50);
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, bytes, {
          contentType: picked.mimeType,
          cacheControl: '3600',
          upsert: false,
        });
        if (uploadError) throw uploadError;
      } else {
        const localFile = new File(picked.uri);
        const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
        if (!baseUrl || !anonKey) throw new Error('Supabase upload configuration is unavailable');
        const objectUrl = `${baseUrl.replace(/\/$/, '')}/storage/v1/object/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`;
        const task = localFile.createUploadTask(objectUrl, {
          httpMethod: 'POST',
          uploadType: UploadType.BINARY_CONTENT,
          mimeType: picked.mimeType,
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
            apikey: anonKey,
            'x-upsert': 'false',
          },
          onProgress: ({ bytesSent, totalBytes }) => {
            if (totalBytes > 0) setProgress(Math.min(99, Math.round((bytesSent / totalBytes) * 100)));
          },
        });
        let response;
        try {
          response = await task.uploadAsync();
        } finally {
          task.release();
        }
        if (!response || response.status < 200 || response.status >= 300) {
          throw new Error('Storage rejected the upload');
        }
      }
      setProgress(100);
      await onUploaded(path);
      setProgress(100);
      setPicked(null);
    } catch {
      setProgress(null);
      setError(t('screens.pets.uploadError'));
    }
  };

  return (
    <View className="gap-sp-3">
      <Pressable
        accessibilityRole="button"
        onPress={() => void choose()}
        className="min-h-sp-12 flex-row items-center justify-center rounded-r-control border border-default bg-surface px-sp-4 py-sp-3"
      >
        <Text className="text-fs-button text-primary">
          {picked?.name ?? t(kind === 'photo' ? 'screens.pets.choosePhoto' : 'screens.pets.chooseDocument')}
        </Text>
      </Pressable>
      {kind === 'photo' && picked ? (
        <Image accessibilityLabel={t('screens.pets.photoPreview')} source={{ uri: picked.uri }} className="h-48 w-full rounded-r-card" resizeMode="cover" />
      ) : null}
      {progress !== null ? (
        <View className="gap-sp-1" accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: progress }}>
          <View className="h-sp-2 overflow-hidden rounded-full bg-surface-secondary">
            <View className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </View>
          <Text className="text-fs-caption text-text-secondary">{progress === 100 ? t('screens.pets.uploadComplete') : `${progress}%`}</Text>
        </View>
      ) : null}
      {error ? <Text accessibilityRole="alert" className="text-fs-caption text-danger">{error}</Text> : null}
      {picked ? (
        <Button onClick={() => void upload()} loading={progress !== null && progress < 100}>
          {error ? t('screens.pets.retryUpload') : t('screens.pets.uploadFile')}
        </Button>
      ) : null}
    </View>
  );
}
