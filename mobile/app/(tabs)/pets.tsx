import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Skeleton } from '@/components/Skeleton';
import { petQueryKeys, listMyPets, listBreeds } from '@/features/pets/data';
import { useLocale } from '@/hooks/useLocale';
import { supabase } from '@/lib/supabase';
import { useOwnerId } from '@/features/pets/useOwnerId';

function PetPhoto({ path, name }: { path: string | null; name: string }) {
  const { t } = useTranslation();
  const photo = useQuery({
    queryKey: ['private-pet-photo', path],
    queryFn: async () => {
      if (!path) return null;
      const { data, error } = await supabase.storage.from('pet-photos').createSignedUrl(path, 300);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: Boolean(path),
    staleTime: 60_000,
    meta: { persist: false },
  });
  return photo.data
    ? <Image source={{ uri: photo.data }} accessibilityLabel={t('screens.pets.photoPreview')} className="h-16 w-16 rounded-r-control bg-surface-secondary" />
    : <View className="h-16 w-16 items-center justify-center rounded-r-control bg-surface-secondary"><Text className="text-fs-h3 text-primary">{name.slice(0, 1).toLocaleUpperCase()}</Text></View>;
}

export default function PetsTabScreen() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const owner = useOwnerId();
  const pets = useQuery({
    queryKey: petQueryKeys.list(owner.data ?? 'signed-out'),
    queryFn: listMyPets,
    enabled: Boolean(owner.data),
    meta: { persist: true },
  });
  const breeds = useQuery({ queryKey: ['pets', 'breeds', 'all'], queryFn: async () => {
    const species = ['cat', 'dog', 'bird', 'rabbit', 'other'] as const;
    const catalogs = await Promise.all(species.map((item) => listBreeds(item)));
    return catalogs.flat();
  } });
  const breedNames = new Map((breeds.data ?? []).map((breed) => [breed.id, locale === 'ar' ? breed.name_ar : breed.name_en]));

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-sp-5 px-sp-5 py-sp-5">
      <ScreenHeader title={t('screens.pets.myPets')} right={<Button size="s" icon="plus" onClick={() => router.push('/pets/new')}>{t('screens.pets.addPet')}</Button>} />
      <OfflineBanner />
      {owner.isPending || pets.isPending ? (
        <View className="gap-sp-3"><Skeleton w="100%" h={88} /><Skeleton w="100%" h={88} /></View>
      ) : owner.isError || !owner.data || (pets.isError && !pets.data) ? (
        <EmptyState icon="triangle-alert" title={t('screens.pets.loadError')} action={t('screens.pets.retry')} onAction={() => void (owner.isError || !owner.data ? owner.refetch() : pets.refetch())} tone="danger" />
      ) : pets.data.length === 0 ? (
        <EmptyState icon="paw-print" title={t('screens.pets.noPetsYet')} body={t('screens.pets.addYourFirstPetToStartAHealthPassport')} action={t('screens.pets.addPet')} onAction={() => router.push('/pets/new')} />
      ) : (
        <View className="gap-sp-3">
          {pets.data.map((pet) => (
            <Pressable key={pet.id} accessibilityRole="button" accessibilityLabel={`${pet.name}, ${t(`screens.pets.${pet.species === 'other' ? 'otherSpecies' : pet.species}`)}`} onPress={() => router.push(`/pets/${pet.id}/edit`)}>
              <Card pad={12}>
                <View className="flex-row items-center gap-sp-4">
                  <PetPhoto path={pet.photo_path} name={pet.name} />
                  <View className="min-w-0 flex-1 gap-sp-1">
                    <Text className="text-fs-h3 font-semibold text-text-primary" numberOfLines={1}>{pet.name}</Text>
                    <Text className="text-fs-caption text-text-secondary" numberOfLines={1}>{pet.breed_id ? breedNames.get(pet.breed_id) : t(`screens.pets.${pet.species === 'other' ? 'otherSpecies' : pet.species}`)}</Text>
                  </View>
                  <Text className="text-fs-h3 text-text-secondary">›</Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
