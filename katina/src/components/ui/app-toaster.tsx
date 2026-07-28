"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      richColors
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "border-white/24 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.055)_48%,rgba(255,255,255,0.12))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_18px_46px_rgba(0,0,0,0.28)] backdrop-blur-[18px]",
          title: "text-[#fff2da]",
          description: "text-[#dbc6aa]",
        },
      }}
    />
  );
}
