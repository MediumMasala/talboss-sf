import { Geist, Geist_Mono, Newsreader } from "next/font/google";

/** Newsreader for the voice (headlines, the pitch), Geist for the interface, Geist Mono for data and the field's labels. */
export const serif = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", style: ["normal", "italic"], axes: ["opsz"], display: "swap" });
export const sans = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
export const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const fontVars = `${serif.variable} ${sans.variable} ${mono.variable}`;
