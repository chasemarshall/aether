"use client";

import { useEffect, useRef, useState } from "react";
import { BACKENDS, type BackendKey } from "@lib/backends";
import { fetchFirstJSON } from "@lib/fetcher";

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
  const [nativeSrc, setNativeSrc] = useState<string | null>(null);
  const [error, setError] = useState("");
  const triedIframeRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!videoId) return;
      setNativeSrc(null);
      setError("");
      triedIframeRef.current = false;

      try {
        const candidates = BACKENDS[backend].streams(apiBase, videoId);
        const data = await fetchFirstJSON<any>(candidates);

        // Prefer a muxed video stream for Piped
        let src: string | null = null;
        if (backend === "piped") {
          const muxed = Array.isArray(data?.videoStreams)
            ? data.videoStreams.find((s: any) => s && s.videoOnly === false && /^video\//.test(s.mimeType ?? ""))
            : null;
          src =
            data?.hls ||
            muxed?.url ||
            data?.videoStreams?.find((s: any) => s && s.videoOnly === false)?.url ||
            data?.formatStreams?.[0]?.url ||              // some instances expose this
            data?.audioStreams?.[0]?.url ||               // last resort (audio-only)
            null;
        } else {
          // Invidious
          src =
            data?.hlsUrl ||
            data?.formatStreams?.find((f: any) => /^video\//.test(f?.type ?? ""))?.url ||
            data?.formatStreams?.[0]?.url ||
            data?.adaptiveFormats?.find((f: any) => /^video\//.test(f?.type ?? ""))?.url ||
            data?.adaptiveFormats?.[0]?.url ||
            null;
        }

        if (!cancelled) setNativeSrc(src);
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message || e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [backend, apiBase, videoId]);

  const iframeSrc = BACKENDS[backend].embed(embedBase, videoId ?? "");

  // If native <video> errors or is blocked, flip to iframe automatically
  function handleVideoError() {
    if (!triedIframeRef.current) {
      triedIframeRef.current = true;
      setNativeSrc(null); // forces iframe render
      setError("Native playback failed");
    }
  }

  if (!videoId) return null;

  return (
    <div className="mt-6">
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black">
        {nativeSrc ? (
          <video
            src={nativeSrc}
            className="w-full aspect-video bg-black"
            controls
            playsInline
            // Safari/quieter errors → ensure we downgrade on any error:
            onError={handleVideoError}
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
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
