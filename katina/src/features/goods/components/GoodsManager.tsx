"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  CircleDashed,
  Coins,
  ExternalLink,
  Hourglass,
  LayoutDashboard,
  ListPlus,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassDialog } from "@/components/ui/glass-dialog";
import { GlassInput, GlassTextarea } from "@/components/ui/glass-input";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { formatItemAmount, formatRupees, groupByCategory } from "@/features/goods/format";
import { parseItemQuantity } from "@/lib/item-quantity";
import { cn } from "@/lib/utils";
import type {
  DonationItemRecord,
  DonationItemType,
  DonationPledgeRecord,
} from "@/types/donation";

const selectClassName =
  "h-11 w-full rounded-[18px] border border-white/26 bg-[linear-gradient(180deg,rgba(255,255,255,0.13),rgba(255,255,255,0.035)_48%,rgba(255,255,255,0.075))] px-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] outline-none backdrop-blur-[38px]";

const labelClassName = "grid gap-2 text-sm font-medium text-[#dbc6aa]";

type ItemDraft = {
  name: string;
  category: string;
  note: string;
  type: DonationItemType;
  targetAmount: string;
  unit: string;
};

const TYPE_LABELS: Record<DonationItemType, string> = {
  ITEM: "One person",
  QUANTITY: "Shared quantity",
  MONEY: "Shared money",
};

type ItemStatus = "COMPLETE" | "PARTIAL" | "EMPTY";

function getItemStatus(item: DonationItemRecord): ItemStatus {
  if (item.isComplete) return "COMPLETE";
  return item.pledges.length > 0 ? "PARTIAL" : "EMPTY";
}

const STATUS_META: Record<ItemStatus, { label: string; badgeClassName: string; cardClassName: string }> = {
  COMPLETE: {
    label: "Completed",
    badgeClassName: "border-[#ff6b4a]/60 bg-[#ff6b4a]/18 text-[#ffd0c4]",
    cardClassName: "border-2 border-[#ff6b4a]/70 bg-[#ff6b4a]/12",
  },
  PARTIAL: {
    label: "In progress",
    badgeClassName: "border-[#f4c27a]/60 bg-[#f4c27a]/16 text-[#ffe2b0]",
    cardClassName: "border-[#f4c27a]/45 bg-[#f4c27a]/8",
  },
  EMPTY: {
    label: "Empty",
    badgeClassName: "border-white/24 bg-white/8 text-[#dbc6aa]",
    cardClassName: "border-white/18 bg-white/6",
  },
};

const STATUS_FILTERS = ["ALL", "COMPLETE", "PARTIAL", "EMPTY"] as const;

type PledgeDraft = {
  name: string;
  phone: string;
  batch: string;
  faculty: string;
  amount: string;
};

const emptyItemDraft: ItemDraft = {
  name: "",
  category: "",
  note: "",
  type: "ITEM",
  targetAmount: "",
  unit: "",
};

/** Deleting asks twice: step 1 explains what goes, step 2 is the final "are you sure". */
type ConfirmTarget = { step: 1 | 2 } & (
  | { kind: "item"; item: DonationItemRecord }
  | { kind: "pledge"; pledge: DonationPledgeRecord; itemName: string }
);

async function sendJson(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  return response.json();
}

export function GoodsManager({ initialItems }: { initialItems: DonationItemRecord[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("ALL");
  const [itemDialog, setItemDialog] = useState<{ id: string | null } | null>(null);
  const [itemDraft, setItemDraft] = useState<ItemDraft>(emptyItemDraft);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkDraft, setBulkDraft] = useState({ category: "", names: "" });
  const [pledgeTarget, setPledgeTarget] = useState<DonationPledgeRecord | null>(null);
  const [pledgeDraft, setPledgeDraft] = useState<PledgeDraft | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const detailItem = items.find((item) => item.id === detailId) ?? null;

  const categories = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.category).filter((value): value is string => Boolean(value))),
      ),
    [items],
  );

  const visibleGroups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const needleDigits = query.replace(/[^\d]/g, "");

    return groupByCategory(
      items.filter(
        (item) =>
          (statusFilter === "ALL" || getItemStatus(item) === statusFilter) &&
          (!needle ||
          item.name.toLowerCase().includes(needle) ||
          item.pledges.some(
            (pledge) =>
              pledge.name.toLowerCase().includes(needle) ||
              pledge.batch.toLowerCase().includes(needle) ||
              (pledge.faculty ?? "").toLowerCase().includes(needle) ||
              Boolean(needleDigits && pledge.phone.includes(needleDigits)),
          )),
      ),
    );
  }, [items, query, statusFilter]);

  const stats = useMemo(() => {
    const money = items.filter((item) => item.type === "MONEY");
    const counts = { ALL: items.length, COMPLETE: 0, PARTIAL: 0, EMPTY: 0 };

    items.forEach((item) => {
      counts[getItemStatus(item)] += 1;
    });

    return {
      counts,
      moneyPledged: money.reduce((total, item) => total + item.pledgedAmount, 0),
      moneyTarget: money.reduce((total, item) => total + (item.targetAmount ?? 0), 0),
    };
  }, [items]);

  function replaceItem(updated: DonationItemRecord) {
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }

  function openNewItem() {
    setItemDraft(emptyItemDraft);
    setDialogError(null);
    setItemDialog({ id: null });
  }

  function openEditItem(item: DonationItemRecord) {
    setItemDraft({
      name: item.name,
      category: item.category ?? "",
      note: item.note ?? "",
      type: item.type,
      targetAmount: item.targetAmount ? String(item.targetAmount) : "",
      unit: item.unit ?? "",
    });
    setDialogError(null);
    setItemDialog({ id: item.id });
  }

  async function saveItem() {
    if (!itemDialog) {
      return;
    }

    const payload = {
      name: itemDraft.name.trim(),
      category: itemDraft.category.trim(),
      note: itemDraft.note.trim(),
      type: itemDraft.type,
      targetAmount: itemDraft.type === "ITEM" ? undefined : itemDraft.targetAmount || undefined,
      unit: itemDraft.type === "QUANTITY" ? itemDraft.unit.trim() : undefined,
    };
    const original = items.find((item) => item.id === itemDialog.id);

    if (original) {
      // Send only what the admin changed, so editing just the name or amount leaves the rest alone.
      const changes: Record<string, string | undefined> = {};

      if (payload.name !== original.name) changes.name = payload.name;
      if (payload.category !== (original.category ?? "")) changes.category = payload.category;
      if (payload.note !== (original.note ?? "")) changes.note = payload.note;
      if (payload.type !== original.type) changes.type = payload.type;
      if (payload.targetAmount && Number(payload.targetAmount) !== original.targetAmount) {
        changes.targetAmount = payload.targetAmount;
      }
      if (payload.unit !== undefined && payload.unit !== (original.unit ?? "")) {
        changes.unit = payload.unit;
      }

      if (Object.keys(changes).length === 0) {
        setItemDialog(null);
        return;
      }

      if (changes.type && payload.targetAmount) {
        changes.targetAmount = payload.targetAmount;
      }

      setIsSaving(true);
      const result = await sendJson(`/api/admin/goods/items/${original.id}`, "PUT", changes);
      setIsSaving(false);

      if (!result.success) {
        setDialogError(result.message || "Item could not be saved.");
        return;
      }

      replaceItem(result.data);
      toast.success("Item updated.");
      setItemDialog(null);
      return;
    }

    setIsSaving(true);
    const result = await sendJson("/api/admin/goods/items", "POST", {
          ...payload,
          category: payload.category || undefined,
          note: payload.note || undefined,
        });
    setIsSaving(false);

    if (!result.success) {
      setDialogError(result.message || "Item could not be saved.");
      return;
    }

    setItems((current) => [...current, result.data]);
    toast.success("Item added.");
    setItemDialog(null);
  }

  async function saveBulk() {
    const names = bulkDraft.names
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (names.length === 0) {
      setDialogError("Add at least one item, one per line.");
      return;
    }

    setIsSaving(true);
    const result = await sendJson("/api/admin/goods/items", "POST", {
      category: bulkDraft.category.trim() || undefined,
      names,
    });
    setIsSaving(false);

    if (!result.success) {
      setDialogError(result.message || "Items could not be added.");
      return;
    }

    setItems(result.data.items);
    setBulkOpen(false);
    setBulkDraft({ category: "", names: "" });
    toast.success(`${result.data.createdCount} items added.`);
  }

  async function moveItem(id: string, move: "up" | "down") {
    const result = await sendJson(`/api/admin/goods/items/${id}`, "PUT", { move });

    if (result.success) {
      setItems(result.data);
    } else {
      toast.error(result.message || "Item could not be moved.");
    }
  }

  function openEditPledge(pledge: DonationPledgeRecord) {
    setPledgeTarget(pledge);
    setDialogError(null);
    setPledgeDraft({
      name: pledge.name,
      phone: pledge.phone,
      batch: pledge.batch,
      faculty: pledge.faculty ?? "",
      amount: pledge.amount === null ? "" : String(pledge.amount),
    });
  }

  async function savePledge() {
    if (!pledgeTarget || !pledgeDraft) {
      return;
    }

    const payload: Record<string, string | null> = {};

    if (pledgeDraft.name.trim() !== pledgeTarget.name) payload.name = pledgeDraft.name;
    if (pledgeDraft.phone.trim() !== pledgeTarget.phone) payload.phone = pledgeDraft.phone;
    if (pledgeDraft.batch.trim() !== pledgeTarget.batch) payload.batch = pledgeDraft.batch;
    if (pledgeDraft.faculty.trim() !== (pledgeTarget.faculty ?? "")) {
      payload.faculty = pledgeDraft.faculty.trim() || null;
    }
    if (
      pledgeTarget.amount !== null &&
      pledgeDraft.amount.trim() !== String(pledgeTarget.amount)
    ) {
      payload.amount = pledgeDraft.amount;
    }

    if (Object.keys(payload).length === 0) {
      setPledgeTarget(null);
      return;
    }

    setIsSaving(true);
    const result = await sendJson(`/api/admin/goods/pledges/${pledgeTarget.id}`, "PUT", payload);
    setIsSaving(false);

    if (!result.success) {
      setDialogError(result.message || "Pledge could not be updated.");
      return;
    }

    replaceItem(result.data);
    setPledgeTarget(null);
    toast.success("Pledge updated.");
  }

  async function confirmDelete() {
    if (!confirmTarget) {
      return;
    }

    if (confirmTarget.step === 1) {
      setConfirmTarget({ ...confirmTarget, step: 2 });
      return;
    }

    setIsSaving(true);

    if (confirmTarget.kind === "item") {
      const result = await sendJson(`/api/admin/goods/items/${confirmTarget.item.id}`, "DELETE");

      if (result.success) {
        setItems(result.data);
        setDetailId(null);
        toast.success("Item deleted.");
      } else {
        toast.error(result.message || "Item could not be deleted.");
      }
    } else {
      const result = await sendJson(
        `/api/admin/goods/pledges/${confirmTarget.pledge.id}`,
        "DELETE",
      );

      if (result.success) {
        replaceItem(result.data);
        toast.success("Pledge removed.");
      } else {
        toast.error(result.message || "Pledge could not be removed.");
      }
    }

    setIsSaving(false);
    setConfirmTarget(null);
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
      <header className="flex flex-col gap-4 py-3 sm:py-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-[#fff2da] sm:text-4xl">
            Goods list
          </h1>
          <p className="mt-1 text-sm text-[#cdb390]">
            Manage the items people can provide and see who pledged them.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <GlassButton onClick={() => router.push("/admin")} className="w-full sm:w-auto">
            <LayoutDashboard className="size-4" />
            Dashboard
          </GlassButton>
          <GlassButton onClick={() => window.open("/goods", "_blank")} className="w-full sm:w-auto">
            <ExternalLink className="size-4" />
            Public page
          </GlassButton>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["COMPLETE", <CheckCircle2 key="complete" className="size-5" />],
            ["PARTIAL", <Hourglass key="partial" className="size-5" />],
            ["EMPTY", <CircleDashed key="empty" className="size-5" />],
          ] as const
        ).map(([status, icon]) => (
          <button
            key={status}
            type="button"
            aria-pressed={statusFilter === status}
            onClick={() => setStatusFilter((current) => (current === status ? "ALL" : status))}
            className={cn(
              "rounded-[30px] text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#66b3ff]/30",
              statusFilter === status && "ring-2 ring-[#fff2da]/70",
            )}
          >
            <StatCard
              label={`${STATUS_META[status].label} items`}
              value={`${stats.counts[status]} / ${stats.counts.ALL}`}
              icon={icon}
            />
          </button>
        ))}
        <StatCard
          label={`Money pledged of ${formatRupees(stats.moneyTarget)}`}
          value={formatRupees(stats.moneyPledged)}
          icon={<Coins className="size-5" />}
        />
      </div>

      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <GlassInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search item, name, batch, faculty, phone"
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as (typeof STATUS_FILTERS)[number])
              }
              aria-label="Filter by status"
              className={cn(selectClassName, "col-span-2 rounded-full sm:w-48")}
            >
              {STATUS_FILTERS.map((status) => (
                <option key={status} value={status} className="bg-[#21150f]">
                  {status === "ALL" ? "All items" : STATUS_META[status].label} ({stats.counts[status]})
                </option>
              ))}
            </select>
            <GlassButton tone="primary" onClick={openNewItem} className="h-11">
              <Plus className="size-4" />
              Add item
            </GlassButton>
            <GlassButton
              onClick={() => {
                setDialogError(null);
                setBulkOpen(true);
              }}
              className="h-11"
            >
              <ListPlus className="size-4" />
              Add many
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {visibleGroups.map((group, groupIndex) => (
        <GlassCard key={`${group.category ?? "none"}-${groupIndex}`} className="p-4 sm:p-5">
          <h2 className="mb-3 px-1 text-lg font-semibold text-[#fff2da]">
            {group.category ?? "No category"}
          </h2>
          <ul className="grid gap-3">
            {group.items.map((item) => {
              const position = items.findIndex((entry) => entry.id === item.id);
              const status = getItemStatus(item);
              const canReorder = !query && statusFilter === "ALL";

              return (
                <li
                  key={item.id}
                  className={cn(
                    "rounded-[22px] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]",
                    STATUS_META[status].cardClassName,
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setDetailId(item.id)}
                      aria-label={`Open ${item.name}`}
                      className="min-w-0 flex-1 rounded-xl text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#66b3ff]/30"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="break-words font-medium text-[#fff2da]">{item.name}</p>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                            STATUS_META[status].badgeClassName,
                          )}
                        >
                          {STATUS_META[status].label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#cdb390]">
                        {TYPE_LABELS[item.type]} ·{" "}
                        {item.type === "ITEM"
                          ? item.isComplete
                            ? "Taken"
                            : "Open"
                          : `${formatItemAmount(item, item.pledgedAmount)} of ${formatItemAmount(item, item.targetAmount ?? 0)} · ${formatItemAmount(item, item.remainingAmount ?? 0)} still needed`}
                      </p>
                      {item.note && <p className="mt-1 text-xs text-white/70">{item.note}</p>}
                      {item.pledges.length > 0 && (
                        <p className="mt-1.5 text-xs font-medium text-[#8dc5df] md:hidden">
                          {item.pledges.length} pledge{item.pledges.length === 1 ? "" : "s"} · tap to view
                        </p>
                      )}
                    </button>
                    <div className="flex shrink-0 gap-2">
                      <GlassButton
                        aria-label="Move up"
                        disabled={position === 0 || !canReorder}
                        onClick={() => moveItem(item.id, "up")}
                        className="size-9 px-0"
                      >
                        <ArrowUp className="size-4" />
                      </GlassButton>
                      <GlassButton
                        aria-label="Move down"
                        disabled={position === items.length - 1 || !canReorder}
                        onClick={() => moveItem(item.id, "down")}
                        className="size-9 px-0"
                      >
                        <ArrowDown className="size-4" />
                      </GlassButton>
                      <GlassButton
                        aria-label="Edit item"
                        onClick={() => openEditItem(item)}
                        className="size-9 px-0"
                      >
                        <Pencil className="size-4" />
                      </GlassButton>
                      <GlassButton
                        aria-label="Delete item"
                        tone="danger"
                        onClick={() => setConfirmTarget({ step: 1, kind: "item", item })}
                        className="size-9 px-0"
                      >
                        <Trash2 className="size-4" />
                      </GlassButton>
                    </div>
                  </div>

                  {item.pledges.length > 0 && (
                    <div className="mt-3 hidden gap-2 md:grid">
                      {item.pledges.map((pledge) => (
                        <div
                          key={pledge.id}
                          className="flex flex-col gap-2 rounded-2xl border border-white/12 bg-white/5 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="grid min-w-0 gap-0.5 sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto] sm:items-center sm:gap-3">
                            <span className="break-words font-medium text-white">{pledge.name}</span>
                            <a href={`tel:${pledge.phone}`} className="text-[#8dc5df] hover:underline">
                              {pledge.phone}
                            </a>
                            <span className="text-[#dbc6aa]">{pledge.batch}</span>
                            <span className="break-words text-[#dbc6aa]">{pledge.faculty ?? "-"}</span>
                            <span className="text-xs text-[#cdb390]">
                              {pledge.amount !== null && (
                                <span className="mr-2 font-semibold text-[#dff7b8]">
                                  {formatItemAmount(item, pledge.amount)}
                                </span>
                              )}
                              {format(parseISO(pledge.createdAt), "MMM d, HH:mm")}
                            </span>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <GlassButton
                              aria-label="Edit pledge"
                              onClick={() => openEditPledge(pledge)}
                              className="size-8 px-0"
                            >
                              <Pencil className="size-3.5" />
                            </GlassButton>
                            <GlassButton
                              aria-label="Remove pledge"
                              tone="danger"
                              onClick={() =>
                                setConfirmTarget({ step: 1, kind: "pledge", pledge, itemName: item.name })
                              }
                              className="size-8 px-0"
                            >
                              <Trash2 className="size-3.5" />
                            </GlassButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </GlassCard>
      ))}

      {visibleGroups.length === 0 && (
        <GlassCard className="p-8 text-center text-sm text-[#cdb390]">
          {items.length === 0
            ? "No items yet. Use “Add item” or “Add many” to create the list."
            : "No items match the search or status filter."}
        </GlassCard>
      )}

      <datalist id="goods-categories">
        {categories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>

      <GlassDialog
        open={Boolean(detailItem)}
        onOpenChange={(open) => !open && setDetailId(null)}
        title={detailItem?.name ?? ""}
        description={
          detailItem
            ? [detailItem.category ?? "No section", TYPE_LABELS[detailItem.type]].join(" · ")
            : undefined
        }
        footer={
          detailItem && (
            <>
              <GlassButton
                tone="danger"
                onClick={() => setConfirmTarget({ step: 1, kind: "item", item: detailItem })}
                className="mr-auto"
              >
                <Trash2 className="size-4" />
                Delete
              </GlassButton>
              <GlassButton tone="primary" onClick={() => openEditItem(detailItem)}>
                <Pencil className="size-4" />
                Edit item
              </GlassButton>
            </>
          )
        }
      >
        {detailItem && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                  STATUS_META[getItemStatus(detailItem)].badgeClassName,
                )}
              >
                {STATUS_META[getItemStatus(detailItem)].label}
              </span>
              <span className="text-sm text-[#dbc6aa]">
                {detailItem.type === "ITEM"
                  ? detailItem.isComplete
                    ? "Taken"
                    : "Nobody yet"
                  : `${formatItemAmount(detailItem, detailItem.pledgedAmount)} of ${formatItemAmount(detailItem, detailItem.targetAmount ?? 0)} · ${formatItemAmount(detailItem, detailItem.remainingAmount ?? 0)} still needed`}
              </span>
            </div>
            {detailItem.note && (
              <p className="rounded-2xl border border-white/14 bg-white/6 px-3 py-2 text-sm text-[#fff2da]">
                {detailItem.note}
              </p>
            )}

            <h3 className="pt-1 text-sm font-semibold text-[#fff2da]">
              Pledges ({detailItem.pledges.length})
            </h3>
            {detailItem.pledges.length === 0 && (
              <p className="text-sm text-[#cdb390]">Nobody has pledged for this item yet.</p>
            )}
            {detailItem.pledges.map((pledge) => (
              <div
                key={pledge.id}
                className="grid gap-2 rounded-2xl border border-white/14 bg-white/6 p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-white">{pledge.name}</p>
                    {pledge.amount !== null && (
                      <p className="font-semibold text-[#dff7b8]">
                        {formatItemAmount(detailItem, pledge.amount)}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <GlassButton
                      aria-label="Edit pledge"
                      onClick={() => openEditPledge(pledge)}
                      className="size-9 px-0"
                    >
                      <Pencil className="size-4" />
                    </GlassButton>
                    <GlassButton
                      aria-label="Remove pledge"
                      tone="danger"
                      onClick={() =>
                        setConfirmTarget({ step: 1, kind: "pledge", pledge, itemName: detailItem.name })
                      }
                      className="size-9 px-0"
                    >
                      <Trash2 className="size-4" />
                    </GlassButton>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <dt className="text-[#cdb390]">Phone</dt>
                  <dd>
                    <a href={`tel:${pledge.phone}`} className="text-[#8dc5df] hover:underline">
                      {pledge.phone}
                    </a>
                  </dd>
                  <dt className="text-[#cdb390]">Batch</dt>
                  <dd className="text-white">{pledge.batch}</dd>
                  <dt className="text-[#cdb390]">Faculty</dt>
                  <dd className="break-words text-white">{pledge.faculty ?? "-"}</dd>
                  <dt className="text-[#cdb390]">Added</dt>
                  <dd className="text-white">{format(parseISO(pledge.createdAt), "MMM d, HH:mm")}</dd>
                </dl>
              </div>
            ))}
          </>
        )}
      </GlassDialog>

      <GlassDialog
        open={Boolean(itemDialog)}
        onOpenChange={(open) => !open && setItemDialog(null)}
        title={itemDialog?.id ? "Edit item" : "Add item"}
        footer={
          <>
            <GlassButton onClick={() => setItemDialog(null)}>Cancel</GlassButton>
            <GlassButton tone="primary" disabled={isSaving} onClick={saveItem}>
              {isSaving ? "Saving..." : "Save item"}
            </GlassButton>
          </>
        }
      >
        <label className={labelClassName}>
          Item name
          <GlassInput
            value={itemDraft.name}
            placeholder="පොල් 25"
            onChange={(event) => setItemDraft((current) => ({ ...current, name: event.target.value }))}
          />
        </label>
        <label className={labelClassName}>
          Section (optional)
          <GlassInput
            list="goods-categories"
            value={itemDraft.category}
            placeholder="අමුද්‍රව්‍ය"
            onChange={(event) =>
              setItemDraft((current) => ({ ...current, category: event.target.value }))
            }
          />
        </label>
        <label className={labelClassName}>
          Type
          <select
            value={itemDraft.type}
            disabled={Boolean(
              itemDialog?.id && items.find((item) => item.id === itemDialog.id)?.pledges.length,
            )}
            onChange={(event) =>
              setItemDraft((current) => {
                const type = event.target.value as DonationItemType;
                // Prefill "4" from a name like "මොප් 4" when switching to a shared quantity.
                const parsed =
                  type === "QUANTITY" && !current.targetAmount
                    ? parseItemQuantity(current.name)
                    : null;

                return {
                  ...current,
                  type,
                  targetAmount: parsed ? String(parsed.targetAmount) : current.targetAmount,
                  unit: parsed?.unit ?? current.unit,
                };
              })
            }
            className={selectClassName}
          >
            <option value="ITEM" className="bg-[#21150f]">
              One person — someone gives the whole item
            </option>
            <option value="QUANTITY" className="bg-[#21150f]">
              Shared quantity — people give part of a count (e.g. 2 of 4 mops)
            </option>
            <option value="MONEY" className="bg-[#21150f]">
              Money — many people donate towards a total
            </option>
          </select>
        </label>
        {itemDraft.type !== "ITEM" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClassName}>
              {itemDraft.type === "MONEY" ? "Total amount needed (Rs.)" : "Total quantity needed"}
              <GlassInput
                type="number"
                min={itemDraft.type === "MONEY" ? 1 : 0.01}
                step={itemDraft.type === "MONEY" ? 1 : "any"}
                value={itemDraft.targetAmount}
                placeholder={itemDraft.type === "MONEY" ? "6400" : "4"}
                onChange={(event) =>
                  setItemDraft((current) => ({ ...current, targetAmount: event.target.value }))
                }
              />
            </label>
            {itemDraft.type === "QUANTITY" && (
              <label className={labelClassName}>
                Unit (optional)
                <GlassInput
                  value={itemDraft.unit}
                  placeholder="කිලො"
                  onChange={(event) =>
                    setItemDraft((current) => ({ ...current, unit: event.target.value }))
                  }
                />
              </label>
            )}
          </div>
        )}
        <label className={labelClassName}>
          Note (optional)
          <GlassTextarea
            value={itemDraft.note}
            placeholder="එක් අයෙකුට රුපියල් 100කින් පමණක් දායක විය හැක"
            onChange={(event) => setItemDraft((current) => ({ ...current, note: event.target.value }))}
          />
        </label>
        {dialogError && <DialogError message={dialogError} />}
      </GlassDialog>

      <GlassDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        title="Add many items"
        description="Paste one item per line. A number at the end (like “මොප් 4” or “කැරට් කිලො 1”) becomes a shared quantity; check the type afterwards."
        footer={
          <>
            <GlassButton onClick={() => setBulkOpen(false)}>Cancel</GlassButton>
            <GlassButton tone="primary" disabled={isSaving} onClick={saveBulk}>
              {isSaving ? "Adding..." : "Add items"}
            </GlassButton>
          </>
        }
      >
        <label className={labelClassName}>
          Section (optional)
          <GlassInput
            list="goods-categories"
            value={bulkDraft.category}
            placeholder="අමුද්‍රව්‍ය"
            onChange={(event) =>
              setBulkDraft((current) => ({ ...current, category: event.target.value }))
            }
          />
        </label>
        <label className={labelClassName}>
          Items
          <GlassTextarea
            value={bulkDraft.names}
            placeholder={"කිරි සම්බා 3\nපොල් 25\nබිත්තර 30"}
            onChange={(event) => setBulkDraft((current) => ({ ...current, names: event.target.value }))}
            className="min-h-56"
          />
        </label>
        {dialogError && <DialogError message={dialogError} />}
      </GlassDialog>

      <GlassDialog
        open={Boolean(pledgeTarget && pledgeDraft)}
        onOpenChange={(open) => !open && setPledgeTarget(null)}
        title="Edit pledge"
        footer={
          <>
            <GlassButton onClick={() => setPledgeTarget(null)}>Cancel</GlassButton>
            <GlassButton tone="primary" disabled={isSaving} onClick={savePledge}>
              {isSaving ? "Saving..." : "Save changes"}
            </GlassButton>
          </>
        }
      >
        {pledgeDraft && (
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["name", "Name"],
                ["phone", "Phone"],
                ["batch", "Batch"],
                ["faculty", "Faculty"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className={labelClassName}>
                {label}
                <GlassInput
                  value={pledgeDraft[key]}
                  onChange={(event) =>
                    setPledgeDraft((current) =>
                      current ? { ...current, [key]: event.target.value } : current,
                    )
                  }
                />
              </label>
            ))}
            {pledgeTarget?.amount !== null && (
              <label className={cn(labelClassName, "sm:col-span-2")}>
                Amount pledged
                <GlassInput
                  type="number"
                  min={1}
                  value={pledgeDraft.amount}
                  onChange={(event) =>
                    setPledgeDraft((current) =>
                      current ? { ...current, amount: event.target.value } : current,
                    )
                  }
                />
              </label>
            )}
          </div>
        )}
        {dialogError && <DialogError message={dialogError} />}
      </GlassDialog>

      <GlassDialog
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={
          confirmTarget?.step === 2
            ? "Are you sure?"
            : confirmTarget?.kind === "item"
              ? "Delete item?"
              : "Remove pledge?"
        }
        description={
          confirmTarget?.step === 2
            ? "This cannot be undone. Press the red button once more to confirm."
            : confirmTarget?.kind === "item"
              ? `“${confirmTarget.item.name}” and its ${confirmTarget.item.pledges.length} pledge(s) will be deleted.`
              : confirmTarget
                ? `${confirmTarget.pledge.name} will be removed from “${confirmTarget.itemName}”, and the item opens up again.`
                : undefined
        }
        footer={
          <>
            <GlassButton onClick={() => setConfirmTarget(null)}>Cancel</GlassButton>
            <GlassButton tone="danger" disabled={isSaving} onClick={confirmDelete}>
              {confirmTarget?.step === 2
                ? confirmTarget.kind === "item"
                  ? "Yes, delete it"
                  : "Yes, remove it"
                : confirmTarget?.kind === "item"
                  ? "Delete"
                  : "Remove"}
            </GlassButton>
          </>
        }
      />
    </section>
  );
}

function DialogError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-[#ff6b4a]/30 bg-[#ff6b4a]/10 px-3 py-2 text-center text-sm text-[#ffb1a0]">
      {message}
    </div>
  );
}
