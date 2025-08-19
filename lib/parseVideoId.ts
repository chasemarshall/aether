/** Extract a YouTube video id from many possible inputs (URL or plain ID). */
export function parseVideoId(input: string | null | undefined): string | null {
  if (!input) return null;
  const str = String(input).trim();
  const idLike = /[A-Za-z0-9_-]{11}/;

  try {
    // Plain ID
    if (idLike.test(str) && str.length === 11) return str;

    // Try URL
    const u = new URL(str);

    // watch?v=ID
    const v = u.searchParams.get("v");
    if (v && idLike.test(v)) return v;

    // youtu.be/ID
    const short = u.pathname.match(/\/([A-Za-z0-9_-]{11})$/);
    if (short) return short[1];

    // /watch/ID or /embed/ID
    const path = u.pathname.match(/(?:watch|embed)\/?([A-Za-z0-9_-]{11})$/);
    if (path) return path[1];
  } catch {
    // not a URL, fall through
  }

  // Fallback: find a token
  const m = str.match(idLike);
  return m ? m[0] : null;
}
