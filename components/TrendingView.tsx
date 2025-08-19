"use client";

import { useEffect, useState } from "react";
import { BACKENDS, type BackendKey } from "@lib/backends";
import { fetchFirstJSON } from "@lib/fetcher";
import { asArray, pickVideoIdFromUrl } from "@lib/normalize";

type TrendCard = {
  videoId: string;
  title: string;
  thumbnail: string;
  author: string;
  uploadedDate?: string;
  views?: number;
};

export function TrendingView({
  backend,
  apiBase,
  region = "US",
  onSelect
}: {
  backend: BackendKey; // "piped"
  apiBase: string;
  region?: string;
  onSelect: (videoId: string) => void;
}) {
  const [cards, setCards] = useState<TrendCard[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError("");
        setCards([]);

        const urls = BACKENDS[backend].trending(apiBase, { region });
        const raw = await fetchFirstJSON<any>(urls);

        const items = asArray(raw);
        const mapped: TrendCard[] = items
          .filter((it: any) => it?.url)
          .map((it: any) => {
            const videoId = pickVideoIdFromUrl(String(it.url));
            return {
              videoId: videoId || "",
              title: String(it.title || ""),
              thumbnail: String(it.thumbnail || ""),
              author: String(it.uploaderName || ""),
              uploadedDate: String(it.uploadedDate || ""),
              views: typeof it.views === "number" ? it.views : undefined
            };
          })
          .filter((c) => !!c.videoId);

        if (!cancelled) setCards(mapped);
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message || e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [backend, apiBase, region]);

  if (error) {
    return (
      <div className="mt-4 text-sm rounded-xl border border-rose-300/30 bg-rose-50/70 dark:bg-rose-400/10 px-3 py-2 text-rose-700 dark:text-rose-200">
        {error}
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
        Nothing trending right now.
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <button
          key={c.videoId}
          onClick={() => onSelect(c.videoId)}
          className="group text-left rounded-2xl overflow-hidden border border-white/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur hover:shadow-lg hover:-translate-y-0.5 transition"
        >
          <div className="aspect-video bg-black/70">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.thumbnail}
              alt={c.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-3">
            <div className="text-sm font-medium line-clamp-2">{c.title}</div>
            <div className="mt-1 text-xs text-zinc-500">
              {c.author}
              {c.uploadedDate ? ` • ${c.uploadedDate}` : ""}
              {typeof c.views === "number" ? ` • ${c.views.toLocaleString()} views` : ""}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
