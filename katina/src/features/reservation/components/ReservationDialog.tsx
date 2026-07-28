"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";

import { RESPONSIBILITY_EVENTS, type EventNumber } from "@/constants/events";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput, GlassTextarea } from "@/components/ui/glass-input";
import { cn } from "@/lib/utils";
import {
  reservationCreateSchema,
  type ReservationCreateInput,
} from "@/validators/reservation";

export function ReservationDialog({
  selection,
  open,
  onOpenChange,
  onReserved,
}: {
  selection: { date: string; availableEventNumbers: EventNumber[] } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReserved: () => void;
}) {
  const form = useForm<
    z.input<typeof reservationCreateSchema>,
    unknown,
    ReservationCreateInput
  >({
    resolver: zodResolver(reservationCreateSchema),
    defaultValues: {
      date: selection?.date ?? "",
      eventNumber: selection?.availableEventNumbers[0] ?? 1,
      name: "",
      phone: "",
      batch: "",
      accommodationType: "HOSTEL",
      boardingDetails: "",
    },
  });
  const titleId = useId();
  const descriptionId = useId();
  const [selectedEventNumbers, setSelectedEventNumbers] = useState<EventNumber[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      date: selection?.date ?? "",
      eventNumber: selection?.availableEventNumbers[0] ?? 1,
      name: "",
      phone: "",
      batch: "",
      accommodationType: "HOSTEL",
      boardingDetails: "",
    });
  }, [form, open, selection]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousDocumentOverflow = documentElement.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      documentElement.style.overflow = previousDocumentOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenChange, open]);

  const accommodationType = useWatch({
    control: form.control,
    name: "accommodationType",
  });
  const availableEventNumbers = selection?.availableEventNumbers ?? [];

  async function onSubmit(values: ReservationCreateInput) {
    if (selectedEventNumbers.length === 0) {
      form.setError("root", {
        message: "Choose at least one responsibility.",
      });
      return;
    }

    for (const eventNumber of selectedEventNumbers) {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, eventNumber }),
      });
      const result = await response.json();

      if (!result.success) {
        form.setError("root", {
          message: result.message || "Reservation could not be saved.",
        });
        onReserved();
        return;
      }
    }

    onReserved();
    toast.success(
      selectedEventNumbers.length === 1
        ? "Reservation saved."
        : `${selectedEventNumbers.length} reservations saved.`,
    );
    onOpenChange(false);
  }

  function toggleEventNumber(eventNumber: EventNumber) {
    setSelectedEventNumbers((current) =>
      current.includes(eventNumber)
        ? current.filter((value) => value !== eventNumber)
        : [...current, eventNumber],
    );
  }

  function selectAllAvailableEvents() {
    setSelectedEventNumbers(
      selectedEventNumbers.length === availableEventNumbers.length
        ? []
        : availableEventNumbers,
    );
  }

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto overscroll-contain bg-black/12 p-4 backdrop-blur-[12px] backdrop-saturate-[1.15]"
      onMouseDown={() => onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto overflow-x-hidden overscroll-contain rounded-[30px] border border-white/78 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.070)_48%,rgba(255,255,255,0.16))] p-4 pb-24 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.90),inset_0_0_0_1px_rgba(255,255,255,0.14),inset_0_-20px_48px_rgba(255,255,255,0.045),0_34px_100px_rgba(8,20,40,0.22)] backdrop-blur-[10px] backdrop-brightness-[1.18] backdrop-saturate-[1.55] before:pointer-events-none before:absolute before:inset-x-7 before:top-0 before:h-px before:bg-white/86 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.20),transparent_28%,rgba(255,255,255,0.070)_50%,transparent_56%,rgba(255,255,255,0.070)_100%)] after:opacity-85 sm:p-6 sm:pb-6 dark:border-white/34 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.055)_48%,rgba(255,255,255,0.12))] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_0_0_1px_rgba(255,255,255,0.10),inset_0_-20px_48px_rgba(255,255,255,0.030),0_34px_100px_rgba(0,0,0,0.26)] dark:before:bg-white/48 dark:after:bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_28%,rgba(255,255,255,0.060)_50%,transparent_56%,rgba(255,255,255,0.060)_100%)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 z-20 inline-flex size-8 items-center justify-center rounded-full border border-white/24 bg-white/8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-[12px] transition hover:bg-white/14 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#66b3ff]/30"
        >
          <XIcon className="size-4" />
        </button>

        <div className="relative z-10 flex flex-col gap-2">
          <h2 id={titleId} className="text-xl font-medium text-[#fff2da]">
            Reserve responsibility
          </h2>
          <p id={descriptionId} className="text-sm text-[#dbc6aa]">
            {selection
              ? `Choose responsibilities on ${format(parseISO(selection.date), "EEEE, MMMM d")}`
              : "Choose an available responsibility."}
          </p>
        </div>

        <form className="relative z-10 grid gap-3 sm:gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <input type="hidden" {...form.register("date")} />
          <input type="hidden" {...form.register("eventNumber")} />

          <fieldset className="grid gap-2 text-sm font-medium">
            <legend>Responsibilities</legend>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={selectAllAvailableEvents}
                className="rounded-full border border-white/24 bg-white/8 px-3 py-1 text-xs text-[#fff2da] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:bg-white/14 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#66b3ff]/30"
              >
                {selectedEventNumbers.length === availableEventNumbers.length
                  ? "Clear all"
                  : "Select all"}
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {RESPONSIBILITY_EVENTS.map((event) => {
                const isAvailable = availableEventNumbers.includes(event.number);
                const isChecked = selectedEventNumbers.includes(event.number);

                return (
                  <label
                    key={event.number}
                    className={cn(
                      "flex min-h-10 items-center gap-3 rounded-[18px] border px-3 py-1.5 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-[16px] transition sm:min-h-11 sm:py-2",
                      isAvailable
                        ? "cursor-pointer border-white/24 bg-white/8 text-white has-[:checked]:border-[#b6e56f]/70 has-[:checked]:bg-[#b6e56f]/16"
                        : "cursor-not-allowed border-white/10 bg-white/4 text-white/42",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={!isAvailable}
                      onChange={() => toggleEventNumber(event.number)}
                      className="size-4 accent-[#b6e56f]"
                    />
                    <span>
                      {event.number}. {event.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <label className="grid gap-2 text-sm font-medium">
            Name
            <GlassInput autoComplete="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <span className="text-xs text-[#ff3b30]">
                {form.formState.errors.name.message}
              </span>
            )}
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Phone number
            <GlassInput
              autoComplete="tel"
              placeholder="0771234567"
              {...form.register("phone")}
            />
            {form.formState.errors.phone && (
              <span className="text-xs text-[#ff3b30]">
                {form.formState.errors.phone.message}
              </span>
            )}
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Batch
            <GlassInput placeholder="E20" {...form.register("batch")} />
            {form.formState.errors.batch && (
              <span className="text-xs text-[#ff3b30]">
                {form.formState.errors.batch.message}
              </span>
            )}
          </label>

          <fieldset className="grid gap-2 text-sm font-medium">
            <legend>Accommodation</legend>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "HOSTEL", label: "Hostel" },
                { value: "BOARDING", label: "Boarding" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex h-11 cursor-pointer items-center justify-center rounded-[18px] border border-white/74 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.045)_48%,rgba(255,255,255,0.13))] px-4 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.86),inset_0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-[16px] backdrop-saturate-[1.45] transition has-[:checked]:border-[#66b3ff]/70 has-[:checked]:text-[#66b3ff] dark:border-white/24 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.018)_48%,rgba(255,255,255,0.040))] dark:has-[:checked]:text-[#66b3ff]"
                >
                  <input
                    type="radio"
                    value={option.value}
                    className="sr-only"
                    {...form.register("accommodationType")}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {form.formState.errors.accommodationType && (
              <span className="text-xs text-[#ff3b30]">
                {form.formState.errors.accommodationType.message}
              </span>
            )}
          </fieldset>

          {accommodationType === "BOARDING" && (
            <label className="grid gap-2 text-sm font-medium">
              Boarding name or address
              <GlassTextarea {...form.register("boardingDetails")} />
              {form.formState.errors.boardingDetails && (
                <span className="text-xs text-[#ff3b30]">
                  {form.formState.errors.boardingDetails.message}
                </span>
              )}
            </label>
          )}

          {form.formState.errors.root && (
            <p className="rounded-2xl border border-[#ff3b30]/20 bg-[#ff3b30]/10 px-4 py-3 text-sm text-[#c8271e] dark:text-[#ff8a84]">
              {form.formState.errors.root.message}
            </p>
          )}

          <div className="sticky bottom-0 -mx-4 -mb-24 mt-1 border-t border-white/14 bg-[linear-gradient(180deg,rgba(24,18,14,0.12),rgba(24,18,14,0.44))] p-4 backdrop-blur-[14px] sm:static sm:m-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-0">
            <GlassButton
              type="submit"
              tone="primary"
              disabled={form.formState.isSubmitting}
              className="w-full"
            >
              {form.formState.isSubmitting ? "Saving..." : "Save reservation"}
            </GlassButton>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
