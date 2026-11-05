import { ValidationError } from "./httpError.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function assertUuid(
  value: string | string[] | undefined,
  fieldLabel = "id"
): string {
  // Express 5 mengetik req.params sebagai string | string[] — ambil elemen pertama jika array.
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !UUID_RE.test(raw)) {
    throw new ValidationError(`Parameter :${fieldLabel} bukan UUID yang valid`);
  }
  return raw;
}

export function required(
  body: Record<string, unknown>,
  field: string
): string {
  const value = body[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(`Field '${field}' wajib diisi`);
  }
  return value.trim();
}

export function optionalString(
  body: Record<string, unknown>,
  field: string,
  fallback?: string
): string | undefined {
  const value = body[field];
  if (value === undefined) return fallback;
  if (value === null) return fallback;
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(`Field '${field}' harus berupa string yang tidak kosong`);
  }
  return value.trim();
}

export function optionalBoolean(
  body: Record<string, unknown>,
  field: string,
  fallback?: boolean
): boolean | undefined {
  const value = body[field];
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") {
    throw new ValidationError(`Field '${field}' harus berupa boolean (true/false)`);
  }
  return value;
}
