/* eslint-disable @next/next/no-img-element -- LinkedIn CDN images, sized by CSS */
import type { Profile } from "@/lib/linkedin";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

/** The LinkedIn profile we found, shown back for a yes/no. */
export function ProfileCard({ profile }: { profile: Profile }) {
  const exp = profile.experience.slice(0, 3);
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface-sunk">
      <div className="h-16 bg-[radial-gradient(120%_140%_at_20%_0%,#3a3a3c_0%,#1c1c1e_55%,#111113_100%)]" />
      <div className="-mt-9 px-5 pb-5">
        <div className="flex items-end justify-between gap-3">
          {profile.photo ? (
            <img src={profile.photo} alt="" referrerPolicy="no-referrer" className="size-[72px] rounded-full border-4 border-surface-sunk object-cover" />
          ) : (
            <span className="flex size-[72px] items-center justify-center rounded-full border-4 border-surface-sunk bg-line-strong text-xl font-semibold text-ink">
              {initials(profile.fullname)}
            </span>
          )}
          <span className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-line-strong px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-muted">
            <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
              <path fill="#0A66C2" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
            </svg>
            Found on LinkedIn
          </span>
        </div>
        <p className="mt-3 font-display text-[21px] leading-tight font-bold tracking-[-0.02em] text-ink">{profile.fullname}</p>
        {profile.headline && <p className="mt-1 line-clamp-2 text-[14px] leading-snug text-body">{profile.headline}</p>}
        {profile.location && <p className="mt-1 text-[13px] text-muted">{profile.location}</p>}

        {exp.length > 0 && (
          <ul className="mt-4 space-y-3 border-t border-line pt-4">
            {exp.map((e, i) => (
              <li key={`${e.company}-${i}`} className="flex items-center gap-3">
                {e.logo ? (
                  <img src={e.logo} alt="" referrerPolicy="no-referrer" className="size-9 shrink-0 rounded-lg bg-white object-contain p-1" />
                ) : (
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-line text-[13px] font-semibold text-muted">{initials(e.company)}</span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-medium text-ink">{e.title}</span>
                  <span className="block truncate text-[13px] text-muted">
                    {e.company}
                    {e.duration ? ` · ${e.duration}` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
