"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { GlassButton } from "@/components/ui/glass-button";
import { GlassDialog } from "@/components/ui/glass-dialog";
import { GlassInput } from "@/components/ui/glass-input";
import { formatItemAmount } from "@/features/goods/format";
import type { PublicDonationItem } from "@/types/donation";
import { pledgeCreateSchema, type PledgeCreateInput } from "@/validators/donation";

const emptyValues = {
  itemId: "",
  name: "",
  phone: "",
  batch: "",
  faculty: "",
  amount: undefined,
};

function FieldError({ message }: { message?: string }) {
  return message ? <span className="text-xs text-[#ff8a84]">{message}</span> : null;
}

export function PledgeDialog({
  item,
  onOpenChange,
  onPledged,
}: {
  item: PublicDonationItem | null;
  onOpenChange: (open: boolean) => void;
  onPledged: () => void;
}) {
  const form = useForm<z.input<typeof pledgeCreateSchema>, unknown, PledgeCreateInput>({
    resolver: zodResolver(pledgeCreateSchema),
    defaultValues: emptyValues,
  });
  const isShared = Boolean(item && item.type !== "ITEM");
  const isMoney = item?.type === "MONEY";

  useEffect(() => {
    if (item) {
      form.reset({ ...emptyValues, itemId: item.id });
    }
  }, [form, item]);

  async function onSubmit(values: PledgeCreateInput) {
    if (isShared && !values.amount) {
      form.setError("amount", {
        message: isMoney ? "Enter the amount you can donate." : "Enter how many you can give.",
      });
      return;
    }

    const response = await fetch("/api/goods/pledges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isShared ? values : { ...values, amount: undefined }),
    });
    const result = await response.json();

    onPledged();

    if (!result.success) {
      const fieldErrors: Record<string, string[]> = result.errors ?? {};
      const firstFieldError = Object.values(fieldErrors).flat()[0];

      form.setError("root", {
        message: firstFieldError || result.message || "Could not save your pledge.",
      });
      return;
    }

    toast.success("Thank you! Your name has been added.");
    onOpenChange(false);
  }

  return (
    <GlassDialog
      open={Boolean(item)}
      onOpenChange={onOpenChange}
      title={item?.name ?? ""}
      description={
        isShared && item
          ? `${formatItemAmount(item, item.remainingAmount ?? 0)} still needed. You can give all of it or just a part.`
          : "Add your name to provide this item. Only the admin can change it afterwards."
      }
      footer={
        <GlassButton
          type="submit"
          form="pledge-form"
          tone="primary"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? "Saving..." : "Add my name"}
        </GlassButton>
      }
    >
      <form
        id="pledge-form"
        className="grid gap-3 sm:gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {item?.note && (
          <p className="rounded-2xl border border-white/16 bg-white/6 px-4 py-3 text-sm text-[#fff2da]">
            {item.note}
          </p>
        )}

        {isShared && (
          <label className="grid gap-2 text-sm font-medium">
            {isMoney
              ? "Amount (Rs.)"
              : `How many can you give?${item?.unit ? ` (${item.unit})` : ""}`}
            <GlassInput
              type="number"
              inputMode={isMoney ? "numeric" : "decimal"}
              min={isMoney ? 1 : 0.01}
              step={isMoney ? 1 : "any"}
              max={item?.remainingAmount ?? undefined}
              placeholder={isMoney ? "100" : String(item?.remainingAmount ?? "")}
              {...form.register("amount")}
            />
            <FieldError message={form.formState.errors.amount?.message} />
          </label>
        )}

        <label className="grid gap-2 text-sm font-medium">
          Name
          <GlassInput autoComplete="name" {...form.register("name")} />
          <FieldError message={form.formState.errors.name?.message} />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Phone number
          <GlassInput
            autoComplete="tel"
            inputMode="tel"
            placeholder="0771234567"
            {...form.register("phone")}
          />
          <FieldError message={form.formState.errors.phone?.message} />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Batch
          <GlassInput placeholder="E22" {...form.register("batch")} />
          <FieldError message={form.formState.errors.batch?.message} />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          <span>
            Faculty <span className="font-normal text-[#cdb390]">(optional)</span>
          </span>
          <GlassInput placeholder="Engineering" {...form.register("faculty")} />
          <FieldError message={form.formState.errors.faculty?.message} />
        </label>

        <p className="text-xs text-[#cdb390]">
          Your phone number is only visible to the admin.
        </p>

        {form.formState.errors.root && (
          <p className="rounded-2xl border border-[#ff3b30]/20 bg-[#ff3b30]/10 px-4 py-3 text-sm text-[#ff8a84]">
            {form.formState.errors.root.message}
          </p>
        )}
      </form>
    </GlassDialog>
  );
}
