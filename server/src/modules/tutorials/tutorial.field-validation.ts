import { BadRequestException } from '@nestjs/common';

export function object(value: unknown, code: string) {
  if (!plainObject(value)) fail(code);
}

export function requiredString(body: any, key: string, max: number, code: string) {
  if (typeof body[key] !== 'string' || !body[key].trim() || body[key].length > max) fail(code, { field: key });
}

export function optionalString(body: any, key: string, max: number, code: string) {
  if (has(body, key) && body[key] != null && (typeof body[key] !== 'string' || body[key].length > max)) {
    fail(code, { field: key });
  }
}

export function referenceField(body: any, key: string, max: number, required = false) {
  if (!has(body, key) || body[key] === undefined) {
    if (required) fail('TUTORIAL_FLOW_REFERENCE_FIELD_REQUIRED', { field: key });
    return;
  }
  if (body[key] != null && (typeof body[key] !== 'string' || !body[key] || body[key].length > max)) {
    fail('TUTORIAL_REFERENCE_FIELD_INVALID', { field: key });
  }
}

export function jsonField(body: any, key: string, code: string, required = false) {
  if (!has(body, key)) { if (required) fail(code, { field: key }); return; }
  if (!plainObject(body[key])) fail(code, { field: key });
}

export function boolField(body: any, key: string, code: string, required = false) {
  if (!has(body, key)) { if (required) fail(code, { field: key }); return; }
  if (typeof body[key] !== 'boolean') fail(code, { field: key });
}

export function intField(body: any, key: string, code: string, min: number, required = false) {
  if (!has(body, key)) { if (required) fail(code, { field: key }); return; }
  if (!Number.isInteger(body[key]) || body[key] < min) fail(code, { field: key });
}

export function uniqueIds(items: any[], code: string) {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) fail(code, { id: item.id });
    seen.add(item.id);
  }
}

export function has(value: any, key: string) { return Object.prototype.hasOwnProperty.call(value, key); }
export function plainObject(value: unknown) { return !!value && typeof value === 'object' && !Array.isArray(value); }
export function fail(code: string, detail: Record<string, unknown> = {}): never {
  throw new BadRequestException({ code, ...detail });
}
