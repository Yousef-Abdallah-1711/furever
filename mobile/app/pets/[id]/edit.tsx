import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { petGenderSchema, type PetUpdateInput } from '@furever/shared';
import { useTranslation } from 'react-i18next';
import { AttachmentUpload } from '@/components/AttachmentUpload';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DateField } from '@/components/DateField';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/Input';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Select } from '@/components/Select';
import { getPet, listBreeds, petQueryKeys, softDeletePet, updatePet } from '@/features/pets/data';
import { useLocale } from '@/hooks/useLocale';
import { useOfflineGuardedAction } from '@/hooks/useOfflineGuardedAction';
import { supabase } from '@/lib/supabase';
import { useOwnerId } from '@/features/pets/useOwnerId';

export default function EditPetScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { t } = useTranslation();
  const { locale } = useLocale();
  const queryClient = useQueryClient();
  const owner = useOwnerId();
  const petQuery = useQuery({ queryKey: petQueryKeys.detail(owner.data ?? 'signed-out', id ?? ''), queryFn: () => getPet(id!), enabled: Boolean(id && owner.data) });
  const [changes, setChanges] = useState<PetUpdateInput>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const breeds = useQuery({ queryKey: petQueryKeys.breeds(petQuery.data?.species ?? 'cat'), queryFn: () => listBreeds(petQuery.data?.species ?? 'cat'), enabled: Boolean(petQuery.data) });
  const saveMutation = useMutation({ mutationFn: (input: PetUpdateInput) => updatePet(id!, input) });
  const deleteMutation = useMutation({ mutationFn: () => softDeletePet(id!) });
  const form: PetUpdateInput | null = petQuery.data ? {
    name: petQuery.data.name,
    species: petQuery.data.species,
    breed_id: petQuery.data.breed_id,
    gender: petQuery.data.gender,
    birth_date: petQuery.data.birth_date,
    weight_kg: petQuery.data.weight_kg,
    color: petQuery.data.color,
    microchip_no: petQuery.data.microchip_no,
    is_neutered: petQuery.data.is_neutered,
    notes: petQuery.data.notes,
    photo_path: petQuery.data.photo_path,
    ...changes,
  } : null;
  const photo = useQuery({
    queryKey: ['private-pet-photo', petQuery.data?.photo_path],
    queryFn: async () => {
      const path = petQuery.data?.photo_path;
      if (!path) return null;
      const { data, error } = await supabase.storage.from('pet-photos').createSignedUrl(path, 300);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: Boolean(petQuery.data?.photo_path),
    staleTime: 60_000,
    meta: { persist: false },
  });
  const deleteAction = useOfflineGuardedAction(() => {
    setError(null);
    deleteMutation.mutate(undefined, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: petQueryKeys.all });
        router.replace('/(tabs)/pets');
      },
      onError: () => setError(t('screens.pets.deletePetError')),
    });
  });
  const saveAction = useOfflineGuardedAction(() => {
    if (!form) return;
    setError(null);
    saveMutation.mutate(form, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: petQueryKeys.all });
        await petQuery.refetch();
      },
      onError: () => setError(t('screens.pets.saveError')),
    });
  });

  const update = <K extends keyof PetUpdateInput>(key: K, value: PetUpdateInput[K]) => setChanges((current) => ({ ...current, [key]: value }));
  if (owner.isPending || (owner.data && petQuery.isPending)) return <View className="flex-1 items-center justify-center bg-background"><Text className="text-fs-body text-text-secondary">{t('common.loading')}</Text></View>;
  if (owner.isError || !owner.data || petQuery.isError || !petQuery.data || !form || !id) return <View className="flex-1 justify-center bg-background px-sp-5"><EmptyState icon="triangle-alert" title={t('screens.pets.documentUnavailable')} tone="danger" action={t('screens.pets.backToPets')} onAction={() => router.replace('/(tabs)/pets')} /></View>;

  const gender = petGenderSchema.parse(form.gender ?? petQuery.data.gender);
  const breedOptions = [
    { value: '', label: t('screens.pets.noBreed') },
    ...(breeds.data ?? []).map((breed) => ({ value: breed.id, label: locale === 'ar' ? breed.name_ar : breed.name_en })),
  ];

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-sp-5 px-sp-5 py-sp-5">
      <ScreenHeader title={t('screens.pets.editPet')} back={() => router.back()} />
      <Input label={t('screens.pets.petName')} value={form.name ?? ''} onChange={(event) => update('name', event.target.value)} />
      <Select label={t('screens.pets.breed')} value={form.breed_id ?? ''} options={breedOptions} onChange={(value) => update('breed_id', value || null)} />
      <Select label={t('screens.pets.gender')} value={gender} options={petGenderSchema.options.map((item) => ({ value: item, label: t(`screens.pets.${item === 'unknown' ? 'unknownGender' : item}`) }))} onChange={(value) => update('gender', petGenderSchema.parse(value))} />
      <DateField label={t('screens.pets.birthDate')} value={form.birth_date ?? undefined} onChange={(value) => update('birth_date', value)} maximumDate={new Date().toISOString().slice(0, 10)} />
      <Input label={t('screens.pets.weight')} value={form.weight_kg?.toString() ?? ''} inputMode="numeric" onChange={(event) => update('weight_kg', event.target.value.trim() ? Number(event.target.value) : null)} />
      <Input label={t('screens.pets.color')} value={form.color ?? ''} onChange={(event) => update('color', event.target.value)} />
      <Input label={t('screens.pets.microchipNumber')} value={form.microchip_no ?? ''} onChange={(event) => update('microchip_no', event.target.value)} ltr />
      <Input label={t('screens.pets.notes')} value={form.notes ?? ''} onChange={(event) => update('notes', event.target.value)} />
      {photo.data ? <Image source={{ uri: photo.data }} accessibilityLabel={t('screens.pets.photoPreview')} className="h-48 w-full rounded-r-card" resizeMode="cover" /> : null}
      <Text className="text-fs-h3 font-semibold text-text-primary">{t('screens.pets.photo')}</Text>
      <AttachmentUpload petId={id} kind="photo" onUploaded={async (path) => {
        const previousPath = petQuery.data.photo_path;
        try {
          await updatePet(id, { photo_path: path });
        } catch (uploadError) {
          await supabase.storage.from('pet-photos').remove([path]);
          throw uploadError;
        }
        if (previousPath) await supabase.storage.from('pet-photos').remove([previousPath]);
        await Promise.allSettled([
          queryClient.invalidateQueries({ queryKey: petQueryKeys.all }),
          queryClient.invalidateQueries({ queryKey: petQueryKeys.detail(owner.data ?? '', id) }),
          petQuery.refetch(),
        ]);
      }} />
      <Button block disabled={saveAction.disabled} loading={saveMutation.isPending} onClick={saveAction.onPress}>{t('common.saveChanges')}</Button>
      {saveAction.disabledReason ? <Text className="text-fs-caption text-text-secondary">{t('screens.pets.offlineSubmitReason')}</Text> : null}
      {error ? <Text accessibilityRole="alert" className="text-fs-caption text-danger">{error}</Text> : null}
      <Card>
        <Text className="text-fs-body text-text-secondary">{t('screens.pets.deleteBookingWarning')}</Text>
      </Card>
      {confirmDelete ? (
        <Card>
          <Text className="text-fs-body text-text-primary">{t('screens.pets.confirmDeletePet')}</Text>
          <Text className="mt-sp-2 text-fs-caption text-text-secondary">{t('screens.pets.deleteBookingWarning')}</Text>
          <View className="mt-sp-3 flex-row gap-sp-3">
            <Button variant="destructive" disabled={deleteAction.disabled} loading={deleteMutation.isPending} onClick={deleteAction.onPress}>{t('screens.pets.deletePet')}</Button>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>{t('screens.pets.cancel')}</Button>
          </View>
          {deleteAction.disabledReason ? <Text className="mt-sp-2 text-fs-caption text-text-secondary">{t('screens.pets.offlineSubmitReason')}</Text> : null}
        </Card>
      ) : <Button variant="destructive" onClick={() => setConfirmDelete(true)}>{t('screens.pets.deletePet')}</Button>}
    </ScrollView>
  );
}
