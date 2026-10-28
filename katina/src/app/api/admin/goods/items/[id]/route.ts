import { fail, ok, zodErrors } from "@/lib/api-response";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  editDonationItem,
  moveDonationItem,
  removeDonationItem,
} from "@/services/donation-service";
import { donationItemUpdateSchema } from "@/validators/donation";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return fail("Admin authentication required.", { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (body?.move === "up" || body?.move === "down") {
    try {
      return ok(await moveDonationItem(id, body.move));
    } catch (error) {
      return fail(error instanceof Error ? error.message : "Item could not be moved.");
    }
  }

  const parsed = donationItemUpdateSchema.safeParse(body);

  if (!parsed.success) {
    const errors = zodErrors(parsed.error);
    const firstError = Object.values(errors).flat()[0] as string | undefined;

    return fail(firstError ?? "Check the item details.", { status: 422 }, errors);
  }

  try {
    return ok(await editDonationItem(id, parsed.data), undefined, "Item updated.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Item could not be updated.");
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return fail("Admin authentication required.", { status: 401 });
  }

  try {
    const { id } = await params;
    return ok(await removeDonationItem(id), undefined, "Item deleted.");
  } catch {
    return fail("Item could not be deleted.");
  }
}
