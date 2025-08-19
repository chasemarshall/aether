// components/Diagnostics.tsx
"use client";
import { useEffect, useState } from "react";

export function Diagnostics({ open, onClose, url }: { open: boolean; onClose: () => void; url: string; }) {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setMsg("Testing…");
        const r = await fetch(url, { mode: "cors", credentials: "omit" });
        const text = await r.text();
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}: ${text.slice(0, 120)}…`);
        try { JSON.parse(text); } catch { throw new Error("Response is not JSON."); }
        setMsg("Success ✓");
      } catch (e: any) {
        setMsg(`Failed: ${e?.message || e}`);
      }
    })();
  }, [open, url]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-4 top-24 w-[520px] max-w-[calc(100vw-2rem)] rounded-3xl border border-white/10 bg-white/75 dark:bg-white/10 text-slate-900 dark:text-slate-100 shadow-2xl p-4">
        <div className="font-semibold mb-2">Diagnostics</div>
        <div className="text-sm whitespace-pre-wrap">{msg}</div>
      </div>
    </div>
  );
}
