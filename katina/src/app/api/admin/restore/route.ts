import { fail, ok, zodErrors } from "@/lib/api-response";
import { isAdminAuthenticated } from "@/lib/auth";
import { restoreReservationsBackup } from "@/services/reservation-service";
import { backupFileSchema } from "@/validators/backup";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return fail("Admin authentication required.", { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = backupFileSchema.safeParse(body);

  if (!parsed.success) {
    return fail(
      "Backup file is not valid.",
      { status: 422 },
      zodErrors(parsed.error),
    );
  }

  try {
    const result = await restoreReservationsBackup(parsed.data);

    return ok(
      {
        reservations: result.reservations,
        importedCount: result.importedCount,
        skippedCount: result.skippedCount,
        count: result.reservations.length,
      },
      undefined,
      "Backup restored.",
    );
  } catch {
    return fail("Backup could not be restored.", { status: 400 });
  }
}
