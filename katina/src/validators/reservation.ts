import { z } from "zod";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.");

export const eventNumberSchema = z.coerce
  .number()
  .int()
  .min(1, "Choose a responsibility.")
  .max(4, "Choose a responsibility.");

const reservationBaseSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value.replace(/[^\d]/g, "").length === 10,
      "Phone number must contain exactly 10 digits.",
    ),
  batch: z.string().trim().min(1, "Enter your batch.").max(4, "Batch can only contain up to 4 characters."),
  accommodationType: z.enum(["HOSTEL", "BOARDING"], {
    message: "Choose hostel or boarding.",
  }),
  boardingDetails: z.string().trim().max(240).optional(),
});

function validateBoardingDetails(
  value: z.infer<typeof reservationBaseSchema>,
  context: z.RefinementCtx,
) {
  if (
    value.accommodationType === "BOARDING" &&
    (!value.boardingDetails || value.boardingDetails.length < 2)
  ) {
    context.addIssue({
      code: "custom",
      path: ["boardingDetails"],
      message: "Enter the boarding name or address.",
    });
  }
}

export const reservationCreateSchema = reservationBaseSchema
  .extend({
    date: dateSchema,
    eventNumber: eventNumberSchema,
  })
  .superRefine(validateBoardingDetails);

export const reservationUpdateSchema = reservationBaseSchema
  .extend({
    date: dateSchema,
    eventNumber: eventNumberSchema,
  })
  .partial()
  .superRefine((value, context) => {
    if (
      value.accommodationType === "BOARDING" &&
      value.boardingDetails !== undefined &&
      value.boardingDetails.length < 2
    ) {
      context.addIssue({
        code: "custom",
        path: ["boardingDetails"],
        message: "Enter the boarding name or address.",
      });
    }
  });

export const monthQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export type ReservationCreateInput = z.infer<typeof reservationCreateSchema>;
export type ReservationUpdateInput = z.infer<typeof reservationUpdateSchema>;
