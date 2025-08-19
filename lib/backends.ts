// lib/backends.ts
export type BackendKey = "piped" | "invidious";

export type BackendDef = {
  /** Human-readable name used by SettingsPanel */
  label: string;

  /** Build an embeddable video URL */
  embed: (base: string, id: string) => string;

  /** Endpoints to fetch stream metadata for a videoId */
  streams: (api: string, id: string) => string[];

  /** Endpoints to fetch trending items */
  trending: (api: string, opts?: { region?: string }) => string[];

  /** Endpoints to search */
  search: (
    api: string,
    q: string,
    opts?: { filter?: "videos" | "channels" | "playlists"; region?: string; hl?: string }
  ) => string[];
};

export const BACKENDS: Record<BackendKey, BackendDef> = {
  piped: {
    label: "Piped",
    embed: (base, id) => `${base}/watch?v=${id}`,
    streams: (api, id) => [`${api}/streams/${id}`],
    trending: (api, opts) => [`${api}/trending?region=${encodeURIComponent(opts?.region ?? "US")}`],
    search: (api, q, opts) => {
      const params = new URLSearchParams({
        q,
        region: opts?.region ?? "US",
        hl: opts?.hl ?? "en",
        filter: opts?.filter ?? "videos"
      });
      return [`${api}/search?${params.toString()}`];
    }
  },
  invidious: {
    label: "Invidious",
    embed: (base, id) => `${base}/embed/${id}`,
    streams: (api, id) => [
      `${api}/api/v1/videos/${id}`,
      `${api}/api/v1/captions/${id}`
    ],
    trending: (api, opts) => [
      `${api}/api/v1/trending?region=${encodeURIComponent(opts?.region ?? "US")}`
    ],
    search: (api, q, opts) => {
      const params = new URLSearchParams({
        q,
        type: opts?.filter ?? "video",
        region: opts?.region ?? "US"
      });
      return [`${api}/api/v1/search?${params.toString()}`];
    }
  }
};
