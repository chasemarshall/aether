"use client";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}
function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
}

export function CookieConsent({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const v = getCookie("aethers_consent");
    setVisible(!v); // show only if no prior choice
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="max-w-3xl w-full rounded-3xl border border-white/10 bg-white/80 dark:bg-white/10 backdrop-blur shadow-2xl">
        <div className="p-4 sm:p-5">
          <div className="text-sm sm:text-[15px] leading-relaxed text-slate-800 dark:text-slate-100">
            <div className="font-semibold mb-1">Can we save your preferences?</div>
            We use a tiny, first-party cookie to remember which backend you picked
            (Piped or Invidious) and its instance URLs. No tracking, no ads, no selling data — just a gentle memory so things work the way you like next time. 💜
          </div>
          <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
            <button
              onClick={() => {
                setCookie("aethers_consent", "granted");
                setVisible(false);
                onAccept();
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition shadow"
            >
              <Check className="h-4 w-4" /> Yes, save my prefs
            </button>
            <button
              onClick={() => {
                setCookie("aethers_consent", "denied");
                setVisible(false);
                onDecline();
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-white/15 bg-white/60 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/15"
            >
              <X className="h-4 w-4" /> No, thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
