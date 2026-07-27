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

export const backupFileSchema = z.object({
  app: z.literal("katina-responsibility-calendar"),
  version: z.literal(1),
  exportedAt: isoDateSchema,
  reservations: z.array(reservationBackupSchema),
});

export type BackupFileInput = z.infer<typeof backupFileSchema>;
