import { z } from "zod";

import { eventNumberSchema } from "@/validators/reservation";

const dateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format.");

const isoDateSchema = z
  .string()
  .datetime({ message: "Timestamp must be a valid ISO date." });

export const reservationBackupSchema = z.object({
  id: z.string().min(1),
  date: dateKeySchema,
  eventNumber: eventNumberSchema,
  name: z.string().min(1),
  phone: z.string().min(1),
  batch: z.string().min(1),
  accommodationType: z.enum(["HOSTEL", "BOARDING"]),
  boardingDetails: z.string().nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const donationItemBackupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().nullable(),
  note: z.string().nullable(),
  type: z.enum(["ITEM", "QUANTITY", "MONEY"]),
  targetAmount: z.number().nullable(),
  unit: z.string().nullable(),
  sortOrder: z.number().int(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const donationPledgeBackupSchema = z.object({
  id: z.string().min(1),
  itemId: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(1),
  batch: z.string().min(1),
  faculty: z.string().nullable(),
  amount: z.number().nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const backupFileSchema = z.object({
  app: z.literal("katina-responsibility-calendar"),
  version: z.literal(1),
  exportedAt: isoDateSchema,
  reservations: z.array(reservationBackupSchema),
  // Optional so backups taken before the goods list existed still restore.
  donationItems: z.array(donationItemBackupSchema).optional(),
  donationPledges: z.array(donationPledgeBackupSchema).optional(),
});

export type BackupFileInput = z.infer<typeof backupFileSchema>;
