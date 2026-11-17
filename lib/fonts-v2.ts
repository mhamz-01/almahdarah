import { Geist, Geist_Mono, Newsreader, Reem_Kufi } from "next/font/google";

// Fonts for the v2 design system (public home page). Loaded here, not in the root layout,
// so the admin and student portals don't pay for them.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
  display: "swap",
});

const reemKufi = Reem_Kufi({
  variable: "--font-reem-kufi",
  subsets: ["arabic", "latin"],
  weight: ["500", "700"],
  display: "swap",
});

export const dsFontVariables = [
  geist.variable,
  geistMono.variable,
  newsreader.variable,
  reemKufi.variable,
].join(" ");
