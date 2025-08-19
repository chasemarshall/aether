// components/Header.tsx
"use client";
import { Search, Settings as SettingsIcon, Sun, Moon, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { parseVideoId } from "@lib/parseVideoId";

export function Header({
  q, setQ, onSubmit, openSettings, theme, setTheme,
}: {
  q: string; setQ: (s: string) => void; onSubmit: (q: string) => void;
  openSettings: () => void; theme: "light" | "dark" | "system"; setTheme: (t: "light" | "dark" | "system") => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [canDirect, setCanDirect] = useState(false);
  const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
  const Icon = theme === "dark" ? Moon : Sun;

  useEffect(() => { setCanDirect(Boolean(parseVideoId(q))); }, [q]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "/") { e.preventDefault(); inputRef.current?.focus(); } };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <button className="group inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/15 backdrop-blur shadow-sm border border-black/5 dark:border-white/5 transition">
        <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-inner" />
        <span className="font-semibold tracking-tight">Aethers</span>
        <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:opacity-100 opacity-80">v3</span>
      </button>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(q); }} className="flex-1 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white/70 dark:bg-white/10 border border-black/5 dark:border-white/10 rounded-2xl px-3 py-2 shadow-sm backdrop-blur">
          <Search className="h-5 w-5 opacity-70" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search or paste a YouTube link or ID"
            className="w-full bg-transparent outline-none placeholder:text-slate-400 text-[15px]"
          />
          <kbd className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded border border-slate-300/50 dark:border-white/10 text-slate-500">/</kbd>
        </div>
        <button type="submit" className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition shadow">
          <Play className="h-4 w-4" />
          {canDirect ? "Open" : "Search"}
        </button>
      </form>

      <button onClick={openSettings} className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/15 backdrop-blur shadow-sm border border-black/5 dark:border-white/5 transition">
        <SettingsIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Settings</span>
      </button>

      <button onClick={() => setTheme(next)} title={`Theme: ${theme} (click to ${next})`} className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/15 backdrop-blur shadow-sm border border-black/5 dark:border-white/5 transition">
        <Icon className="h-5 w-5" />
        <span className="hidden sm:inline capitalize">{theme}</span>
      </button>
    </div>
  );
}
