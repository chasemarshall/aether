export type BackendKey = "piped" | "invidious";

export const BACKENDS: Record<
  BackendKey,
  {
    name: string;
    embed: (base: string, id: string) => string;
    streams: (api: string, id: string) => string[];
    trending: (api: string, opts: { region?: string }) => string[];
    search: (api: string, q: string, opts: { region?: string; hl?: string }) => string[];
  }
> = {
  piped: {
    name: "Piped",
    embed: (base, id) => `${base.replace(/\/$/, "")}/watch?v=${encodeURIComponent(id)}`,
    // You asked to use plain `/streams/:id` on your instance
    streams: (api, id) => [`${api.replace(/\/$/, "")}/streams/${encodeURIComponent(id)}`],
    trending: (api, { region }) => [
      `${api.replace(/\/$/, "")}/trending${region ? `?region=${encodeURIComponent(region)}` : ""}`
    ],
    search: (api, q, { region, hl }) => {
      const base = api.replace(/\/$/, "");
      const params = new URLSearchParams();
      params.set("q", q);
      params.set("filter", "videos"); // REQUIRED by Piped search
      if (region) params.set("region", region);
      if (hl) params.set("hl", hl);
      return [`${base}/search?${params.toString()}`];
    }
  },
  invidious: {
    name: "Invidious",
    embed: (base, id) => `${base.replace(/\/$/, "")}/watch?v=${encodeURIComponent(id)}`,
    streams: (api, id) => [`${api.replace(/\/$/, "")}/api/v1/videos/${encodeURIComponent(id)}`],
    trending: (api, { region }) => [
      `${api.replace(/\/$/, "")}/api/v1/trending${region ? `?region=${encodeURIComponent(region)}` : ""}`
    ],
    search: (api, q, { region, hl }) => {
      const params = new URLSearchParams({ q });
      if (region) params.set("region", region);
      if (hl) params.set("hl", hl);
      return [`${api.replace(/\/$/, "")}/api/v1/search?${params.toString()}`];
    }
  }
};
