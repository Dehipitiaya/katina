import { ok } from "@/lib/api-response";
import { clearAdminCookie } from "@/lib/auth";

export async function POST() {
  await clearAdminCookie();
  return ok({ redirectTo: "/admin/login" });
}
