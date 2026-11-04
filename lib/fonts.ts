import { Inter } from "next/font/google";

/** Inter is the fallback after the system stack (SF Pro on Apple devices, never shipped). Variable, latin only. */
// Not preloaded: Apple devices never use it (the system stack resolves to SF Pro), and elsewhere a swap is fine.
export const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter", preload: false });
