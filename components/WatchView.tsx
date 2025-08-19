"use client";

import { useEffect, useRef, useState } from "react";
import { BACKENDS, type BackendKey } from "@lib/backends";
import { fetchFirstJSON } from "@lib/fetcher";

type Mode = "native" | "iframe";

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
  const [mode, setMode] = useState<Mode>("native"); // <- track what we're showing
  const demotedToIframe = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!videoId) return;
      setNativeSrc(null);
      setError("");
      setMode("native");
      demotedToIframe.current = false;

      try {
        const candidates = BACKENDS[backend].streams(apiBase, videoId);
        const data = await fetchFirstJSON<any>(candidates);

        let src: string | null = null;
        if (backend === "piped") {
          const muxed = Array.isArray(data?.videoStreams)
            ? data.videoStreams.find(
                (s: any) => s && s.videoOnly === false && /^video\//.test(s.mimeType ?? "")
              )
            : null;
          src =
            data?.hls ||
            muxed?.url ||
            data?.videoStreams?.find((s: any) => s && s.videoOnly === false)?.url ||
            data?.formatStreams?.[0]?.url ||
            data?.audioStreams?.[0]?.url ||
            null;
        } else {
          src =
            data?.hlsUrl ||
            data?.formatStreams?.find((f: any) => /^video\//.test(f?.type ?? ""))?.url ||
            data?.formatStreams?.[0]?.url ||
            data?.adaptiveFormats?.find((f: any) => /^video\//.test(f?.type ?? ""))?.url ||
            data?.adaptiveFormats?.[0]?.url ||
            null;
        }

        if (!cancelled) {
          if (src) {
            setNativeSrc(src);
            setMode("native");
          } else {
            // nothing playable natively → use iframe right away
            setMode("iframe");
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(String(e?.message || e));
          setMode("iframe"); // fetch failed → just use iframe
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [backend, apiBase, videoId]);

  const iframeSrc = BACKENDS[backend].embed(embedBase, videoId ?? "");

  function handleVideoError() {
    if (!demotedToIframe.current) {
      demotedToIframe.current = true;
      setMode("iframe");           // switch UI to iframe
      // keep a small warning, but NOT as an overlay
      setError("Native playback failed; using embed instead.");
    }
  }

  if (!videoId) return null;

  return (
    <div className="mt-6">
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black">
        {mode === "native" && nativeSrc ? (
          <video
            src={nativeSrc}
            className="w-full aspect-video bg-black"
            controls
            playsInline
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

        {/* IMPORTANT: show overlay ONLY in native mode, so it never covers the iframe */}
        {mode === "native" && error ? (
          <div className="absolute inset-0 grid place-items-center text-sm text-red-500 bg-black/30">
            {error}
          </div>
        ) : null}
      </div>

      {/* If we're in iframe mode and have an error message, show it BELOW the player, not over it */}
      {mode === "iframe" && error ? (
        <div className="mt-2 rounded-xl p-2 text-xs bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-400/20 text-amber-900 dark:text-amber-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}
