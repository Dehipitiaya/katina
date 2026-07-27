import { fail, ok, zodErrors } from "@/lib/api-response";
import { getCalendarReservations } from "@/services/reservation-service";
import { monthQuerySchema } from "@/validators/reservation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = monthQuerySchema.safeParse({
    year: url.searchParams.get("year"),
    month: url.searchParams.get("month"),
  });

  if (!parsed.success) {
    return fail("Invalid calendar request.", { status: 422 }, zodErrors(parsed.error));
  }

  const reservations = await getCalendarReservations(
    parsed.data.year,
    parsed.data.month,
  );

  return ok(reservations);
}
