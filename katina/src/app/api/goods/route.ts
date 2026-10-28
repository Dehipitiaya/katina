import { ok } from "@/lib/api-response";
import { getPublicDonationItems } from "@/services/donation-service";

export const dynamic = "force-dynamic";

export async function GET() {
  return ok(await getPublicDonationItems());
}
