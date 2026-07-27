import { fail, ok, zodErrors } from "@/lib/api-response";
import { setAdminCookie } from "@/lib/auth";
import { authenticateAdmin } from "@/services/authentication-service";
import { adminLoginSchema } from "@/validators/authentication";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Check the login details.", { status: 422 }, zodErrors(parsed.error));
  }

  try {
    const token = authenticateAdmin(parsed.data);
    await setAdminCookie(token);
    return ok({ redirectTo: "/admin" });
  } catch {
    return fail("Invalid admin credentials.", { status: 401 });
  }
}
