import { redirect } from "next/navigation";

import { GlassShell } from "@/components/layout/GlassShell";
import { GoodsManager } from "@/features/goods/components/GoodsManager";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAdminDonationItems } from "@/services/donation-service";

export const dynamic = "force-dynamic";

export default async function AdminGoodsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <GlassShell>
      <GoodsManager initialItems={await getAdminDonationItems()} />
    </GlassShell>
  );
}
