"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarDays, Search, Share2 } from "lucide-react";
import { toast } from "sonner";

import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassInput } from "@/components/ui/glass-input";
import { GlassPillLink, glassPillClassName } from "@/components/ui/glass-pill-link";
import { ContributorsDropdown } from "@/features/goods/components/ContributorsDropdown";
import {
  BackToTopButton,
  CategoryNav,
  type GoodsSection,
} from "@/features/goods/components/GoodsNavigation";
import { PledgeDialog } from "@/features/goods/components/PledgeDialog";
import { formatItemAmount, groupByCategory } from "@/features/goods/format";
import { cn } from "@/lib/utils";
import type { PublicDonationItem } from "@/types/donation";

/** Nav label for items listed without a section heading. */
const OTHER_SECTION_LABEL = "අනෙකුත්";

function SharedProgress({ item }: { item: PublicDonationItem }) {
  const target = item.targetAmount ?? 0;
  const percentage = target === 0 ? 0 : Math.min((item.pledgedAmount / target) * 100, 100);

  return (
    <div className="mt-3 grid gap-1.5">
      <div className="h-2 overflow-hidden rounded-full bg-white/12">
        <div
          className="h-full rounded-full bg-[#b6e56f] transition-[width] duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex flex-wrap justify-between gap-x-3 text-xs text-[#cdb390]">
        <span>
          {formatItemAmount(item, item.pledgedAmount)} / {formatItemAmount(item, target)}
        </span>
        <span className={cn(item.isComplete ? "text-[#dff7b8]" : "text-[#fff2da]")}>
          {item.isComplete
            ? "Fully covered"
            : `${formatItemAmount(item, item.remainingAmount ?? 0)} still needed`}
        </span>
      </div>
    </div>
  );
}

function GoodsItemCard({
  item,
  onPledge,
}: {
  item: PublicDonationItem;
  onPledge: (item: PublicDonationItem) => void;
}) {
  const isShared = item.type !== "ITEM";

  return (
    <li
      className={cn(
        "min-w-0 rounded-[22px] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-[16px] transition",
        item.isComplete
          ? "border-2 border-[#ff6b4a]/85 bg-[#ff6b4a]/22"
          : "border-white/22 bg-white/8",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "break-words font-medium",
              item.isComplete ? "text-[#ffd0c4]" : "text-[#fff2da]",
            )}
          >
            {item.name}
          </p>
          {item.note && <p className="mt-1 text-xs text-[#cdb390]">{item.note}</p>}
        </div>
        {!item.isComplete && (
          <GlassButton
            tone="success"
            onClick={() => onPledge(item)}
            className="h-9 shrink-0 px-3 text-xs"
          >
            {item.type === "MONEY" ? "Donate" : "I can give"}
          </GlassButton>
        )}
      </div>

      {isShared && <SharedProgress item={item} />}

      {item.pledges.length > 0 && <ContributorsDropdown item={item} />}
    </li>
  );
}

export function GoodsList({ initialItems }: { initialItems: PublicDonationItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [selected, setSelected] = useState<PublicDonationItem | null>(null);
  const [, startTransition] = useTransition();

  const visibleGroups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const visible = items.filter(
      (item) =>
        (!openOnly || !item.isComplete) &&
        (!needle ||
          item.name.toLowerCase().includes(needle) ||
          item.pledges.some((pledge) => pledge.name.toLowerCase().includes(needle))),
    );

    return groupByCategory(visible);
  }, [items, openOnly, query]);

  const sections = useMemo<GoodsSection[]>(
    () =>
      visibleGroups.map((group, index) => ({
        id: `goods-section-${index}`,
        label: group.category ?? OTHER_SECTION_LABEL,
        count: group.items.length,
      })),
    [visibleGroups],
  );

  const completedCount = items.filter((item) => item.isComplete).length;

  function refresh() {
    startTransition(async () => {
      const response = await fetch("/api/goods", { cache: "no-store" });
      const result = await response.json();

      if (result.success) {
        setItems(result.data);
      }
    });
  }

  async function share() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: "කඨින ද්‍රව්‍ය ලැයිස්තුව", url });
        return;
      }

      await navigator.clipboard.writeText(url);
      toast.success("Link copied. Share it with everyone.");
    } catch {
      // The user closed the share sheet.
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6">
      <GlassPillLink href="/" className="fixed left-4 top-4 z-50">
        <CalendarDays className="size-4" />
        දින දර්ශනය
      </GlassPillLink>
      <button
        type="button"
        onClick={share}
        className={cn(glassPillClassName, "fixed right-4 top-4 z-50")}
      >
        <Share2 className="size-4" />
        Share
      </button>

      <header className="flex flex-col items-center pb-2 pt-16 text-center sm:pt-12">
        <h1 className="text-3xl font-semibold text-[#fff2da] sm:text-5xl">
          කඨින ද්‍රව්‍ය ලැයිස්තුව
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#dbc6aa] sm:text-base">
          ඔබට ලබා දිය හැකි ද්‍රව්‍යයක් තෝරා ඔබගේ නම එක් කරන්න.
        </p>
        <p className="mt-4 rounded-full border border-white/20 bg-white/7 px-4 py-1.5 text-sm font-medium text-[#fff2da] backdrop-blur-[14px]">
          {completedCount} / {items.length} taken
        </p>
      </header>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <GlassInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search items or names"
            className="pl-9"
          />
        </div>
        <GlassButton
          onClick={() => setOpenOnly((current) => !current)}
          aria-pressed={openOnly}
          className={cn("h-11", openOnly && "border-[#b6e56f]/70 text-[#dff7b8]")}
        >
          {openOnly ? "Showing available" : "Show available only"}
        </GlassButton>
      </div>

      <CategoryNav sections={sections} />

      {visibleGroups.map((group, index) => (
        <GlassCard
          key={`${group.category ?? "none"}-${index}`}
          id={sections[index].id}
          className="scroll-mt-32 p-4 sm:p-5"
        >
          {group.category && (
            <h2 className="mb-4 px-1 text-center text-xl font-semibold text-[#fff2da] sm:text-2xl">
              {group.category}
            </h2>
          )}
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {group.items.map((item) => (
              <GoodsItemCard key={item.id} item={item} onPledge={setSelected} />
            ))}
          </ul>
        </GlassCard>
      ))}

      {visibleGroups.length === 0 && (
        <GlassCard className="p-8 text-center text-sm text-[#cdb390]">
          {items.length === 0 ? "No items have been added yet." : "No items match your search."}
        </GlassCard>
      )}

      <BackToTopButton />

      <PledgeDialog
        item={selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onPledged={refresh}
      />
    </section>
  );
}
