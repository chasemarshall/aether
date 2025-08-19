// components/VideoGrid.tsx
"use client";
import Image from "next/image";

export function timeFmt(s?: number | null) {
  if (s == null) return "";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return [h, m, sec]
    .map((n, i) => (i === 0 ? n : String(n).padStart(2, "0")))
    .filter((x, i) => (i === 0 ? (x as number) > 0 : true))
    .join(":");
}

export type VideoItem = {
  id: string;
  title: string;
  author?: string;
  views?: number;
  duration?: number;
  thumbnail?: string;
};

export function VideoGrid({ items, onOpen }: {
  items: VideoItem[];
  onOpen: (v: VideoItem) => void;
}) {
  if (!items?.length) return (
    <div className="text-slate-500 dark:text-slate-400 text-sm p-8">No videos found.</div>
  );
  return (
    <div className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((v) => {
        const thumb = v.thumbnail || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
        return (
          <div key={v.id} className="group rounded-3xl overflow-hidden border border-white/10 bg-white/70 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition shadow-sm">
            <div className="relative">
              {/* using next/image is optional — keeps layout stable */}
              <Image src={thumb} alt="thumbnail" width={640} height={360} className="w-full aspect-video object-cover" />
              {v.duration ? (
                <span className="absolute bottom-2 right-2 text-[11px] px-1.5 py-0.5 rounded bg-black/70 text-white">
                  {timeFmt(v.duration)}
                </span>
              ) : null}
            </div>
            <div className="p-3 space-y-2">
              <div className="font-medium leading-snug line-clamp-2">{v.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{v.author}</div>
              <div className="pt-1">
                <button onClick={() => onOpen(v)} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition">
                  Watch
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
