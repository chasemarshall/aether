// app/page.tsx
"use client";

import AppRoot from "./components/AppRoot.tsx";
import Settings from "./components/Settings.tsx";
import CookieConsent from "./components/CookieConsent.tsx";

export default function Page() {
  return (
    <>
      <CookieConsent />
      <header className="max-w-6xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Aether</h1>
        <div className="opacity-80 text-sm">beta</div>
      </header>
      <main className="max-w-6xl mx-auto px-4 pb-16">
        <AppRoot />
      </main>
      <Settings />
    </>
  );
}
