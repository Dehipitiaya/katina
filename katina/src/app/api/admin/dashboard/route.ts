import { fail, ok } from "@/lib/api-response";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  getAdminReservations,
  getDashboardStats,
  getRecentAdminReservations,
} from "@/services/reservation-service";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return fail("Admin authentication required.", { status: 401 });
  }

  const [stats, recentReservations, reservations] = await Promise.all([
    getDashboardStats(),
    getRecentAdminReservations(),
    getAdminReservations(),
  ]);

  return ok({ stats, recentReservations, reservations });
}
