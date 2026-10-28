import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

const pledgeBaseSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value.replace(/[^\d]/g, "").length === 10,
      "Phone number must contain exactly 10 digits.",
    ),
  batch: z
    .string()
    .trim()
    .min(1, "Enter your batch.")
    .max(10, "Batch can only contain up to 10 characters."),
  faculty: optionalText(60),
  amount: z.coerce
    .number()
    .positive("Enter an amount above zero.")
    .multipleOf(0.01, "Use up to 2 decimal places.")
    .optional(),
});

export const pledgeCreateSchema = pledgeBaseSchema.extend({
  itemId: z.string().min(1, "Choose an item."),
});

export const pledgeUpdateSchema = pledgeBaseSchema.partial().extend({
  faculty: z.string().trim().max(60).nullable().optional(),
});

const donationItemBaseSchema = z.object({
  name: z.string().trim().min(1, "Enter the item name.").max(160),
  category: optionalText(80),
  note: optionalText(240),
  type: z.enum(["ITEM", "QUANTITY", "MONEY"]),
  targetAmount: z.coerce.number().positive().multipleOf(0.01).optional(),
  unit: optionalText(30),
  sortOrder: z.coerce.number().int().optional(),
});

function validateTargetAmount(
  value: { type?: "ITEM" | "QUANTITY" | "MONEY"; targetAmount?: number },
  context: z.RefinementCtx,
) {
  if (value.type && value.type !== "ITEM" && !value.targetAmount) {
    context.addIssue({
      code: "custom",
      path: ["targetAmount"],
      message: "Enter the total needed.",
    });
  }

  if (value.type === "MONEY" && value.targetAmount && !Number.isInteger(value.targetAmount)) {
    context.addIssue({
      code: "custom",
      path: ["targetAmount"],
      message: "Use a whole rupee amount.",
    });
  }
}

export const donationItemCreateSchema =
  donationItemBaseSchema.superRefine(validateTargetAmount);

export const donationItemUpdateSchema = donationItemBaseSchema
  .partial()
  .extend({
    category: z.string().trim().max(80).nullable().optional(),
    note: z.string().trim().max(240).nullable().optional(),
    unit: z.string().trim().max(30).nullable().optional(),
  });

export const donationItemBulkCreateSchema = z.object({
  category: optionalText(80),
  names: z
    .array(z.string().trim().min(1).max(160))
    .min(1, "Add at least one item.")
    .max(200),
});

export type PledgeCreateInput = z.infer<typeof pledgeCreateSchema>;
export type PledgeUpdateInput = z.infer<typeof pledgeUpdateSchema>;
export type DonationItemCreateInput = z.infer<typeof donationItemCreateSchema>;
export type DonationItemUpdateInput = z.infer<typeof donationItemUpdateSchema>;
export type DonationItemBulkCreateInput = z.infer<
  typeof donationItemBulkCreateSchema
>;
