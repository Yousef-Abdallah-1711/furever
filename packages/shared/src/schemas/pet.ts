import * as z from "zod";
import { petGenderSchema, speciesSchema } from "./base";

const optionalText = z.string().trim().nullable().optional();

export const petCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  species: speciesSchema,
  breed_id: z.uuid().nullable().optional(),
  gender: petGenderSchema,
  birth_date: z.iso.date().nullable().optional(),
  weight_kg: z.number().positive().nullable().optional(),
  color: optionalText,
  microchip_no: optionalText,
  is_neutered: z.boolean().nullable().optional(),
  photo_path: optionalText,
  notes: optionalText,
});

export const petUpdateSchema = petCreateSchema.partial().refine(
  (pet) => Object.keys(pet).length > 0,
  "At least one pet field must be provided",
);

export const petSchema = petCreateSchema.extend({
  id: z.uuid(),
  owner_id: z.uuid(),
  breed_id: z.uuid().nullable(),
  gender: petGenderSchema,
  birth_date: z.iso.date().nullable(),
  weight_kg: z.number().positive().nullable(),
  color: z.string().nullable(),
  microchip_no: z.string().nullable(),
  is_neutered: z.boolean().nullable(),
  photo_path: z.string().nullable(),
  notes: z.string().nullable(),
  deleted_at: z.iso.datetime().nullable(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const breedSchema = z.object({
  id: z.uuid(),
  species: speciesSchema,
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name_en: z.string().trim().min(1).max(80),
  name_ar: z.string().trim().min(1).max(80),
  is_active: z.boolean(),
});

export type PetCreateInput = z.input<typeof petCreateSchema>;
export type PetUpdateInput = z.input<typeof petUpdateSchema>;
export type Pet = z.output<typeof petSchema>;
export type Breed = z.output<typeof breedSchema>;
