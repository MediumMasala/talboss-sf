/* eslint-disable @next/next/no-img-element -- art is pre-sized AVIF/WebP in <picture> */
import { Wordmark } from "@/components/ds/Wordmark";
import { site } from "@/content/site";
import { StartLink } from "./StartLink";

const H = site.select.hero;

/**
 * L1 Hero (Figma 4:43 / 5:65). The particle-horizon still, revealed with a slow scale (1.08 → 1, 2.4 s ease-out)
 * under a moving film grain; the two-layer scrim; the metallic wordmark (160 tall, 96 on phones) in the black sky;
 * sub, white pill and fine print below the skyline. Opacity of the art never animates, so it counts for LCP at once.
 */
export function Hero() {
  return (
    <section id="top" aria-label="Tal" className="relative h-[560px] overflow-hidden md:h-[720px]">
      <div className="hero-art grain absolute inset-0 overflow-hidden">
        <picture>
          <source type="image/avif" media="(min-width: 768px)" srcSet="/art/hero-16x9-1024.avif 1024w, /art/hero-16x9-1376.avif 1376w" sizes="100vw" />
          <source type="image/webp" media="(min-width: 768px)" srcSet="/art/hero-16x9-1024.webp 1024w, /art/hero-16x9-1376.webp 1376w" sizes="100vw" />
          <source type="image/avif" srcSet="/art/hero-4x5-480.avif 480w, /art/hero-4x5-768.avif 768w, /art/hero-4x5-928.avif 928w" sizes="100vw" />
          <img
            src="/art/hero-4x5-768.webp"
            srcSet="/art/hero-4x5-480.webp 480w, /art/hero-4x5-768.webp 768w, /art/hero-4x5-928.webp 928w"
            sizes="100vw"
            alt=""
            fetchPriority="high"
            className="hero-img absolute inset-x-0 top-0 h-[520px] w-full object-cover md:h-full"
          />
        </picture>
      </div>
      {/* Scrim (4:45): radial ~78 % black behind the copy + linear 50 % at the top for the nav, 100 % at the bottom edge. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 30% 22% at 50% 77%, rgba(0,0,0,0.78), rgba(0,0,0,0.45) 60%, rgba(0,0,0,0) 100%), linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 78%, #000 100%)",
        }}
      />
      <div className="relative flex h-full flex-col items-center px-4 pt-[82px] text-center md:pt-[100px]">
        <h1 id="hero-logo" className="hero-logo">
          <Wordmark className="h-24 w-[156px] md:h-40 md:w-[260px]" label="tal" />
        </h1>
        <div aria-hidden className="h-[178px] shrink-0 md:h-[210px]" />
        <p className="hero-copy max-w-[342px] text-[16px] leading-6 tracking-[-0.1px] text-white/72 md:max-w-[560px] md:text-[18px] md:leading-7">{H.sub}</p>
        <div className="hero-copy mt-6 [animation-delay:120ms]">
          <StartLink from="hero" className="pill pill-l pill-white px-10">
            {H.cta}
          </StartLink>
        </div>
        <p className="hero-copy t-helper mt-3 text-white/64 [animation-delay:200ms]">{H.note}</p>
      </div>
    </section>
  );
}
