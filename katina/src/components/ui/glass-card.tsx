import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function GlassCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[30px] border border-white/78 bg-[linear-gradient(180deg,rgba(255,255,255,0.20),rgba(255,255,255,0.045)_48%,rgba(255,255,255,0.12))] shadow-[inset_0_1px_0_rgba(255,255,255,0.86),inset_0_0_0_1px_rgba(255,255,255,0.12),inset_0_-24px_52px_rgba(255,255,255,0.035),0_24px_80px_rgba(8,20,40,0.12)] backdrop-blur-[22px] backdrop-saturate-[1.45] before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-white/80 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_28%,rgba(255,255,255,0.055)_49%,transparent_54%,rgba(255,255,255,0.08)_100%)] after:opacity-85 dark:border-white/24 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.018)_48%,rgba(255,255,255,0.040))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_0_0_1px_rgba(255,255,255,0.055),inset_0_-24px_52px_rgba(255,255,255,0.014),0_28px_90px_rgba(0,0,0,0.50)] dark:before:bg-white/32 dark:after:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_28%,rgba(255,255,255,0.035)_49%,transparent_54%,rgba(255,255,255,0.045)_100%)]",
        className,
      )}
      {...props}
    />
  );
}
