import { redirect } from "next/navigation";

import { GlassShell } from "@/components/layout/GlassShell";
import { AdminDashboard } from "@/features/dashboard/components/AdminDashboard";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  getAdminReservations,
  getDashboardStats,
} from "@/services/reservation-service";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [stats, reservations] = await Promise.all([
    getDashboardStats(),
    getAdminReservations(),
  ]);

  return (
    <GlassShell>
      <AdminDashboard
        stats={stats}
        reservations={reservations}
      />
    </GlassShell>
  );
}
