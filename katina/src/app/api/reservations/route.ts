import { Prisma } from "@/generated/prisma/client";

import { fail, ok, zodErrors } from "@/lib/api-response";
import { reserveResponsibility } from "@/services/reservation-service";
import { reservationCreateSchema } from "@/validators/reservation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = reservationCreateSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Check the reservation details.", { status: 422 }, zodErrors(parsed.error));
  }

  try {
    const reservation = await reserveResponsibility(parsed.data);
    return ok(reservation, { status: 201 }, "Reservation saved.");
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fail("This responsibility has already been reserved.", {
        status: 409,
      });
    }

    return fail(error instanceof Error ? error.message : "Reservation failed.", {
      status: 400,
    });
  }
}
