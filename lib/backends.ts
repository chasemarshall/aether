// lib/backends.ts
export type BackendKey = "invidious" | "piped";

const env = {
  pipedApi: process.env.NEXT_PUBLIC_PIPED_API ?? "https://pipedapi.kavin.rocks",
  pipedEmbed: process.env.NEXT_PUBLIC_PIPED_EMBED ?? "https://piped.video",
  invidious: process.env.NEXT_PUBLIC_INVIDIOUS ?? "https://yewtu.be",
};

export const BACKENDS: Record<
  BackendKey,
  {
    label: string;
    defaults: { embedBase: string; apiBase: string };
    // Build URLs
    search: (api: string, q: string) => string;
    trending: (api: string, region?: string) => string;
    streams: (api: string, id: string) => string;
    embed: (embedBase: string, id: string) => string;
    // Mapping helpers to normalize items
    mapSearchItem: (raw: any) => null | {
      id: string;
      title: string;
      author?: string;
      views?: number;
      duration?: number;
      thumbnail?: string;
    };
  }
> = {
  piped: {
    label: "Piped",
    defaults: { embedBase: env.pipedEmbed, apiBase: env.pipedApi },
    search: (api, q) => `${api.replace(/\/$/, "")}/api/v1/search?q=${encodeURIComponent(q)}&region=US&hl=en&type=video`,
    trending: (api, region = "US") => `${api.replace(/\/$/, "")}/api/v1/trending?region=${region}`,
    streams: (api, id) => `${api.replace(/\/$/, "")}/api/v1/streams/${id}`,
    embed: (embedBase, id) => `${embedBase.replace(/\/$/, "")}/watch?v=${id}`,
    mapSearchItem: (it) => {
      // Piped search returns { type?, url?, title, uploaderName, views, duration, thumbnail }
      if (it?.type && it.type !== "video") return null;
      const id =
        it?.url?.split("v=")?.[1] ||
        it?.url?.split("/").pop() ||
        it?.id ||
        it?.videoId;
      if (!id) return null;
      return {
        id,
        title: it.title,
        author: it.uploaderName || it.author,
        views: it.views,
        duration: it.duration || it.lengthSeconds,
        thumbnail: it.thumbnail,
      };
    },
  },
  invidious: {
    label: "Invidious",
    defaults: { embedBase: env.invidious, apiBase: env.invidious },
    search: (api, q) => `${api.replace(/\/$/, "")}/api/v1/search?q=${encodeURIComponent(q)}&type=video`,
    trending: (api, region = "US") => `${api.replace(/\/$/, "")}/api/v1/trending?region=${region}`,
    streams: (api, id) => `${api.replace(/\/$/, "")}/api/v1/videos/${id}`,
    embed: (embedBase, id) => `${embedBase.replace(/\/$/, "")}/watch?v=${id}`,
    mapSearchItem: (it) => {
      const id = it?.videoId || it?.id;
      if (!id) return null;
      const thumbs = it?.videoThumbnails || [];
      const thumb = thumbs[thumbs.length - 1]?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      return {
        id,
        title: it.title,
        author: it.author,
        views: it.viewCount,
        duration: it.lengthSeconds,
        thumbnail: thumb,
      };
    },
  },
};
