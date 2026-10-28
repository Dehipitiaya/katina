"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, ChevronDown, Users } from "lucide-react";

import { formatItemAmount } from "@/features/goods/format";
import { cn } from "@/lib/utils";
import type { PublicDonationItem } from "@/types/donation";

const PANEL_WIDTH = 288;
const PANEL_MAX_HEIGHT = 260;
const GAP = 6;
const EDGE = 16;

/**
 * One-line contributor summary that opens a floating list, so the card keeps
 * the same height however many people contribute.
 */
export function ContributorsDropdown({ item }: { item: PublicDonationItem }) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const { pledges } = item;

  const place = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const width = Math.min(PANEL_WIDTH, window.innerWidth - EDGE * 2);
    const left = Math.min(Math.max(rect.left, EDGE), window.innerWidth - width - EDGE);
    const spaceBelow = window.innerHeight - rect.bottom - GAP - EDGE;
    const spaceAbove = rect.top - GAP - EDGE;
    const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;

    setStyle({
      left,
      width,
      maxHeight: Math.min(PANEL_MAX_HEIGHT, openUp ? spaceAbove : spaceBelow),
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + GAP }
        : { top: rect.bottom + GAP }),
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  function toggle() {
    if (!open) {
      place();
    }

    setOpen((current) => !current);
  }

  const label = pledges.length === 1 ? "1 contributor" : `${pledges.length} contributors`;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="mt-3 flex h-8 w-full min-w-0 items-center gap-2 rounded-full border border-[#b6e56f]/30 bg-[#b6e56f]/10 px-3 text-left text-xs text-[#dff7b8] transition hover:bg-[#b6e56f]/16 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#66b3ff]/30"
      >
        <Users className="size-3.5 shrink-0" />
        <span className="shrink-0 font-medium">{label}</span>
        <span className="min-w-0 flex-1 truncate text-[#cdb390]">
          {pledges.map((pledge) => pledge.name).join(", ")}
        </span>
        <ChevronDown className={cn("size-3.5 shrink-0 transition", open && "rotate-180")} />
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            style={style}
            className="reservation-scroll fixed z-[90] overflow-y-auto overscroll-contain rounded-[20px] border border-white/30 bg-[linear-gradient(180deg,rgba(52,34,22,0.92),rgba(36,24,16,0.94))] p-2 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_24px_60px_rgba(0,0,0,0.38)] backdrop-blur-[16px] backdrop-saturate-[1.35]"
          >
            <ul className="grid gap-1">
              {pledges.map((pledge) => (
                <li
                  key={pledge.id}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm text-[#fff2da]"
                >
                  <CheckCircle2 className="size-3.5 shrink-0 text-[#b6e56f]" />
                  <span className="min-w-0 flex-1 break-words">{pledge.name}</span>
                  {pledge.amount !== null && (
                    <span className="shrink-0 text-xs text-[#cdb390]">
                      {formatItemAmount(item, pledge.amount)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
}
