"use client";

import { X } from "lucide-react";
import { BACKENDS } from "@lib/backends";
import { cls } from "@lib/utils";
import type { BackendKey } from "@lib/backends";

export function SettingsPanel({
  open, onClose, backend, setBackend, instance, setInstance
}: {
  open: boolean;
  onClose: () => void;
  backend: BackendKey;
  setBackend: (b: BackendKey) => void;
  instance: string;
  setInstance: (s: string) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-4 top-4 w-[420px] max-w-[calc(100vw-2rem)] rounded-3xl border border-white/10 bg-white/75 dark:bg-white/10 text-slate-900 dark:text-slate-100 shadow-2xl">
        <div className="p-4 flex items-center justify-between">
          <div className="font-semibold">Settings</div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/40 dark:hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 pt-0 space-y-4">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">Backend</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {Object.entries(BACKENDS).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => {
                    setBackend(k as BackendKey);
                    setInstance(BACKENDS[k as BackendKey].defaults.instance);
                  }}
                  className={cls(
                    "px-3 py-2 rounded-xl border",
                    backend === (k as BackendKey)
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent"
                      : "bg-white/60 dark:bg-white/10 border-white/10 hover:bg-white/70 dark:hover:bg-white/15"
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">Instance URL</label>
            <input
              value={instance}
              onChange={(e) => setInstance(e.target.value)}
              placeholder="https://yewtu.be"
              className="mt-1 w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-white/10 border border-white/10 outline-none"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Example: <code>https://yewtu.be</code> (Invidious) or <code>https://piped.video</code> (Piped)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
