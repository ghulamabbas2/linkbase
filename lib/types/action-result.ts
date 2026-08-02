// Shared Server Action return shape (docs/errors-and-validation.md): expected
// validation failures are returned, not thrown. Field errors mirror Zod's
// flattened `fieldErrors`, so per-field values may be absent.
export type FieldErrors = Record<string, string[] | undefined>;

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors: FieldErrors };
