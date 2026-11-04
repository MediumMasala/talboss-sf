/* eslint-disable @next/next/no-img-element -- graded files are pre-sized AVIF/WebP with explicit dimensions */
import { PHOTOS, fallback, srcset, type PhotoKey } from "./photos";

type Props = {
  k: PhotoKey;
  className?: string;
  /** `sizes` for the wide/regular variant. */
  sizes?: string;
  /** Hero and title frames: load first, at high priority. */
  priority?: boolean;
  /** Warm very slightly on hover (+3% exposure, as light). */
  warm?: boolean;
  /** Slow push-in, for title frames. */
  pushIn?: boolean;
  /** Use the 4:5 crop under 768 px, when the photo has one. */
  tallOnPhone?: boolean;
};

/** A graded photograph with grain. The grade is in the file; nothing here filters it. */
export function Photo({ k, className = "", sizes = "100vw", priority, warm, pushIn, tallOnPhone }: Props) {
  const p = PHOTOS[k];
  const v = p.variants[0];
  const tall = tallOnPhone ? p.tall : undefined;
  return (
    <div className={`photo ${pushIn ? "push-in" : ""} ${className}`} data-warm={warm || undefined}>
      <picture>
        {tall && <source media="(max-width: 767px)" type="image/avif" srcSet={srcset(tall, "avif")} sizes="100vw" width={tall.w * 160} height={tall.h * 160} />}
        {tall && <source media="(max-width: 767px)" type="image/webp" srcSet={srcset(tall, "webp")} sizes="100vw" width={tall.w * 160} height={tall.h * 160} />}
        <source type="image/avif" srcSet={srcset(v, "avif")} sizes={sizes} />
        <source type="image/webp" srcSet={srcset(v, "webp")} sizes={sizes} />
        <img
          src={fallback(v)}
          alt={p.alt}
          width={v.w}
          height={v.h}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding={priority ? "sync" : "async"}
        />
      </picture>
    </div>
  );
}
