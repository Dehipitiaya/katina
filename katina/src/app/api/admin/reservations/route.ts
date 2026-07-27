import { fail, ok } from "@/lib/api-response";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAdminReservations } from "@/services/reservation-service";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return fail("Admin authentication required.", { status: 401 });
  }

  return ok(await getAdminReservations());
}
