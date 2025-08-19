"use client";

import { Search, Settings as SettingsIcon, Play } from "lucide-react";
import { cls } from "@lib/utils";
import { parseVideoId } from "@lib/parseVideoId";
import { useEffect, useRef, useState } from "react";

export function Header({
  q, setQ, onSubmit, openSettings
}: {
  q: string;
  setQ: (s: string) => void;
  onSubmit: (query: string) => void;
  openSettings: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [canDirect, setCanDirect] = useState(false);

  useEffect(() => {
    setCanDirect(Boolean(parseVideoId(q)));
  }, [q]);

  return (
    <div className="flex items-center gap-3">
      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(q); }}
        className="flex-1 flex items-center gap-2"
      >
        <div className="flex-1 flex items-center gap-2 bg-white/70 dark:bg-white/10 border border-black/5 dark:border-white/10 rounded-2xl px-3 py-2 shadow-sm backdrop-blur">
          <Search className="h-5 w-5 opacity-70" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search or paste a YouTube link (watch?v=…) or ID"
            className="w-full bg-transparent outline-none placeholder:text-slate-400 text-[15px]"
          />
          <span className="hidden sm:inline kbd">/</span>
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition shadow"
        >
          <Play className="h-4 w-4" />
          {canDirect ? "Open" : "Search"}
        </button>
      </form>

      <button
        onClick={openSettings}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/15 backdrop-blur shadow-sm border border-black/5 dark:border-white/5 transition"
      >
        <SettingsIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Settings</span>
      </button>
    </div>
  );
}
