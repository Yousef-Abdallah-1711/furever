import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { speciesSchema, petGenderSchema, type PetCreateInput, type Pet } from '@furever/shared';
import { useTranslation } from 'react-i18next';
import { AttachmentUpload } from '@/components/AttachmentUpload';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DateField } from '@/components/DateField';
import { Input } from '@/components/Input';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Select } from '@/components/Select';
import { createPet, listBreeds, petQueryKeys, updatePet } from '@/features/pets/data';
import { useOfflineGuardedAction } from '@/hooks/useOfflineGuardedAction';
import { useLocale } from '@/hooks/useLocale';

const speciesValues = speciesSchema.options;
const genderValues = petGenderSchema.options;

export default function AddPetScreen() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [created, setCreated] = useState<Pet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<PetCreateInput>({ name: '', species: 'cat', gender: 'unknown' });
  const breeds = useQuery({ queryKey: petQueryKeys.breeds(form.species), queryFn: () => listBreeds(form.species) });
  const mutation = useMutation({ mutationFn: createPet });
  const createAction = useOfflineGuardedAction(() => {
    setError(null);
    mutation.mutate(form, {
      onSuccess: (pet) => {
        setCreated(pet);
        void queryClient.invalidateQueries({ queryKey: petQueryKeys.all });
      },
      onError: () => setError(t('screens.pets.saveError')),
    });
  });

  const update = <K extends keyof PetCreateInput>(key: K, value: PetCreateInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
  const stepNames = [t('screens.pets.species'), t('screens.pets.basicsStep'), t('screens.pets.detailsStep'), t('screens.pets.photoStep')];
  const speciesOptions = speciesValues.map((species) => ({ value: species, label: t(`screens.pets.${species === 'other' ? 'otherSpecies' : species}`) }));
  const breedOptions = [
    { value: '', label: t('screens.pets.noBreed') },
    ...(breeds.data ?? []).map((breed) => ({ value: breed.id, label: locale === 'ar' ? breed.name_ar : breed.name_en })),
  ];
  const genderOptions = genderValues.map((gender) => ({
    value: gender,
    label: t(`screens.pets.${gender === 'unknown' ? 'unknownGender' : gender}`),
  }));

  const content = () => {
    if (created) {
      return (
        <View className="gap-sp-4">
          <Card tint>
            <Text className="text-fs-h3 font-semibold text-text-primary">{t('screens.pets.petSaved')}</Text>
            <Text className="mt-sp-2 text-fs-body text-text-secondary">{created.name}</Text>
          </Card>
          <Text className="text-fs-body text-text-primary">{t('screens.pets.addPhotoNow')}</Text>
          <AttachmentUpload
            petId={created.id}
            kind="photo"
            onUploaded={async (path) => {
              let updated: Pet;
              try {
                updated = await updatePet(created.id, { photo_path: path });
              } catch (uploadError) {
                await (await import('@/lib/supabase')).supabase.storage.from('pet-photos').remove([path]);
                throw uploadError;
              }
              setCreated(updated);
              await Promise.allSettled([
                queryClient.invalidateQueries({ queryKey: petQueryKeys.all }),
              ]);
            }}
          />
          <Button variant="outline" onClick={() => router.replace('/(tabs)/pets')}>{t('screens.pets.done')}</Button>
        </View>
      );
    }
    if (step === 0) {
      return <Select label={t('screens.pets.species')} value={form.species} options={speciesOptions} onChange={(value) => {
        const nextSpecies = speciesSchema.parse(value);
        setForm((current) => ({ ...current, species: nextSpecies, breed_id: null }));
      }} />;
    }
    if (step === 1) {
      return (
        <View className="gap-sp-4">
          <Input label={t('screens.pets.petName')} value={form.name} onChange={(event) => update('name', event.target.value)} placeholder={t('screens.pets.petNamePlaceholder')} />
          <Select label={t('screens.pets.gender')} value={form.gender} options={genderOptions} onChange={(value) => update('gender', petGenderSchema.parse(value))} />
          <Select label={t('screens.pets.breed')} value={form.breed_id ?? ''} options={breedOptions} placeholder={t('screens.pets.selectBreed')} onChange={(value) => update('breed_id', value || null)} />
          {breeds.isError ? <Text accessibilityRole="alert" className="text-fs-caption text-danger">{t('screens.pets.breedsLoadError')}</Text> : null}
          <DateField label={t('screens.pets.birthDate')} value={form.birth_date ?? undefined} onChange={(value) => update('birth_date', value)} placeholder={t('screens.pets.birthDateOptional')} maximumDate={new Date().toISOString().slice(0, 10)} />
        </View>
      );
    }
    if (step === 2) {
      return (
        <View className="gap-sp-4">
          <Input label={t('screens.pets.weight')} value={form.weight_kg?.toString() ?? ''} inputMode="numeric" onChange={(event) => update('weight_kg', event.target.value.trim() ? Number(event.target.value) : null)} placeholder={t('screens.pets.weightOptional')} />
          <Input label={t('screens.pets.color')} value={form.color ?? ''} onChange={(event) => update('color', event.target.value)} />
          <Input label={t('screens.pets.microchipNumber')} value={form.microchip_no ?? ''} onChange={(event) => update('microchip_no', event.target.value)} ltr />
          <Input label={t('screens.pets.notes')} value={form.notes ?? ''} onChange={(event) => update('notes', event.target.value)} />
        </View>
      );
    }
    return (
      <View className="gap-sp-4">
        <Card>
          <Text className="text-fs-h3 font-semibold text-text-primary">{t('screens.pets.reviewDetails')}</Text>
          <Text className="mt-sp-2 text-fs-body text-text-primary">{form.name || t('screens.pets.petName')}</Text>
          <Text className="text-fs-caption text-text-secondary">{t(`screens.pets.${form.species === 'other' ? 'otherSpecies' : form.species}`)} · {t(`screens.pets.${form.gender === 'unknown' ? 'unknownGender' : form.gender}`)}</Text>
        </Card>
        <Text className="text-fs-body text-text-secondary">{t('screens.pets.photoWillBeAddedAfterSave')}</Text>
        <Button block disabled={createAction.disabled} loading={mutation.isPending} onClick={createAction.onPress}>{t('screens.pets.savePet')}</Button>
        {createAction.disabledReason ? <Text className="text-fs-caption text-text-secondary">{t('screens.pets.offlineSubmitReason')}</Text> : null}
        {error ? <Text accessibilityRole="alert" className="text-fs-caption text-danger">{error}</Text> : null}
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-sp-5 px-sp-5 py-sp-5">
      <ScreenHeader title={created ? t('screens.pets.petSaved') : t('screens.pets.addPet')} back={() => created ? router.replace('/(tabs)/pets') : step > 0 ? setStep(step - 1) : router.back()} />
      {!created ? (
        <View className="gap-sp-2">
          <View className="h-sp-2 overflow-hidden rounded-full bg-surface-secondary"><View className="h-full rounded-full bg-primary" style={{ width: `${((step + 1) / 4) * 100}%` }} /></View>
          <Text className="text-fs-caption text-text-secondary">{t('screens.pets.stepOf', { current: step + 1, total: 4 })} · {stepNames[step]}</Text>
        </View>
      ) : null}
      {content()}
      {!created && step < 3 ? <Button block onClick={() => {
        if (step === 1 && !form.name.trim()) { setError(t('screens.pets.nameRequired')); return; }
        setError(null);
        setStep((current) => current + 1);
      }}>{t('screens.pets.continue')}</Button> : null}
      {!created && step > 0 ? <Button variant="ghost" onClick={() => setStep((current) => current - 1)}>{t('screens.pets.back')}</Button> : null}
      {!created && error ? <Text accessibilityRole="alert" className="text-fs-caption text-danger">{error}</Text> : null}
    </ScrollView>
  );
}
