import * as z from "zod";
import { optionalPhoneSchema } from "./base";

export const emailSchema = z.string().trim().toLowerCase().email();

export const authProfileSchema = z.object({
  email: emailSchema,
  phone: optionalPhoneSchema,
});

export type AuthProfileInput = z.input<typeof authProfileSchema>;
export type AuthProfile = z.output<typeof authProfileSchema>;
