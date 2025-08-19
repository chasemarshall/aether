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

// Trending loader
const loadTrending = async () => {
  setErr("");
  try {
    // ✅ pass opts object (was "US")
    const urls = api.trending(apiBase, { region: "US" });
    const data = await fetchFirstJSON<any>(urls);

    // Piped returns an array; some instances may wrap as {items: []}
    const list = (Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [])
      .map(api.mapSearchItem)
      .filter(Boolean);

    setResults(list);
  } catch (e: any) {
    setErr(e?.message || "Failed to load trending");
  }
};

// Search
const runSearch = async (q: string) => {
  setErr("");
  try {
    const urls = api.search(apiBase, q, { region: "US", hl: "en" });
    const data = await fetchFirstJSON<any>(urls);

    // Piped: { items: [...] }, Invidious: [...]
    const arr = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
    const list = arr.map(api.mapSearchItem).filter(Boolean);

    setResults(list);
  } catch (e: any) {
    setErr(e?.message || "Search failed");
  }
};
