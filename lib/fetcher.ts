export async function fetchJSON<T = any>(url: string): Promise<T> {
  const r = await fetch(url, { mode: "cors", credentials: "omit" });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json() as Promise<T>;
}
