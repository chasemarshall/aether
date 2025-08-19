// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Aether",
  description: "Lightweight YouTube front-end",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh text-zinc-100
        bg-[radial-gradient(1200px_800px_at_70%_-10%,rgba(99,102,241,.25),transparent),radial-gradient(1000px_700px_at_-10%_20%,rgba(236,72,153,.22),transparent),#0b0b0f]">
        {children}
      </body>
    </html>
  );
}
