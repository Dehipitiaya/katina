import { z } from "zod";

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "Enter the username."),
  password: z.string().min(1, "Enter the password."),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
