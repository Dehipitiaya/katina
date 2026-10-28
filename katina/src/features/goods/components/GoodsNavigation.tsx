"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

import { glassPillClassName } from "@/components/ui/glass-pill-link";
import { cn } from "@/lib/utils";

export type GoodsSection = { id: string; label: string; count: number };

/** Distance from the top of the viewport at which a section counts as current. */
const ACTIVE_OFFSET = 140;

/** Sticky row of section buttons that scrolls straight to each category. */
export function CategoryNav({ sections }: { sections: GoodsSection[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateActive() {
      let current: string | null = null;

      for (const section of sections) {
        const element = document.getElementById(section.id);

        if (element && element.getBoundingClientRect().top <= ACTIVE_OFFSET) {
          current = section.id;
        }
      }

      setActiveId(current);
    }

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [sections]);

  useEffect(() => {
    const nav = navRef.current;
    const button = activeId ? nav?.querySelector<HTMLElement>(`[data-section="${activeId}"]`) : null;

    if (nav && button) {
      nav.scrollTo({
        left: button.offsetLeft - (nav.clientWidth - button.offsetWidth) / 2,
        behavior: "smooth",
      });
    }
  }, [activeId]);

  if (sections.length < 2) {
    return null;
  }

  return (
    <nav aria-label="Categories" className="sticky top-[4.25rem] z-40 -mx-4 sm:mx-0">
      <div
        ref={navRef}
        className="flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            data-section={section.id}
            aria-current={activeId === section.id ? "true" : undefined}
            onClick={() =>
              document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className={cn(
              glassPillClassName,
              "h-9 shrink-0 px-3.5 text-xs",
              activeId === section.id && "border-[#fff2da]/80 bg-[#fff2da]/22 dark:bg-[#fff2da]/22",
            )}
          >
            {section.label}
            <span className="text-[#cdb390]">{section.count}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/** Floating button that appears after scrolling down and returns to the top. */
export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function updateVisible() {
      setVisible(window.scrollY > 600);
    }

    updateVisible();
    window.addEventListener("scroll", updateVisible, { passive: true });

    return () => window.removeEventListener("scroll", updateVisible);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        glassPillClassName,
        "fixed bottom-5 right-4 z-50 size-12 justify-center px-0 transition-[opacity,transform] duration-300",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
