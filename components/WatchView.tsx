"use client";

import { useEffect, useState } from "react";
import { BACKENDS, type BackendKey } from "@lib/backends";
import { fetchJSON } from "@lib/fetcher";

export function WatchView({
  videoId,
  backend,
  embedBase,
  apiBase,
}: {
  videoId: string | null;
  backend: BackendKey;
  embedBase: string;
  apiBase: string;
}) {
  if (!videoId) return null;
  const [nativeSrc, setNativeSrc] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setNativeSrc(null);
      setError("");
      try {
        if (backend === "piped") {
          const data = await fetchJSON<any>(BACKENDS.piped.streams(apiBase, videoId));
          const src =
            data?.hls ||
            data?.videoStreams?.find((s: any) => !s.videoOnly)?.url ||
            data?.audioStreams?.[0]?.url ||
            data?.videoStreams?.[0]?.url ||
            null;
          if (!cancelled) setNativeSrc(src);
        } else {
          const data = await fetchJSON<any>(BACKENDS.invidious.streams(apiBase, videoId));
          const src =
            data?.hlsUrl ||
            data?.formatStreams?.[0]?.url ||
            data?.adaptiveFormats?.[0]?.url ||
            null;
          if (!cancelled) setNativeSrc(src);
        }
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message || e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [backend, apiBase, videoId]);

  const iframeSrc = BACKENDS[backend].embed(embedBase, videoId);

  return (
    <div className="mt-6">
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black">
        {nativeSrc ? (
          <video
            src={nativeSrc}
            className="w-full aspect-video bg-black"
            controls
            playsInline
          />
        ) : (
          <iframe
            src={iframeSrc}
            className="w-full aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={videoId}
          />
        )}
        {error ? (
          <div className="absolute inset-0 grid place-items-center text-sm text-red-500 bg-black/30">
            Native playback failed: {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
