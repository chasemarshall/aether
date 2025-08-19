// lib/normalize.ts

/** Ensure a value is always an array (drops null/undefined) */
export const asArray = <T>(x: T | T[] | null | undefined): T[] =>
  Array.isArray(x) ? x : x == null ? [] : [x];

/** Extract a YouTube-like 11-char id from various URL shapes or raw ids */
export function pickVideoIdFromUrl(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();

  // If it already looks like an 11-char ID, return it
  const raw = trimmed.match(/^[a-zA-Z0-9_-]{11}$/);
  if (raw) return raw[0];

  // Try URL parsing
  try {
    const u = new URL(trimmed, "https://dummy.base"); // base for relative /watch?v=...
    // common patterns
    const v = u.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

    // /shorts/:id  /embed/:id  /v/:id  /live/:id etc.
    const pathId = u.pathname.match(
      /(?:^|\/)(?:watch\/|shorts\/|embed\/|v\/|live\/)?([a-zA-Z0-9_-]{11})(?:$|[/?#])/
    );
    if (pathId && pathId[1]) return pathId[1];
  } catch {
    /* non-URL, fall through */
  }

  // Last-resort: grab the first 11-char token that looks like an ID
  const m = trimmed.match(/[a-zA-Z0-9_-]{11}/);
  return m ? m[0] : "";
}
