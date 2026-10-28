import { fail, ok, zodErrors } from "@/lib/api-response";
import { isAdminAuthenticated } from "@/lib/auth";
import { editPledge, removePledge } from "@/services/donation-service";
import { pledgeUpdateSchema } from "@/validators/donation";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return fail("Admin authentication required.", { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = pledgeUpdateSchema.safeParse(body);

  if (!parsed.success) {
    const errors = zodErrors(parsed.error);
    const firstError = Object.values(errors).flat()[0] as string | undefined;

    return fail(firstError ?? "Check the pledge details.", { status: 422 }, errors);
  }

  try {
    const { id } = await params;
    return ok(await editPledge(id, parsed.data), undefined, "Pledge updated.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Pledge could not be updated.");
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return fail("Admin authentication required.", { status: 401 });
  }

  try {
    const { id } = await params;
    return ok(await removePledge(id), undefined, "Pledge removed.");
  } catch {
    return fail("Pledge could not be removed.");
  }
}
