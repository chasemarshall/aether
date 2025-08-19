"use client";
import { useEffect, ReactNode } from "react";

export function AethersShell({
  children,
  theme,
}: {
  children: ReactNode;
  theme: "light" | "dark" | "system";
}) {
  useEffect(() => {
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      document.documentElement.classList.toggle("dark", mq.matches);
      const on = (e: MediaQueryListEvent) =>
        document.documentElement.classList.toggle("dark", e.matches);
      mq.addEventListener("change", on);
      return () => mq.removeEventListener("change", on);
    }
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div
      className={[
        "min-h-dvh text-slate-900 dark:text-slate-100",
        "bg-[radial-gradient(1200px_800px_at_80%_-10%,rgba(139,92,246,0.18),transparent),radial-gradient(1000px_600px_at_-20%_10%,rgba(59,130,246,0.16),transparent)]",
        "dark:bg-[radial-gradient(1200px_800px_at_80%_-10%,rgba(139,92,246,0.25),transparent),radial-gradient(1000px_600px_at_-20%_10%,rgba(59,130,246,0.22),transparent),linear-gradient(180deg,#0a0a0b,70%,#0f1115)]",
      ].join(" ")}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {children}
      </div>
    </div>
  );
}
