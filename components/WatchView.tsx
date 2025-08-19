"use client";

import { BACKENDS, type BackendKey } from "@lib/backends";

export function WatchView({ videoId, backend, instance }: {
  videoId: string | null;
  backend: BackendKey;
  instance: string;
}) {
  if (!videoId) return null;
  const url = BACKENDS[backend].embed(instance, videoId);
  return (
    <div className="mt-6">
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black">
        <iframe
          src={url}
          className="w-full aspect-video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={videoId}
        />
      </div>
    </div>
  );
}
