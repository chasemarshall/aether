"use client";

import { useEffect, useMemo, useState } from "react";
import { BACKENDS, type BackendKey } from "@lib/backends";
import { fetchFirstJSON } from "@lib/fetcher";
import { NativeVideo, type NativeSourcePlan } from "@components/NativeVideo";

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
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<NativeSourcePlan | null>(null);
  const iframeSrc = useMemo(
    () => (videoId ? BACKENDS[backend].embed(embedBase, videoId) : ""),
    [backend, embedBase, videoId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!videoId) return;
      setError("");
      setPlan(null);

      try {
        const url = BACKENDS[backend].streams(apiBase, videoId)[0]; // your instance '/streams/:id'
        const data = await fetchFirstJSON<any>([url]);

        // Helper to normalize URLs. Some instances may return relative paths
        // like "/watch?v=..." which break when assigned directly to the
        // video element and result in 404s on our own origin. When a proxyUrl
        // is provided we prefix relative paths with it.
        const makeAbsolute = (u: any) => {
          if (typeof u !== "string") return null;
          if (/^https?:\/\//i.test(u)) return u;
          if (data?.proxyUrl && u.startsWith("/")) {
            return `${data.proxyUrl.replace(/\/$/, "")}${u}`;
          }
          return null;
        };

        // Build a best-first list of progressive muxed MP4s (native-friendly)
        const progressive: string[] = [];

        const pickUrls = (list: any[]) =>
          list
            .map((s: any) => makeAbsolute(s?.url))
            .filter((u: any): u is string => typeof u === "string" && !!u);

        // Piped shape
        if (backend === "piped") {
          const v = Array.isArray(data?.videoStreams) ? data.videoStreams : [];
          // keep only muxed (videoOnly === false) and mp4
          const muxedMp4 = pickUrls(
            v
              .filter((s: any) => s && s.videoOnly === false)
              .filter((s: any) =>
                String(s?.mimeType || "").startsWith("video/")
              )
              // prefer higher height first, then bitrate if available
              .sort(
                (a: any, b: any) =>
                  (b?.height ?? 0) - (a?.height ?? 0) ||
                  (b?.bitrate ?? 0) - (a?.bitrate ?? 0)
              )
          );
          progressive.push(...muxedMp4);

          // Some instances expose formatStreams (similar to invidious)
          const fmt = Array.isArray(data?.formatStreams) ? data.formatStreams : [];
          const fmtMp4 = pickUrls(
            fmt.filter((f: any) =>
              String(f?.type || "").startsWith("video/") ||
              String(f?.mimeType || "").startsWith("video/")
            )
          );
          progressive.push(...fmtMp4);
        } else {
          // Invidious shape
          const fmt = Array.isArray(data?.formatStreams) ? data.formatStreams : [];
          const fmtMp4 = pickUrls(
            fmt.filter((f: any) => String(f?.type || "").startsWith("video/"))
          );
          progressive.push(...fmtMp4);
        }

        // NOTE: DO NOT ever push audio-only url; that causes the “pause with slash” behavior.

        const p: NativeSourcePlan = {
          progressive: progressive.length ? progressive : undefined,
          hls: makeAbsolute(
            backend === "piped" ? data?.hls ?? null : data?.hlsUrl ?? null
          ),
          dash: makeAbsolute(
            backend === "piped" ? data?.dash ?? null : data?.dashUrl ?? null
          ),
        };

        if (!cancelled) setPlan(p);
      } catch (e: any) {
        if (!cancelled) {
          setError(String(e?.message || e));
          setPlan(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase, backend, videoId]);

  if (!videoId) return null;

  const videoKey = `${backend}:${apiBase}:${videoId}`;

  return (
    <div className="mt-6">
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black">
        {plan ? (
          <NativeVideo
            videoKey={videoKey}
            plan={plan}
            onError={(msg) => setError(msg)}
          />
        ) : (
          // While planning/failed, still show something (embed) so it plays
          <iframe
            src={iframeSrc}
            className="w-full aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={videoId}
          />
        )}

        {/* Only show overlay if we are in native mode (i.e., plan exists) AND an error happened */}
        {plan && error ? (
          <div className="absolute inset-0 grid place-items-center text-sm text-red-500 bg-black/30">
            {error}
          </div>
        ) : null}
      </div>

      {!plan && error ? (
        <div className="mt-2 rounded-xl p-2 text-xs bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-400/20 text-amber-900 dark:text-amber-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}
