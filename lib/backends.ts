export type BackendKey = "piped" | "invidious";

type BackendDef = {
  name: string;
  /** Where to open embeds like /watch?v=... */
  embed: (base: string, id: string) => string;
  /** Endpoints that return stream info for a video */
  streams: (api: string, id: string) => string[];
  /** Trending endpoint(s) */
  trending: (api: string, opts: { region?: string }) => string[];
  /** Search endpoint(s) */
  search: (
    api: string,
    q: string,
    opts: { region?: string; hl?: string }
  ) => string[];

  /** Default bases the UI can initialize with */
  defaults: {
    embedBase: string; // e.g. https://piped.withmilo.xyz
    apiBase: string;   // e.g. https://piped.withmilo.xyz (we use /streams,/trending,/search here)
    // Optional helpful suggestions to show in a selector
    suggestApiBases?: string[];
  };
};

export const BACKENDS: Record<BackendKey, BackendDef> = {
  piped: {
    name: "Piped",
    embed: (base, id) =>
      `${base.replace(/\/$/, "")}/watch?v=${encodeURIComponent(id)}`,
    // You asked to use plain `/streams/:id` (no /api/v1) on your instance.
    streams: (api, id) => [
      `${api.replace(/\/$/, "")}/streams/${encodeURIComponent(id)}`
    ],
    trending: (api, { region }) => [
      `${api.replace(/\/$/, "")}/trending${
        region ? `?region=${encodeURIComponent(region)}` : ""
      }`
    ],
    // Piped search requires q and filter (e.g., filter=videos)
    search: (api, q, { region, hl }) => {
      const base = api.replace(/\/$/, "");
      const params = new URLSearchParams();
      params.set("q", q);
      params.set("filter", "videos");
      if (region) params.set("region", region);
      if (hl) params.set("hl", hl);
      return [`${base}/search?${params.toString()}`];
    },
    defaults: {
      // Use your working instance:
      embedBase: "https://piped.withmilo.xyz",
      // IMPORTANT: using the same base here because your instance serves
      // /streams, /trending, /search without /api/v1
      apiBase: "https://piped.withmilo.xyz",
      suggestApiBases: [
        "https://piped.withmilo.xyz",
        "https://piped.video",
        "https://piped.lunar.icu"
      ]
    }
  },

  invidious: {
    name: "Invidious",
    embed: (base, id) =>
      `${base.replace(/\/$/, "")}/watch?v=${encodeURIComponent(id)}`,
    streams: (api, id) => [
      `${api.replace(/\/$/, "")}/api/v1/videos/${encodeURIComponent(id)}`
    ],
    trending: (api, { region }) => [
      `${api.replace(/\/$/, "")}/api/v1/trending${
        region ? `?region=${encodeURIComponent(region)}` : ""
      }`
    ],
    search: (api, q, { region, hl }) => {
      const params = new URLSearchParams({ q });
      if (region) params.set("region", region);
      if (hl) params.set("hl", hl);
      return [`${api.replace(/\/$/, "")}/api/v1/search?${params.toString()}`];
    },
    defaults: {
      // Popular public instance for embeds
      embedBase: "https://yewtu.be",
      // Invidious API lives under /api/v1 on the same host
      apiBase: "https://yewtu.be",
      suggestApiBases: ["https://yewtu.be", "https://invidious.snopyta.org"]
    }
  }
};
