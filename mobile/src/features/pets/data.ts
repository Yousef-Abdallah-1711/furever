import type { Breed, Pet, PetCreateInput, PetUpdateInput } from '@furever/shared';
import { breedSchema, petCreateSchema, petSchema, petUpdateSchema } from '@furever/shared';
import { supabase } from '@/lib/supabase';

export const petQueryKeys = {
  all: ['pets'] as const,
  breeds: (species: string) => ['pets', 'breeds', species] as const,
  detail: (id: string) => ['pets', 'detail', id] as const,
};

export async function listMyPets(): Promise<Pet[]> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => petSchema.parse(row));
}

export async function getPet(id: string): Promise<Pet> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Pet unavailable');
  return petSchema.parse(data);
}

export async function listBreeds(species: PetCreateInput['species']): Promise<Breed[]> {
  const { data, error } = await supabase
    .from('breeds')
    .select('id,species,slug,name_en,name_ar,is_active')
    .eq('species', species)
    .eq('is_active', true)
    .order('name_en');
  if (error) throw error;
  return (data ?? []).map((row) => breedSchema.parse(row));
}

export async function createPet(input: PetCreateInput): Promise<Pet> {
  const payload = petCreateSchema.parse(input);
  const { data, error } = await supabase
    .from('pets')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return petSchema.parse(data);
}

export async function updatePet(id: string, input: PetUpdateInput): Promise<Pet> {
  const payload = petUpdateSchema.parse(input);
  const { data, error } = await supabase
    .from('pets')
    .update(payload)
    .eq('id', id)
    .is('deleted_at', null)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Pet unavailable');
  return petSchema.parse(data);
}

export async function updatePetPhoto(id: string, photoPath: string): Promise<Pet> {
  return updatePet(id, { photo_path: photoPath });
}

export async function softDeletePet(id: string): Promise<void> {
  const { error } = await supabase.rpc('delete_pet', { p_pet_id: id });
  if (error) throw error;
}
