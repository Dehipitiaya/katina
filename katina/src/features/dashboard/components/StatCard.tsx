import type { ReactNode } from "react";

import { GlassCard } from "@/components/ui/glass-card";

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#7b5a3b] dark:text-[#cdb390]">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-[#2e1b10] dark:text-[#fff2da]">{value}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-full border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.46),rgba(255,255,255,0.10)_48%,rgba(255,255,255,0.34))] text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_1px_0_0_rgba(255,255,255,0.58),0_8px_22px_rgba(8,20,40,0.10)] backdrop-blur-[38px] dark:border-white/26 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.035)_48%,rgba(255,255,255,0.08))] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_10px_26px_rgba(0,0,0,0.32)]">
          {icon}
        </div>
      </div>
    </GlassCard>
  );
}
