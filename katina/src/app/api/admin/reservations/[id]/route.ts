import { fail, ok, zodErrors } from "@/lib/api-response";
import { isAdminAuthenticated } from "@/lib/auth";
import { editReservation, removeReservation } from "@/services/reservation-service";
import { reservationUpdateSchema } from "@/validators/reservation";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return fail("Admin authentication required.", { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reservationUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Check the reservation details.", { status: 422 }, zodErrors(parsed.error));
  }

  try {
    const { id } = await params;
    return ok(await editReservation(id, parsed.data), undefined, "Reservation updated.");
  } catch {
    return fail("Reservation could not be updated.", { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return fail("Admin authentication required.", { status: 401 });
  }

  try {
    const { id } = await params;
    return ok(await removeReservation(id), undefined, "Reservation deleted.");
  } catch {
    return fail("Reservation could not be deleted.", { status: 400 });
  }
}
