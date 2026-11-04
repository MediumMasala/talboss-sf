/* eslint-disable @next/next/no-img-element -- LinkedIn CDN images, sized by CSS */
import type { Profile } from "@/lib/linkedin";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function Avatar({ src, name, size }: { src: string; name: string; size: "lg" | "sm" }) {
  const cls = size === "lg" ? "size-14 text-[17px]" : "size-9 text-[12px]";
  return src ? (
    <img src={src} alt="" referrerPolicy="no-referrer" className={`${cls} shrink-0 rounded-full object-cover ring-1 ring-line`} />
  ) : (
    <span className={`${cls} flex shrink-0 items-center justify-center rounded-full bg-ink font-mono font-medium tracking-[0.02em] text-paper`}>
      {initials(name)}
    </span>
  );
}

const LinkedInMark = () => (
  <svg viewBox="0 0 24 24" className="size-3" aria-hidden="true">
    <path
      fill="currentColor"
      d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"
    />
  </svg>
);

/** The LinkedIn profile we found, shown back for a yes/no. */
export function ProfileCard({ profile }: { profile: Profile }) {
  const exp = profile.experience.slice(0, 3);
  return (
    <div className="rounded-[14px] border border-line bg-surface p-4 shadow-[0_1px_0_rgb(14_14_12/0.03),0_12px_30px_-18px_rgb(14_14_12/0.25)] sm:p-5">
      <div className="flex items-start gap-3.5">
        <Avatar src={profile.photo} name={profile.fullname} size="lg" />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-serif text-[22px] leading-tight tracking-[-0.01em] text-ink">{profile.fullname}</p>
          {profile.location && <p className="mt-0.5 font-mono text-[11.5px] text-muted">{profile.location}</p>}
        </div>
      </div>
      {profile.headline && <p className="mt-3 line-clamp-2 text-[14px] leading-snug text-body">{profile.headline}</p>}

      {exp.length > 0 && (
        <ul className="mt-4 border-t border-line">
          {exp.map((e, i) => (
            <li key={`${e.company}-${i}`} className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0 last:pb-0">
              {e.logo ? (
                <img src={e.logo} alt="" referrerPolicy="no-referrer" className="size-7 shrink-0 rounded-[6px] bg-white object-contain p-0.5 ring-1 ring-line" />
              ) : (
                <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-paper-2 font-mono text-[10.5px] text-muted ring-1 ring-line">
                  {initials(e.company)}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium text-ink">{e.title}</span>
                <span className="block truncate text-[12.5px] text-muted">{e.company}</span>
              </span>
              {e.duration && <span className="shrink-0 font-mono text-[11px] text-muted">{e.duration}</span>}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3.5 flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.06em] text-muted uppercase">
        <LinkedInMark />
        <span className="truncate normal-case tracking-normal">{profile.url.replace(/^https?:\/\/(www\.)?/, "")}</span>
      </p>
    </div>
  );
}

/** One-line reminder of the confirmed profile on later steps. */
export function MiniProfile({ profile }: { profile: Profile }) {
  return (
    <div className="flex items-center gap-3 rounded-[12px] border border-line bg-surface px-3 py-2.5">
      <Avatar src={profile.photo} name={profile.fullname} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-medium text-ink">{profile.fullname}</span>
        <span className="block truncate text-[12.5px] text-muted">{profile.headline}</span>
      </span>
      <span className="flex items-center gap-1 font-mono text-[10.5px] tracking-[0.06em] text-signal uppercase">
        <LinkedInMark />
        <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-label="Confirmed">
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      </span>
    </div>
  );
}
