import { isAdminAuthenticated } from "@/lib/auth";
import { createReservationsBackup } from "@/services/reservation-service";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return Response.json(
      { success: false, message: "Admin authentication required." },
      { status: 401 },
    );
  }

  const backup = await createReservationsBackup();
  const date = backup.exportedAt.slice(0, 10);

  return Response.json(backup, {
    headers: {
      "Content-Disposition": `attachment; filename="katina-backup-${date}.json"`,
    },
  });
}
