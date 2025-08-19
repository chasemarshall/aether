"use client";

import { useEffect, useMemo, useState } from "react";
import { AethersShell } from "@components/AethersShell";
import { Header } from "@components/Header";
import { SettingsPanel } from "@components/SettingsPanel";
import { VideoGrid, type VideoItem } from "@components/VideoGrid";
import { WatchView } from "@components/WatchView";
import { Diagnostics } from "@components/Diagnostics";
import { CookieConsent } from "@components/CookieConsent";
import { BACKENDS, type BackendKey } from "@lib/backends";
import { fetchFirstJSON } from "@lib/fetcher";
import { parseVideoId } from "@lib/parseVideoId";
import { useLocalStorage } from "@hooks/useLocalStorage";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

// Persist only if consented; otherwise keep in-memory
function useConsentedLS<T>(key: string, initial: T, consent: boolean) {
  const [v, setV] = useState<T>(initial);
  useEffect(() => {
    if (!consent) return;
    try {
      const s = localStorage.getItem(key);
      setV(s ? (JSON.parse(s) as T) : initial);
    } catch {}
  }, [consent, initial, key]);
  useEffect(() => {
    if (!consent) return;
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  }, [key, v, consent]);
  return [v, setV] as const;
}

export default function Page() {
  const [theme, setTheme] = useLocalStorage<"light" | "dark" | "system">(
    "aethers_theme",
    "system"
  );

  const [consent, setConsent] = useState<boolean>(
    () => getCookie("aethers_consent") === "granted"
  );

  // Backend prefs respect cookie consent:
  const [backend, setBackend] = useConsentedLS<BackendKey>(
    "yt_backend",
    "piped",
    consent
  );
  const [embedBase, setEmbedBase] = useConsentedLS(
    "yt_embed",
    BACKENDS.piped.defaults.embedBase,
    consent
  );
  const [apiBase, setApiBase] = useConsentedLS(
    "yt_api",
    BACKENDS.piped.defaults.apiBase,
    consent
  );

  const [q, setQ] = useLocalStorage("yt_query", "");
  const [videoId, setVideoId] = useLocalStorage<string | null>(
    "yt_last_video",
    null
  );
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [trending, setTrending] = useState<VideoItem[]>([]);
  const [results, setResults] = useState<VideoItem[]>([]);
  const [diagOpen, setDiagOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const api = useMemo(() => BACKENDS[backend], [backend]);

  async function loadTrending() {
    setLoading(true);
    setErr("");
    try {
      const urls = api.trending(apiBase, { region: "US" });
      const data = await fetchFirstJSON<any[]>(urls);
      const list = (Array.isArray(data) ? data : [])
        .map(api.mapSearchItem)
        .filter(Boolean) as VideoItem[];
      setTrending(list);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function doSearch(query: string) {
    const id = parseVideoId(query);
    if (id) {
      setVideoId(id);
      setResults([]);
      return;
    }
    if (!query?.trim()) return;
    setLoading(true);
    setErr("");
    setVideoId(null);
    try {
      const urls = api.search(apiBase, query.trim());
      const data = await fetchFirstJSON<any[]>(urls);
      const list = (Array.isArray(data) ? data : [])
        .map(api.mapSearchItem)
        .filter(Boolean) as VideoItem[];
      setResults(list);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrending();
  }, [backend, apiBase]);

  return (
    <AethersShell theme={theme}>
      <Header
        q={q}
        setQ={setQ}
        onSubmit={doSearch}
        openSettings={() => setSettingsOpen(true)}
        theme={theme}
        setTheme={setTheme}
      />

      {err ? (
        <div className="mt-4 rounded-2xl p-3 bg-red-50/70 dark:bg-red-500/10 border border-red-200/60 dark:border-red-400/20 text-red-900 dark:text-red-200 text-sm">
          {err}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 grid place-items-center text-slate-500 animate-pulse">
          Loading…
        </div>
      ) : null}

      {!videoId && results.length === 0 ? (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Trending</h2>
            <button
              onClick={() => setDiagOpen(true)}
              className="text-xs px-2 py-1 rounded-lg border border-white/10 bg-white/60 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/15"
            >
              Diagnostics
            </button>
          </div>
          <VideoGrid items={trending} onOpen={(v) => setVideoId(v.id)} />
        </section>
      ) : null}

      {!videoId && results.length > 0 ? (
        <section className="mt-6">
          <h2 className="text-lg font-semibold tracking-tight">
            Results for “{q}”
          </h2>
          <VideoGrid items={results} onOpen={(v) => setVideoId(v.id)} />
        </section>
      ) : null}

      {videoId ? (
        <WatchView
          videoId={videoId}
          backend={backend}
          embedBase={embedBase}
          apiBase={apiBase}
        />
      ) : null}

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        backend={backend}
        setBackend={setBackend}
        embedBase={embedBase}
        setEmbedBase={setEmbedBase}
        apiBase={apiBase}
        setApiBase={setApiBase}
        onSaved={() => {}}
      />

      <Diagnostics
        open={diagOpen}
        onClose={() => setDiagOpen(false)}
        url={BACKENDS[backend].trending(apiBase, { region: "US" })[0]}
      />

      {/* Cookie consent bar for backend prefs */}
      <CookieConsent
        onAccept={() => setConsent(true)}
        onDecline={() => setConsent(false)}
      />

      <footer className="mt-12 mb-4 text-center text-xs text-slate-500 dark:text-slate-400">
        Built for privacy-friendly YouTube via {api.label}. Paste any watch link
        or 11-char ID.
      </footer>
    </AethersShell>
  );
}
