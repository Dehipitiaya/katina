import { Prisma } from "@/generated/prisma/client";

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
    const errors = zodErrors(parsed.error);
    const firstError = Object.values(errors).flat()[0];

    return fail(
      firstError
        ? `Check the reservation details: ${firstError}`
        : "Check the reservation details.",
      { status: 422 },
      errors,
    );
  }

  try {
    const { id } = await params;
    return ok(await editReservation(id, parsed.data), undefined, "Reservation updated.");
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fail("That date and event already has a reservation.", {
        status: 409,
      });
    }

    return fail(
      error instanceof Error
        ? error.message
        : "Reservation could not be updated.",
      { status: 400 },
    );
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
