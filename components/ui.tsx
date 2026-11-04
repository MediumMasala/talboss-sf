import { site } from "@/content/site";

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

/** The stacked white "tal / BOSS" wordmark from the live site. */
export function Wordmark({ className = "w-12" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/tal-boss-wordmark.svg" alt={site.name} width={407} height={371} className={`wordmark h-auto ${className}`} />;
}
