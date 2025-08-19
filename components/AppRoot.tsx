"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { NativeVideo, type NativeSourcePlan } from "@/components/NativeVideo";

// If you have your api helpers (BACKENDS/api) already, import and use them here.
// import { api } from "@/lib/api"; // <- your existing helpers

export default function AppRoot() {
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<NativeSourcePlan>({
    progressive: [],
    hls: null,
    dash: null,
  });
  const [videoKey, setVideoKey] = useState<string>("boot");

  // --- DEMO: you should replace this with your real data wiring ---
  // For example, after fetching /streams/:id from Piped, map it into `plan`.
  // setPlan({ progressive: [bestMp4Url], hls: data.hls, dash: data.dash });

  useEffect(() => {
    // no-op boot; remove or wire to your router/search selection
  }, []);

  return (
    <main className="min-h-dvh bg-[radial-gradient(1200px_800px_at_70%_-10%,rgba(99,102,241,.25),transparent),radial-gradient(1000px_700px_at_-10%_20%,rgba(236,72,153,.22),transparent),#0b0b0f] text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Aether</h1>
        </header>

        <section className="mt-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-3">
            <NativeVideo
              plan={plan}
              videoKey={videoKey}
              onError={(msg) => setError(msg)}
            />
          </div>
          {error && (
            <p className="mt-3 text-sm text-rose-300/90">
              {error}
            </p>
          )}
        </section>

        {/* Your search/trending UI goes here, calling setPlan(...) and setVideoKey(...) */}
      </div>
    </main>
  );
}
