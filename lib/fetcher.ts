export async function fetchFirstJSON<T = any>(
  urls: string[],
  init?: RequestInit
): Promise<T> {
  let lastErr: any = null;
  for (const u of urls) {
    try {
      const r = await fetch(u, {
        // Avoid sending auth headers to public instances
        credentials: "omit",
        cache: "no-store",
        ...init
      });
      if (!r.ok) {
        lastErr = new Error(`HTTP ${r.status} @ ${u}`);
        continue;
      }
      return (await r.json()) as T;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("All fetches failed");
}
