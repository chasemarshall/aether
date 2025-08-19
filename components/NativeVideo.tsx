"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import dashjs from "dashjs";

export type NativeSourcePlan = {
  // Progressive MP4 urls (muxed). First wins.
  progressive?: string[];
  // HLS manifest (m3u8)
  hls?: string | null;
  // DASH manifest (mpd)
  dash?: string | null;
};

/** tiny UA helpers */
const isSafari = () =>
  typeof navigator !== "undefined" &&
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export function NativeVideo({
  plan,
  onError,
  videoKey
}: {
  plan: NativeSourcePlan;
  onError: (msg: string) => void;
  /** force a full reset when video changes */
  videoKey: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const dashRef = useRef<dashjs.MediaPlayerClass | null>(null);

  const progressive = useMemo(
    () => (plan.progressive || []).filter(Boolean),
    [plan.progressive]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // cleanup any existing engines
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (dashRef.current) {
      dashRef.current.reset();
      dashRef.current = null;
    }

    const tryProgressive = async () => {
      if (progressive.length === 0) return false;
      // just take the first (we already sorted best-first)
      video.src = progressive[0]!;
      return true;
    };

    const tryHls = async () => {
      if (!plan.hls) return false;

      // Safari plays HLS natively
      if (isSafari()) {
        video.src = plan.hls!;
        return true;
      }

      // Other browsers: use hls.js when supported
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsRef.current = hls;
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(plan.hls!);
        });
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data?.fatal) {
            onError(`HLS fatal: ${data?.type ?? "unknown"}`);
          }
        });
        return true;
      }

      // Fallback try direct (some Chromium builds can do it)
      try {
        video.src = plan.hls!;
        return true;
      } catch {
        /* ignore */
      }
      return false;
    };

    const tryDash = async () => {
      if (!plan.dash) return false;
      const player = dashjs.MediaPlayer().create();
      dashRef.current = player;
      player.initialize(video, plan.dash!, false);
      player.updateSettings({
        streaming: { lowLatencyEnabled: true }
      });
      return true;
    };

    (async () => {
      // ORDER: Progressive MP4 > HLS > DASH
      let ok = await tryProgressive();
      if (!ok) ok = await tryHls();
      if (!ok) ok = await tryDash();
      if (!ok) onError("No playable native format found");
    })();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (dashRef.current) {
        dashRef.current.reset();
        dashRef.current = null;
      }
      if (video) video.removeAttribute("src");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoKey, plan.hls, plan.dash, progressive.join("|")]);

  return (
    <video
      key={videoKey}
      ref={videoRef}
      className="w-full aspect-video bg-black"
      controls
      playsInline
      preload="metadata"
      crossOrigin="anonymous"
      onError={() => onError("Native element failed")} // surface element-level failures
    />
  );
}
