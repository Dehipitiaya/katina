"use client";

import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Glass modal shell: locks page scroll, closes on Escape / backdrop click,
 * keeps a scrollable body and an optional sticky footer.
 */
export function GlassDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousDocumentOverflow = documentElement.style.overflow;

    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      body.style.overflow = previousOverflow;
      documentElement.style.overflow = previousDocumentOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenChange, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto overscroll-contain bg-black/18 p-4 backdrop-blur-[12px] backdrop-saturate-[1.15]"
      onMouseDown={() => onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "relative flex max-h-[calc(100dvh-1rem)] w-full max-w-lg flex-col overflow-hidden rounded-[30px] border border-white/34 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.055)_48%,rgba(255,255,255,0.12))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_0_0_1px_rgba(255,255,255,0.10),0_34px_100px_rgba(0,0,0,0.30)] backdrop-blur-[14px] backdrop-brightness-[1.1] backdrop-saturate-[1.45]",
          className,
        )}
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

        <div className="flex flex-col gap-1.5 px-4 pb-3 pr-12 pt-4 sm:px-6 sm:pt-6">
          <h2 id={titleId} className="text-xl font-medium text-[#fff2da]">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="text-sm leading-6 text-[#dbc6aa]">
              {description}
            </p>
          )}
        </div>

        {children && (
          <div className="reservation-scroll grid min-h-0 gap-3 overflow-y-auto px-4 pb-4 sm:gap-4 sm:px-6">
            {children}
          </div>
        )}

        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-white/14 bg-[linear-gradient(180deg,rgba(24,18,14,0.08),rgba(24,18,14,0.36))] p-4 backdrop-blur-[14px] sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
