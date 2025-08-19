"use client";

import { useEffect, useMemo, useRef } from "react";
import Hls from "hls.js";
import dashjs from "dashjs";

export type NativeSourcePlan = {
  /** direct MP4s (from Piped videoStreams where videoOnly=false) */
  progressive?: string[];
  /** HLS manifest URL (Invidious hlsUrl or Piped livestreams) */
  hls?: string | null;
  /** DASH manifest URL (Invidious dashUrl) */
  dash?: string | null;
};

/** Safari-ish check (Chrome on iOS also reports Safari; this is “good enough” for MSE-less HLS fallback) */
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
  const hlsRef = useRef<Hls | null>(null);
  const dashRef = useRef<dashjs.MediaPlayerClass | null>(null);
  const errorFiredRef = useRef(false);

  /** stable progressive list */
  const progressive = useMemo(
    () => (plan.progressive || []).filter(Boolean),
    [plan.progressive?.join("|")]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset one-shot error flag for this mount
    errorFiredRef.current = false;

    // Clean any existing engines
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (dashRef.current) {
      dashRef.current.reset();
      dashRef.current = null;
    }

    // Helpful console breadcrumbs
    const log = (...args: any[]) => console.debug("[NativeVideo]", ...args);

    const attachVideoSrc = (src: string) => {
      try {
        video.src = src;
        video.load(); // important for Safari/WebKit
        return true;
      } catch (e) {
        return false;
      }
    };

    const tryProgressive = () => {
      if (progressive.length === 0) return false;
      log("trying progressive", progressive[0]);
      return attachVideoSrc(progressive[0]!);
    };

    const tryHls = () => {
      if (!plan.hls) return false;

      // Native HLS on Safari
      if (isSafari()) {
        log("trying native HLS (Safari)", plan.hls);
        return attachVideoSrc(plan.hls);
      }

      // MSE HLS
      if (Hls.isSupported()) {
        log("trying hls.js", plan.hls);
        const hls = new Hls({ enableWorker: true });
        hlsRef.current = hls;
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(plan.hls!);
        });
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data?.fatal && !errorFiredRef.current) {
            errorFiredRef.current = true;
            onError(`HLS fatal: ${data?.type ?? "unknown"}`);
          }
        });
        return true;
      }

      // Last-ditch: some browsers support HLS natively without our UA check
      return attachVideoSrc(plan.hls);
    };

    const tryDash = () => {
      if (!plan.dash) return false;
      log("trying dash.js", plan.dash);
      const player = dashjs.MediaPlayer().create();
      dashRef.current = player;

      // Keep settings minimal & compatible across dash.js versions.
      player.updateSettings({
        streaming: {
          // correct key is lowLatencyMode (not lowLatencyEnabled)
          // use it only if your streams are LL-DASH; otherwise it's harmless.
          lowLatencyMode: true
        }
      } as any);

      player.initialize(video, plan.dash!, false);
      return true;
    };

    // Attach transient listeners to avoid premature “failed” overlays.
    const onLoaded = () => log("loadedmetadata");
    const onCanPlay = async () => {
      log("canplay");
      // optional auto-play attempt (muted allows autoplay policies)
      try {
        video.muted = true;
        await video.play().catch(() => void 0);
      } catch {
        /* ignore */
      }
    };
    const onElError = () => {
      // Some browsers emit non-fatal MediaError events during switching;
      // only surface once per mount to avoid spamming.
      if (!errorFiredRef.current) {
        errorFiredRef.current = true;
        onError("Native element failed");
      }
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onElError);

    // Try sources in order: progressive → HLS → DASH
    let ok = tryProgressive();
    if (!ok) ok = tryHls();
    if (!ok) ok = tryDash();
    if (!ok && !errorFiredRef.current) {
      errorFiredRef.current = true;
      onError("No playable native format found");
    }

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onElError);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (dashRef.current) {
        dashRef.current.reset();
        dashRef.current = null;
      }
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch {
        /* noop */
      }
    };
    // Re-init when key changes or plan URLs change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoKey, progressive.join("|"), plan.hls ?? "", plan.dash ?? ""]);

  return (
    <video
      key={videoKey}
      ref={videoRef}
      className="w-full aspect-video rounded-2xl bg-black shadow-[0_0_40px_rgba(0,0,0,0.35)]"
      controls
      playsInline
      preload="metadata"
      crossOrigin="anonymous"
      // don’t surface generic error here; we handle via listener to avoid duplicate overlays
    />
  );
}
