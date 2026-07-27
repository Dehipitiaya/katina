import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function GlassInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[18px] border border-white/74 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.045)_48%,rgba(255,255,255,0.13))] px-4 text-sm text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.86),inset_0_0_0_1px_rgba(255,255,255,0.12),inset_0_-12px_24px_rgba(255,255,255,0.035)] outline-none backdrop-blur-[16px] backdrop-saturate-[1.45] transition placeholder:text-slate-500 focus:border-sky-500/45 focus:ring-4 focus:ring-sky-500/14 dark:border-white/24 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.018)_48%,rgba(255,255,255,0.040))] dark:text-white dark:placeholder:text-slate-400 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_0_0_1px_rgba(255,255,255,0.055),inset_0_-12px_24px_rgba(255,255,255,0.014)]",
        className,
      )}
      {...props}
    />
  );
}

export function GlassTextarea({
  className,
  ...props
}: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-none rounded-[18px] border border-white/74 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.045)_48%,rgba(255,255,255,0.13))] px-4 py-3 text-sm text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.86),inset_0_0_0_1px_rgba(255,255,255,0.12),inset_0_-12px_24px_rgba(255,255,255,0.035)] outline-none backdrop-blur-[16px] backdrop-saturate-[1.45] transition placeholder:text-slate-500 focus:border-sky-500/45 focus:ring-4 focus:ring-sky-500/14 dark:border-white/24 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.018)_48%,rgba(255,255,255,0.040))] dark:text-white dark:placeholder:text-slate-400 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_0_0_1px_rgba(255,255,255,0.055),inset_0_-12px_24px_rgba(255,255,255,0.014)]",
        className,
      )}
      {...props}
    />
  );
}
