import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type GlassButtonProps = ComponentProps<"button"> & {
  tone?: "primary" | "neutral" | "danger" | "success";
};

const toneClasses = {
  primary:
    "border-white/40 bg-[linear-gradient(180deg,rgba(40,128,210,0.92),rgba(30,94,158,0.88))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_10px_30px_rgba(30,94,158,0.22)] hover:brightness-105 focus-visible:ring-sky-500/25",
  neutral:
    "border-white/74 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.045)_48%,rgba(255,255,255,0.13))] text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.86),inset_0_0_0_1px_rgba(255,255,255,0.12),inset_0_-12px_24px_rgba(255,255,255,0.035),0_8px_24px_rgba(8,20,40,0.08)] hover:bg-white/24 focus-visible:ring-slate-400/24 dark:border-white/24 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.018)_48%,rgba(255,255,255,0.040))] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_0_0_1px_rgba(255,255,255,0.055),inset_0_-12px_24px_rgba(255,255,255,0.014),0_10px_28px_rgba(0,0,0,0.34)] dark:hover:bg-white/8",
  danger:
    "border-[#b42318]/35 bg-[linear-gradient(180deg,rgba(218,78,54,0.96),rgba(174,42,30,0.90))] text-white shadow-[inset_0_1px_0_rgba(255,238,220,0.34),0_10px_28px_rgba(174,42,30,0.22)] hover:brightness-105 focus-visible:ring-[#b42318]/30",
  success:
    "border-[#4f7f45]/35 bg-[linear-gradient(180deg,rgba(112,151,75,0.96),rgba(79,127,69,0.90))] text-white shadow-[inset_0_1px_0_rgba(255,245,225,0.34),0_10px_28px_rgba(79,127,69,0.20)] hover:brightness-105 focus-visible:ring-[#4f7f45]/30",
};

export function GlassButton({
  className,
  tone = "neutral",
  type = "button",
  ...props
}: GlassButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium backdrop-blur-[16px] backdrop-saturate-[1.45] transition duration-200 focus-visible:outline-none focus-visible:ring-4 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
