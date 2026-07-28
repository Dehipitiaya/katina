import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function GlassShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#1b1511_0%,#182132_46%,#241813_100%)] text-white",
        className,
      )}
    >
      <div
        className="pointer-events-none fixed inset-0 bg-[length:auto_44rem] bg-top bg-no-repeat opacity-66 saturate-[1.04] contrast-[1.03] brightness-[1.02] sm:bg-[length:auto_62rem]"
        style={{
          backgroundImage:
            "image-set(url('/background-01.avif') type('image/avif'), url('/background-01.webp') type('image/webp'), url('/background-01.png') type('image/png'))",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(18,14,12,0.08)_0%,rgba(14,18,26,0.32)_42%,rgba(7,9,13,0.70)_86%),linear-gradient(120deg,rgba(255,255,255,0.045)_0%,transparent_34%),linear-gradient(315deg,rgba(0,122,255,0.035)_0%,transparent_30%)] sm:fixed" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,transparent_28%,rgba(255,255,255,0.025)_100%)] opacity-34 sm:fixed" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(255,255,255,0.11),rgba(255,255,255,0))] sm:fixed" />
      <div className="relative z-10">{children}</div>
    </main>
  );
}
