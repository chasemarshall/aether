"use client";

import { useEffect, useMemo, useRef } from "react";

export type NativeSourcePlan = {
  progressive?: string[]; // direct MP4s
  hls?: string | null;    // HLS manifest URL
  dash?: string | null;   // DASH manifest URL
};

/** Loose Safari check for native HLS */
const isSafari = () =>
  typeof navigator !== "undefined" &&
  /safari/i.test(navigator.userAgent) &&
  !/chrome|crios|fxios|edgios/i.test(navigator.userAgent);

export function NativeVideo({
  plan,
  onError,
  videoKey
}: {
  plan: NativeSourcePlan;
  onError: (msg: string) => void;
  videoKey: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // hold dynamic libs + instances in refs so we can clean them
  const hlsLibRef = useRef<any>(null);
  const hlsInstanceRef = useRef<any>(null);
  const dashLibRef = useRef<any>(null);
  const dashInstanceRef = useRef<any>(null);

  const errorFiredRef = useRef(false);
  const progressiveIndexRef = useRef(0);
  const hlsTriedRef = useRef(false);
  const dashTriedRef = useRef(false);

  const progressive = useMemo(
    () => (plan.progressive || []).filter(Boolean),
    // join makes the dep stable without re-running for same list
    [plan.progressive?.join("|")]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    errorFiredRef.current = false;
    progressiveIndexRef.current = 0;
    hlsTriedRef.current = false;
    dashTriedRef.current = false;

    // cleanup helpers
    const cleanup = () => {
      try {
        if (hlsInstanceRef.current) {
          hlsInstanceRef.current.destroy();
          hlsInstanceRef.current = null;
        }
        if (dashInstanceRef.current) {
          dashInstanceRef.current.reset?.();
          dashInstanceRef.current = null;
        }
        video.pause?.();
        video.removeAttribute("src");
        video.load?.();
      } catch {
        /* noop */
      }
    };

    const attachSrc = (src: string) => {
      try {
        video.src = src;
        video.load(); // important for WebKit
        return true;
      } catch {
        return false;
      }
    };

    const tryProgressive = () => {
      while (progressiveIndexRef.current < progressive.length) {
        const src = progressive[progressiveIndexRef.current++]!;
        if (attachSrc(src)) return true;
      }
      return false;
    };

    const tryHls = async () => {
      if (!plan.hls || hlsTriedRef.current) return false;
      hlsTriedRef.current = true;

      // Native HLS on Safari
      if (isSafari()) return attachSrc(plan.hls);

      // MSE HLS via hls.js (dynamic import to avoid SSR “self”)
      try {
        if (!hlsLibRef.current) {
          const mod = await import("hls.js");
          hlsLibRef.current = mod.default || mod;
        }
        const Hls = hlsLibRef.current;
        if (Hls?.isSupported?.()) {
          const hls = new Hls({ enableWorker: true });
          hlsInstanceRef.current = hls;
          hls.attachMedia(video);
          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            hls.loadSource(plan.hls!);
          });
          hls.on(Hls.Events.ERROR, (_e: any, data: any) => {
            if (data?.fatal && !errorFiredRef.current) {
              errorFiredRef.current = true;
              onError(`HLS fatal: ${data?.type ?? "unknown"}`);
            }
          });
          return true;
        }
      } catch {
        // fall through to “last ditch” attach
      }

      // Some browsers support HLS natively
      return attachSrc(plan.hls);
    };

    const tryDash = async () => {
      if (!plan.dash || dashTriedRef.current) return false;
      dashTriedRef.current = true;
      try {
        if (!dashLibRef.current) {
          const mod = await import("dashjs");
          dashLibRef.current = mod.default || mod;
        }
        const dashjs = dashLibRef.current;
        const player = dashjs.MediaPlayer().create();
        dashInstanceRef.current = player;

        // minimal, cross-version-safe settings
        player.updateSettings?.({ streaming: { lowLatencyMode: true } } as any);
        player.initialize(video, plan.dash!, false);
        return true;
      } catch {
        return false;
      }
    };

    const load = async () => {
      cleanup();
      let ok = tryProgressive();
      if (!ok) ok = await tryHls();
      if (!ok) ok = await tryDash();
      if (!ok && !errorFiredRef.current) {
        errorFiredRef.current = true;
        onError("No playable native format found");
        return;
      }

      // polite autoplay (muted) if allowed
      try {
        video.muted = true;
        await video.play().catch(() => void 0);
      } catch {
        /* ignore */
      }
    };

    const onElError = async () => {
      if (errorFiredRef.current) return;
      await load();
    };

    video.addEventListener("error", onElError);

    load();

    return () => {
      video.removeEventListener("error", onElError);
      cleanup();
    };
    // re-run when sources or key change
  }, [videoKey, progressive.join("|"), plan.hls ?? "", plan.dash ?? ""]);

  return (
    <video
      key={videoKey}
      ref={videoRef}
      className="w-full aspect-video rounded-2xl bg-black"
      controls
      playsInline
      preload="metadata"
      crossOrigin="anonymous"
    />
  );
}
