// lib/backends.ts
import type { VideoItem } from "@components/VideoGrid";

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

  /** Map a raw search/trending item to a VideoGrid-compatible object */
  mapSearchItem: (it: any) => VideoItem | null;
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
    mapSearchItem: (it: any) => {
      if (it?.type !== "video") return null;
      const id =
        it.url?.split("v=")?.[1] ||
        it.url?.split("/").pop() ||
        it.id ||
        it.videoId;
      return {
        id,
        title: it.title,
        author: it.uploaderName || it.author,
        views: it.views,
        duration: it.duration || it.lengthSeconds,
        thumbnail: it.thumbnail,
      } as VideoItem;
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
    mapSearchItem: (it: any) => {
      const id = it.videoId || it.id;
      const thumb =
        it.videoThumbnails?.[it.videoThumbnails.length - 1]?.url ||
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      return {
        id,
        title: it.title,
        author: it.author,
        views: it.viewCount || it.views,
        duration: it.lengthSeconds,
        thumbnail: thumb,
      } as VideoItem;
    },
  },
};
