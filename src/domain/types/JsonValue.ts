// Domain: strict JSON value types for external payload validation

export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseJsonObject(raw: string): JsonObject {
  const value = JSON.parse(raw) as JsonValue;
  if (!isJsonObject(value)) {
    throw new Error('Expected a JSON object at the root');
  }
  return value;
}
