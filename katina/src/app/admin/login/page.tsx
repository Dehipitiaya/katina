import { redirect } from "next/navigation";

import { GlassShell } from "@/components/layout/GlassShell";
import { GlassCard } from "@/components/ui/glass-card";
import { AdminLoginForm } from "@/features/authentication/components/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <GlassShell>
      <section className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
        <GlassCard className="w-full p-6 sm:p-8">
          <p className="mb-3 inline-flex rounded-full border border-white/70 bg-white/46 px-3 py-1 text-sm font-semibold text-[#007aff] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl dark:border-white/14 dark:bg-white/8 dark:text-[#66b3ff] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
            Katina Admin
          </p>
          <h1 className="text-3xl font-semibold tracking-normal dark:text-white">
            Sign in to manage reservations.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Admin credentials are predefined for this deployment.
          </p>
          <div className="mt-6">
            <AdminLoginForm />
          </div>
        </GlassCard>
      </section>
    </GlassShell>
  );
}
