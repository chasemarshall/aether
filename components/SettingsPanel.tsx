// components/SettingsPanel.tsx
"use client";
import { X } from "lucide-react";
import { BACKENDS, type BackendKey } from "@lib/backends";
import { useEffect, useState } from "react";

export function SettingsPanel({
  open, onClose,
  backend, setBackend,
  embedBase, setEmbedBase,
  apiBase, setApiBase,
  onSaved,
}: {
  open: boolean; onClose: () => void;
  backend: BackendKey; setBackend: (b: BackendKey) => void;
  embedBase: string; setEmbedBase: (s: string) => void;
  apiBase: string; setApiBase: (s: string) => void;
  onSaved?: () => void;
}) {
  const [b, setB] = useState<BackendKey>(backend);
  const [embed, setEmbed] = useState(embedBase);
  const [api, setApi] = useState(apiBase);

  useEffect(() => {
    if (open) { setB(backend); setEmbed(embedBase); setApi(apiBase); }
  }, [open, backend, embedBase, apiBase]);

  if (!open) return null;

  function save() {
    setBackend(b);
    setEmbedBase(embed);
    setApiBase(api);
    onClose();
    onSaved?.();
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-4 top-4 w-[520px] max-w-[calc(100vw-2rem)] rounded-3xl border border-white/10 bg-white/75 dark:bg-white/10 text-slate-900 dark:text-slate-100 shadow-2xl">
        <div className="p-4 flex items-center justify-between">
          <div className="font-semibold">Settings</div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/40 dark:hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 pt-0 space-y-4">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">Backend (pick one)</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {Object.entries(BACKENDS).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => {
                    const key = k as BackendKey;
                    setB(key);
                    setEmbed(BACKENDS[key].defaults.embedBase);
                    setApi(BACKENDS[key].defaults.apiBase);
                  }}
                  className={[
                    "px-3 py-2 rounded-xl border",
                    b === k
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent"
                      : "bg-white/60 dark:bg-white/10 border-white/10 hover:bg-white/70 dark:hover:bg-white/15",
                  ].join(" ")}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">Embed base (frontend)</label>
            <input value={embed} onChange={(e) => setEmbed(e.target.value)} placeholder="https://piped.video" className="mt-1 w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-white/10 border border-white/10 outline-none" />
          </div>

          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">API base (backend)</label>
            <input value={api} onChange={(e) => setApi(e.target.value)} placeholder="https://pipedapi.kavin.rocks" className="mt-1 w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-white/10 border border-white/10 outline-none" />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={save} className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition shadow">
              Save
            </button>
          </div>

          <div className="rounded-2xl p-3 bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-400/20 text-amber-900 dark:text-amber-200 text-sm">
            If CORS blocks streams, use the embed player (it always works). API base should be the <b>pipedapi.*</b> host.
          </div>
        </div>
      </div>
    </div>
  );
}
