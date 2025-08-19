export async function fetchJSON<T = any>(url: string): Promise<T> {
  const r = await fetch(url, { mode: "cors", credentials: "omit" });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json() as Promise<T>;
}

/** Try a list of candidate URLs, return the first successful JSON. */
export async function fetchFirstJSON<T = any>(urls: string[]): Promise<T> {
  let lastErr: any;
  for (const u of urls) {
    try {
      const r = await fetch(u, { mode: "cors", credentials: "omit" });
      if (!r.ok) {
        // Continue on 404/5xx to the next candidate
        lastErr = new Error(`${r.status} ${r.statusText} @ ${u}`);
        continue;
      }
      const text = await r.text();
      try {
        return JSON.parse(text) as T;
      } catch {
        lastErr = new Error(`Non-JSON response @ ${u}`);
        continue;
      }
    } catch (e) {
      lastErr = e;
      continue;
    }
  }
  throw lastErr ?? new Error("All candidates failed");
}
