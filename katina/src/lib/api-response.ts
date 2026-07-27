import { NextResponse } from "next/server";
import { ZodError } from "zod";

import type { ApiResponse } from "@/types/api";

export function ok<T>(data: T, init?: ResponseInit, message?: string) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data, message },
    init,
  );
}

export function fail(
  message: string,
  init: ResponseInit = { status: 400 },
  errors?: Record<string, string[]>,
) {
  return NextResponse.json<ApiResponse<never>>(
    { success: false, message, errors },
    init,
  );
}

export function zodErrors(error: ZodError) {
  return error.flatten().fieldErrors;
}
