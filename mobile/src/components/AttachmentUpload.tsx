import * as Crypto from 'expo-crypto';
import { File, UploadType } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { MAX_ATTACHMENT_BYTES, validateAttachment, type AttachmentKind, DOCUMENT_MIME_TYPES } from '@/features/pets/attachment-policy';
import { uploadProgressPercent } from '@/features/pets/upload-progress';

type PickedAttachment = { uri: string; name: string; mimeType: string; size: number; temporary: boolean };
type BrowserUpload = { promise: Promise<void>; cancel: () => void };

function uploadInBrowser(
  url: string,
  content: Blob,
  headers: Record<string, string>,
  onProgress: (percent: number) => void,
): BrowserUpload {
  const xhr = new XMLHttpRequest();
  const promise = new Promise<void>((resolve, reject) => {
    xhr.open('POST', url);
    for (const [name, value] of Object.entries(headers)) xhr.setRequestHeader(name, value);
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = uploadProgressPercent(event.loaded, event.total);
      if (percent !== null) onProgress(percent);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Storage upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Storage upload network error'));
    xhr.onabort = () => reject(Object.assign(new Error('Upload cancelled'), { name: 'AbortError' }));
    xhr.send(content);
  });
  return { promise, cancel: () => xhr.abort() };
}

function removeTemporaryFile(attachment: PickedAttachment | null) {
  if (!attachment?.temporary) return;
  if (Platform.OS === 'web') {
    if (attachment.uri.startsWith('blob:')) URL.revokeObjectURL(attachment.uri);
    return;
  }
  try {
    new File(attachment.uri).delete();
  } catch {
    // Cache cleanup is best effort; it must not hide the upload result.
  }
}

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
  const [uploading, setUploading] = useState(false);
  const pickedRef = useRef<PickedAttachment | null>(null);
  const nativeTaskRef = useRef<{ cancel: () => void } | null>(null);
  const browserUploadRef = useRef<BrowserUpload | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    pickedRef.current = picked;
  }, [picked]);

  useEffect(() => () => {
    nativeTaskRef.current?.cancel();
    browserUploadRef.current?.cancel();
    removeTemporaryFile(pickedRef.current);
  }, []);

  const replacePicked = (attachment: PickedAttachment | null) => {
    if (pickedRef.current?.uri !== attachment?.uri) removeTemporaryFile(pickedRef.current);
    pickedRef.current = attachment;
    setPicked(attachment);
  };

  const accept = (attachment: PickedAttachment) => {
    const validation = validateAttachment(attachment, kind);
    if (validation) {
      removeTemporaryFile(attachment);
      replacePicked(null);
      setError(t(`screens.pets.${validation}`));
      return;
    }
    replacePicked(attachment);
    setError(null);
  };

  const choose = async () => {
    if (uploading) return;
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
          temporary: true,
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
        temporary: true,
      });
    } catch {
      setError(t('screens.pets.pickFileError'));
    }
  };

  const cancelUpload = () => {
    cancelledRef.current = true;
    nativeTaskRef.current?.cancel();
    browserUploadRef.current?.cancel();
  };

  const upload = async () => {
    if (!picked || uploading) return;
    setUploading(true);
    cancelledRef.current = false;
    setProgress(0);
    setError(null);
    let storedPath: string | null = null;
    const bucket = kind === 'photo' ? 'pet-photos' : 'pet-documents';
    try {
      const { data, error: authError } = await supabase.auth.getSession();
      if (authError || !data.session?.user.id || !data.session.access_token) {
        throw new Error('Attachment upload requires an active session');
      }
      const extension = picked.mimeType === 'application/pdf' ? 'pdf'
        : picked.mimeType === 'image/png' ? 'png'
          : picked.mimeType === 'image/webp' ? 'webp' : 'jpg';
      const path = `${data.session.user.id}/${petId}/${Crypto.randomUUID()}.${extension}`;
      storedPath = path;
      const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      if (!baseUrl || !anonKey) throw new Error('Supabase upload configuration is unavailable');
      const objectUrl = `${baseUrl.replace(/\/$/, '')}/storage/v1/object/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`;
      const headers = {
        Authorization: `Bearer ${data.session.access_token}`,
        apikey: anonKey,
        'content-type': picked.mimeType,
        'cache-control': '3600',
        'x-upsert': 'false',
      };

      if (Platform.OS === 'web') {
        const response = await fetch(picked.uri);
        if (!response.ok) throw new Error('The selected file could not be read');
        const blob = await response.blob();
        if (blob.size <= 0 || blob.size > MAX_ATTACHMENT_BYTES) throw new Error('File size is outside the allowed range');
        const request = uploadInBrowser(objectUrl, blob, headers, setProgress);
        browserUploadRef.current = request;
        await request.promise;
        browserUploadRef.current = null;
      } else {
        const localFile = new File(picked.uri);
        if (localFile.size <= 0 || localFile.size > MAX_ATTACHMENT_BYTES) throw new Error('File size is outside the allowed range');
        const task = localFile.createUploadTask(objectUrl, {
          httpMethod: 'POST',
          uploadType: UploadType.BINARY_CONTENT,
          mimeType: picked.mimeType,
          headers,
          onProgress: ({ bytesSent, totalBytes }) => {
            const percent = uploadProgressPercent(bytesSent, totalBytes);
            if (percent !== null) setProgress(percent);
          },
        });
        nativeTaskRef.current = task;
        let result;
        try {
          result = await task.uploadAsync();
        } finally {
          nativeTaskRef.current = null;
          task.release();
        }
        if (result.status < 200 || result.status >= 300) throw new Error(`Storage upload failed (${result.status})`);
      }
      setProgress(100);
      await onUploaded(path);
      storedPath = null;
      replacePicked(null);
    } catch {
      if (storedPath) {
        await supabase.storage.from(bucket).remove([storedPath]).catch(() => ({ data: null, error: null }));
      }
      if (cancelledRef.current) {
        setError(null);
      } else {
        setError(t('screens.pets.uploadError'));
      }
    } finally {
      nativeTaskRef.current = null;
      browserUploadRef.current = null;
      setProgress(null);
      setUploading(false);
    }
  };

  return (
    <View className="gap-sp-3">
      <Pressable
        accessibilityRole="button"
        disabled={uploading}
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
        <View className="gap-sp-2">
          <Button onClick={() => void upload()} disabled={uploading} loading={uploading}>
            {error ? t('screens.pets.retryUpload') : t('screens.pets.uploadFile')}
          </Button>
          {uploading && progress !== 100 ? (
            <Button variant="outline" onClick={cancelUpload}>{t('screens.pets.cancelUpload')}</Button>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
