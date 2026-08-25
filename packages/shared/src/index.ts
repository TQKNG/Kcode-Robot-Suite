export const PLATFORM_NAME = "Kcode Demo Sandbox";

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function immutableCopy<T>(values: readonly T[]): readonly T[] {
  return Object.freeze([...values]);
}
