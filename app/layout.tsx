import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Aethers: YouTube Frontend",
  description: "Apple x OpenAI styled Invidious/Piped player",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
