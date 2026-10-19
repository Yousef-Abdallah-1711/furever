import * as z from "zod";

export const phoneSchema = z.string().regex(/^\+[1-9][0-9]{7,14}$/);

export const moneySchema = z.object({
  price_minor: z.number().int().nonnegative(),
  currency: z.literal("EGP"),
});

export const appRoleSchema = z.enum(["owner", "clinic_staff", "admin", "super_admin"]);
export const userStatusSchema = z.enum(["active", "suspended", "deleted"]);
export const staffLevelSchema = z.enum(["manager", "vet", "receptionist"]);
export const speciesSchema = z.enum(["cat", "dog", "bird", "rabbit", "other"]);
export const petGenderSchema = z.enum(["male", "female", "unknown"]);
export const recordTypeSchema = z.enum(["visit", "allergy", "medication", "surgery", "lab", "note"]);
export const recordSourceSchema = z.enum(["self", "clinic"]);
export const clinicStatusSchema = z.enum(["pending", "active", "suspended"]);
export const appointmentTypeSchema = z.enum(["in_clinic", "video"]);
export const appointmentStatusSchema = z.enum([
  "pending",
  "confirmed",
  "checked_in",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
]);
export const paymentStatusSchema = z.enum(["unpaid", "pay_at_clinic", "paid", "refunded"]);
export const ticketStatusSchema = z.enum(["waiting", "called", "in_progress", "done", "skipped"]);
export const outboxStatusSchema = z.enum(["pending", "sent", "failed"]);
export const cancelledByRoleSchema = z.enum(["owner", "clinic_staff"]);

export type AppRole = z.infer<typeof appRoleSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;
export type StaffLevel = z.infer<typeof staffLevelSchema>;
export type Species = z.infer<typeof speciesSchema>;
export type PetGender = z.infer<typeof petGenderSchema>;
export type RecordType = z.infer<typeof recordTypeSchema>;
export type RecordSource = z.infer<typeof recordSourceSchema>;
export type ClinicStatus = z.infer<typeof clinicStatusSchema>;
export type AppointmentType = z.infer<typeof appointmentTypeSchema>;
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type TicketStatus = z.infer<typeof ticketStatusSchema>;
export type OutboxStatus = z.infer<typeof outboxStatusSchema>;
export type CancelledByRole = z.infer<typeof cancelledByRoleSchema>;
