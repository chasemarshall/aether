"use client";

import { useEffect, useMemo, useRef } from "react";
import Hls from "hls.js";
import dashjs from "dashjs";

export type NativeSourcePlan = {
  progressive?: string[];
  hls?: string | null;
  dash?: string | null;
};

/** Safari UA helper */
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

    const tryProgressive = () => {
      if (progressive.length === 0) return false;
      video.src = progressive[0]!;
      return true;
    };

    const tryHls = () => {
      if (!plan.hls) return false;

      if (isSafari()) {
        video.src = plan.hls!;
        return true;
      }

      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hlsRef.current = hls;
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(plan.hls!);
        });
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data?.fatal) onError(`HLS fatal: ${data?.type ?? "unknown"}`);
        });
        return true;
      }

      try {
        video.src = plan.hls!;
        return true;
      } catch {
        return false;
      }
    };

    const tryDash = () => {
      if (!plan.dash) return false;
      const player = dashjs.MediaPlayer().create();
      dashRef.current = player;
      // no lowLatencyEnabled here to satisfy types across versions
      player.initialize(video, plan.dash!, false);
      return true;
    };

    (async () => {
      let ok = tryProgressive();
      if (!ok) ok = tryHls();
      if (!ok) ok = tryDash();
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
      onError={() => onError("Native element failed")}
    />
  );
}
