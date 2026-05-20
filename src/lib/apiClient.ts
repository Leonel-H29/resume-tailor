// lib/apiClient.ts
// Centralised fetch wrapper for all internal API calls.
// Injects the shared API secret header so routes can reject unauthorised requests.

import type { OptimizedResume } from "@/domain/entities/OptimizedResume";

const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET ?? "";

function buildHeaders(extra?: Record<string, string>): HeadersInit {
  return {
    "x-api-secret": API_SECRET,
    ...extra,
  };
}

export type ApiPostBody = FormData | OptimizedResume;

export async function apiPost(path: string, body: ApiPostBody): Promise<Response> {
  const isFormData = body instanceof FormData;
  return fetch(path, {
    method: "POST",
    headers: buildHeaders(
      isFormData ? undefined : { "Content-Type": "application/json" }
    ),
    body: isFormData ? body : JSON.stringify(body),
  });
}

export async function apiPostJson<T>(path: string, body: ApiPostBody): Promise<T> {
  const res = await apiPost(path, body);
  const data = (await res.json()) as T & { success?: boolean; error?: string };
  if (!res.ok || (data && "success" in data && data.success === false)) {
    const errMsg = "error" in data && typeof data.error === "string"
      ? data.error
      : `Request to ${path} failed with status ${res.status}`;
    throw new Error(errMsg);
  }
  return data as T;
}
