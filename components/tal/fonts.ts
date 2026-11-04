import { IBM_Plex_Mono, Inter, Libre_Caslon_Display, Libre_Caslon_Text } from "next/font/google";

/** Display: Libre Caslon Display, set like a title card. Names: Libre Caslon Text italic (Display has no italic). */
export const caslon = Libre_Caslon_Display({ subsets: ["latin"], weight: "400", variable: "--font-caslon", display: "swap" });
export const caslonItalic = Libre_Caslon_Text({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-caslon-italic", display: "swap", preload: false });
/** Credits and labels. */
export const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });
/** Text fallback after the system UI stack (SF Pro on Apple devices). */
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", preload: false });

export const fontVars = `${caslon.variable} ${caslonItalic.variable} ${plexMono.variable} ${inter.variable}`;
