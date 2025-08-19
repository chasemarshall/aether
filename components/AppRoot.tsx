// components/AppRoot.tsx
"use client";

import { useEffect, useState } from "react";
import { NativeVideo, type NativeSourcePlan } from "@/components/NativeVideo";

export default function AppRoot() {
  const [error, setError] = useState("");
  const [videoKey, setVideoKey] = useState("boot");
  const [plan, setPlan] = useState<NativeSourcePlan>({
    progressive: [],
    hls: null,
    dash: null,
  });

  // Demo: start empty; your search/trending should call setPlan(...)
  useEffect(() => {
    // setPlan({ progressive: [mp4Url], hls: data.hls, dash: data.dash })
  }, []);

  return (
    <section className="mt-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-3">
        <NativeVideo plan={plan} videoKey={videoKey} onError={setError} />
      </div>
      {error && <p className="mt-3 text-sm text-rose-300/90">{error}</p>}
      {/* Put your search & results UI here; when user picks a video:
          setPlan(...); setVideoKey(videoId);
      */}
    </section>
  );
}
