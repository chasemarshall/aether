// lib/backends.ts
export type BackendKey = "piped" | "invidious";

export type BackendDef = {
  /** Human-readable name used in the UI */
  label: string;

  /** Default bases used by SettingsPanel (embed + API) */
  defaults: {
    embedBase: string;
    apiBase: string;
  };

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
    opts?: {
      filter?: "videos" | "channels" | "playlists";
      region?: string;
      hl?: string;
    }
  ) => string[];
};

export const BACKENDS: Record<BackendKey, BackendDef> = {
  piped: {
    label: "Piped",
    defaults: {
      // Use your own instances here
      embedBase: "https://piped.withmilo.xyz",
      apiBase: "https://pipedapi.withmilo.xyz",
    },
    embed: (base, id) => `${base}/watch?v=${id}`,
    // NOTE: you asked to use bare /streams (no /api/v1)
    streams: (api, id) => [`${api}/streams/${id}`],
    trending: (api, opts) => [
      `${api}/trending?region=${encodeURIComponent(opts?.region ?? "US")}`,
    ],
    search: (api, q, opts) => {
      const params = new URLSearchParams({
        q,
        region: opts?.region ?? "US",
        hl: opts?.hl ?? "en",
        filter: opts?.filter ?? "videos",
      });
      return [`${api}/search?${params.toString()}`];
    },
  },

  invidious: {
    label: "Invidious",
    // If you don’t use Invidious, leave these as placeholders or swap to your instance
    defaults: {
      embedBase: "https://yewtu.be",
      apiBase: "https://yewtu.be",
    },
    embed: (base, id) => `${base}/embed/${id}`,
    streams: (api, id) => [
      `${api}/api/v1/videos/${id}`,
      `${api}/api/v1/captions/${id}`,
    ],
    trending: (api, opts) => [
      `${api}/api/v1/trending?region=${encodeURIComponent(opts?.region ?? "US")}`,
    ],
    search: (api, q, opts) => {
      const params = new URLSearchParams({
        q,
        type: (opts?.filter ?? "videos") === "videos" ? "video" : (opts?.filter ?? "video"),
        region: opts?.region ?? "US",
      });
      return [`${api}/api/v1/search?${params.toString()}`];
    },
  },
};
