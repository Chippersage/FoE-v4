/**
 * Course Route Codec
 * ------------------
 * - Encodes course route params into a masked string
 * - Decodes masked string back into route params
 * - Purpose: URL masking (NOT security)
 */

const ROUTE_SECRET = "PET+2026@+SECRET";

export type CourseRouteParams = {
  programId: string;
  stageId: string;
  unitId: string;
  conceptId: string;
  exp?: number; // optional expiry timestamp
};

/**
 * Encode course route params
 */
export function encodeCourseRoute(
  params: CourseRouteParams,
  options?: { expiresInMs?: number }
): string {
  const payload: CourseRouteParams = {
    ...params,
    exp: options?.expiresInMs
      ? Date.now() + options.expiresInMs
      : undefined,
  };

  const raw = JSON.stringify(payload);

  return btoa(
    encodeURIComponent(`${raw}|${ROUTE_SECRET}`)
  );
}

/**
 * Decode course route params
 */
export function decodeCourseRoute(
  masked: string
): CourseRouteParams | null {
  try {
    const decoded = decodeURIComponent(atob(masked));
    const [json, secret] = decoded.split("|");

    if (secret !== ROUTE_SECRET) return null;

    const data = JSON.parse(json) as CourseRouteParams;

    if (data.exp && Date.now() > data.exp) {
      return null; // expired link
    }

    return data;
  } catch {
    return null;
  }
}
