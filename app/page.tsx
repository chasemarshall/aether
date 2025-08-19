"use client";

import { useState } from "react";
import { Header } from "@components/Header";
import { SettingsPanel } from "@components/SettingsPanel";
import { WatchView } from "@components/WatchView";
import { BACKENDS, type BackendKey } from "@lib/backends";
import { parseVideoId } from "@lib/parseVideoId";
import { useLocalStorage } from "@hooks/useLocalStorage";

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh text-slate-900 dark:text-slate-100 bg-gradient-to-b from-white to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}

export default function Page() {
  const [backend, setBackend] = useLocalStorage<BackendKey>("yt_backend", "invidious");
  const [instance, setInstance] = useLocalStorage<string>("yt_instance", BACKENDS[backend].defaults.instance);

  const [q, setQ] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  function handleSubmit(query: string) {
    const id = parseVideoId(query);
    if (id) {
      setVideoId(id);
    } else {
      // fallback: if user typed something else, try to use as-is (rare)
      setVideoId(query.trim() || null);
    }
  }

  return (
    <AppShell>
      <Header q={q} setQ={setQ} onSubmit={handleSubmit} openSettings={() => setSettingsOpen(true)} />
      <WatchView videoId={videoId} backend={backend} instance={instance} />
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        backend={backend}
        setBackend={setBackend}
        instance={instance}
        setInstance={setInstance}
      />
    </AppShell>
  );
}
