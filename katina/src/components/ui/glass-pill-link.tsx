import type { ComponentProps } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export const glassPillClassName =
  "inline-flex h-11 items-center gap-2 rounded-full border border-white/74 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.045)_48%,rgba(255,255,255,0.13))] px-4 text-sm font-medium text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.86),inset_0_0_0_1px_rgba(255,255,255,0.12),0_8px_24px_rgba(8,20,40,0.08)] backdrop-blur-[16px] backdrop-saturate-[1.45] transition hover:bg-white/24 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/30 dark:border-white/24 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.018)_48%,rgba(255,255,255,0.040))] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_26px_rgba(0,0,0,0.34)]";

/** Floating glass pill used for the top-of-page navigation buttons. */
export function GlassPillLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={cn(glassPillClassName, className)} {...props} />;
}
