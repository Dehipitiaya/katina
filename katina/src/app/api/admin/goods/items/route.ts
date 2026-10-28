import { fail, ok, zodErrors } from "@/lib/api-response";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  addDonationItem,
  addDonationItems,
  getAdminDonationItems,
} from "@/services/donation-service";
import {
  donationItemBulkCreateSchema,
  donationItemCreateSchema,
} from "@/validators/donation";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return fail("Admin authentication required.", { status: 401 });
  }

  return ok(await getAdminDonationItems());
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return fail("Admin authentication required.", { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (body && Array.isArray(body.names)) {
    const parsed = donationItemBulkCreateSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Check the item list.", { status: 422 }, zodErrors(parsed.error));
    }

    const result = await addDonationItems(parsed.data);
    return ok(result, { status: 201 }, `${result.createdCount} items added.`);
  }

  const parsed = donationItemCreateSchema.safeParse(body);

  if (!parsed.success) {
    const errors = zodErrors(parsed.error);
    const firstError = Object.values(errors).flat()[0] as string | undefined;

    return fail(firstError ?? "Check the item details.", { status: 422 }, errors);
  }

  return ok(await addDonationItem(parsed.data), { status: 201 }, "Item added.");
}
