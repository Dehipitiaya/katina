import type { Metadata } from "next";

import { GlassShell } from "@/components/layout/GlassShell";
import { GoodsList } from "@/features/goods/components/GoodsList";
import { getPublicDonationItems } from "@/services/donation-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "කඨින ද්‍රව්‍ය ලැයිස්තුව | Katina",
  description: "Add your name to an item you can provide for the Katina pinkama.",
};

export default async function GoodsPage() {
  const items = await getPublicDonationItems();

  return (
    <GlassShell>
      <GoodsList initialItems={items} />
    </GlassShell>
  );
}
