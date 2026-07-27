import { createAdminToken, getAdminCredentials } from "@/lib/auth";
import type { AdminLoginInput } from "@/validators/authentication";

export function authenticateAdmin(input: AdminLoginInput) {
  const credentials = getAdminCredentials();

  if (
    input.username !== credentials.username ||
    input.password !== credentials.password
  ) {
    throw new Error("Invalid admin credentials.");
  }

  return createAdminToken();
}
