import { cn } from "@/lib/utils";

export function AvailabilityIndicator({
  reserved,
  label,
  muted = false,
}: {
  reserved: boolean;
  label: string;
  muted?: boolean;
}) {
  return (
    <span
      aria-label={label}
      title={label}
      className={cn(
        "block h-3 flex-1 rounded-full border transition",
        muted
          ? "border-slate-300/60 bg-[linear-gradient(180deg,#cbd5e1,#94a3b8)] shadow-[inset_0_1px_0_rgba(255,255,255,0.30)] dark:border-white/12 dark:bg-[linear-gradient(180deg,#64748b,#334155)]"
          : reserved
          ? "border-[#ff6b4a]/68 bg-[linear-gradient(180deg,rgba(255,107,74,0.76),rgba(200,47,34,0.68))] shadow-[inset_0_1px_0_rgba(255,238,220,0.50),0_0_16px_rgba(255,80,58,0.32)]"
          : "border-[#a6d76d]/68 bg-[linear-gradient(180deg,rgba(182,229,111,0.76),rgba(95,159,60,0.68))] shadow-[inset_0_1px_0_rgba(255,245,225,0.50),0_0_16px_rgba(90,200,90,0.28)]",
      )}
    />
  );
}
