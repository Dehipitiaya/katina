import { fail, ok, zodErrors } from "@/lib/api-response";
import { pledgeDonation } from "@/services/donation-service";
import { pledgeCreateSchema } from "@/validators/donation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = pledgeCreateSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Check your details.", { status: 422 }, zodErrors(parsed.error));
  }

  try {
    const pledge = await pledgeDonation(parsed.data);
    return ok(pledge, { status: 201 }, "Thank you! Your name has been added.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not save your pledge.", {
      status: 409,
    });
  }
}
