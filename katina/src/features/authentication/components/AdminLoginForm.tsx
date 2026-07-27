"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";

import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import {
  adminLoginSchema,
  type AdminLoginInput,
} from "@/validators/authentication";

export function AdminLoginForm() {
  const router = useRouter();
  const form = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: AdminLoginInput) {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = await response.json();

    if (!result.success) {
      form.setError("root", {
        message: result.message || "Login failed.",
      });
      return;
    }

    router.push(result.data.redirectTo);
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <label className="grid gap-2 text-sm font-medium">
        Username
        <GlassInput autoComplete="username" {...form.register("username")} />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Password
        <GlassInput
          type="password"
          autoComplete="current-password"
          {...form.register("password")}
        />
      </label>

      {form.formState.errors.root && (
        <p className="rounded-2xl border border-[#ff3b30]/20 bg-[#ff3b30]/10 px-4 py-3 text-sm text-[#c8271e]">
          {form.formState.errors.root.message}
        </p>
      )}

      <GlassButton
        type="submit"
        tone="primary"
        disabled={form.formState.isSubmitting}
        className="mt-2 w-full"
      >
        <LockKeyhole className="size-4" />
        {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
      </GlassButton>
    </form>
  );
}
