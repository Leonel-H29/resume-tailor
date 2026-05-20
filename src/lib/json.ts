// Re-exports domain JSON types for infrastructure / lib convenience

export {
  type JsonPrimitive,
  type JsonObject,
  type JsonArray,
  type JsonValue,
  isJsonObject,
  parseJsonObject,
} from '@/domain/types/JsonValue';

export function getJsonString(obj: JsonObject, key: string): string | undefined {
  const v = obj[key];
  return typeof v === 'string' ? v : undefined;
}

import type { JsonObject } from '@/domain/types/JsonValue';

export function getJsonNumber(obj: JsonObject, key: string): number | undefined {
  const v = obj[key];
  return typeof v === 'number' ? v : undefined;
}

export function getJsonArray(obj: JsonObject, key: string): import('@/domain/types/JsonValue').JsonArray | undefined {
  const v = obj[key];
  return Array.isArray(v) ? v : undefined;
}
