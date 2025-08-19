export type BackendKey = "invidious" | "piped";

export const BACKENDS: Record<BackendKey, {
  label: string;
  defaults: { instance: string };
  embed: (base: string, id: string) => string;
}> = {
  invidious: {
    label: "Invidious",
    defaults: { instance: process.env.NEXT_PUBLIC_DEFAULT_INVIDIOUS ?? "https://yewtu.be" },
    embed: (base, id) => `${base.replace(/\/$/, "")}/watch?v=${id}`,
  },
  piped: {
    label: "Piped",
    defaults: { instance: process.env.NEXT_PUBLIC_DEFAULT_PIPED ?? "https://piped.video" },
    embed: (base, id) => `${base.replace(/\/$/, "")}/watch?v=${id}`,
  },
};
