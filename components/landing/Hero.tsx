/* eslint-disable @next/next/no-img-element -- art is pre-sized AVIF/WebP in <picture> */
import { Wordmark } from "@/components/ds/Wordmark";
import { site } from "@/content/site";
import { Landmarks } from "./Landmarks";
import { StartLink } from "./StartLink";

const H = site.select.hero;
const SUB = H.sub.split(/(?<=\.) /);

/**
 * L1 Hero (Figma 4:43 / 5:65). The round-5 still (docs/team/art/round5/PICK.md: the Bay Area at night as a silver model,
 * seen from above, a few campuses lit), revealed with a slow scale (1.08 → 1, 2.4 s ease-out) under a moving film grain;
 * the two-layer scrim plus a right-edge vignette on desktop (it softens the hard top edge of the Pacific plane); the
 * landmark layer (verified companies as tiny silver marks at their towns, `Landmarks`); the metallic wordmark (160 tall,
 * 96 on phones) in the black sky; sub, white pill and fine print on the dark water of the bay. Opacity of the art never
 * animates, so it counts for LCP at once.
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
      {/* Steve r3, phones: the desktop ellipse is ~117 px wide here, so the sub sat on the lit city. A wider, flatter
          pool of dark behind the sub line only; the map still shows around it. */}
      <div
        aria-hidden
        className="absolute inset-0 md:hidden"
        style={{ background: "radial-gradient(ellipse 64% 15% at 50% 71%, rgba(0,0,0,0.7), rgba(0,0,0,0.38) 62%, rgba(0,0,0,0) 100%)" }}
      />
      {/* Right-edge vignette (desktop, 16:9 only): fades the flat Pacific plane and its hard top edge into the page. */}
      <div aria-hidden className="absolute inset-0 hidden bg-[linear-gradient(270deg,#000_0%,rgba(0,0,0,0.86)_9%,rgba(0,0,0,0.5)_21%,rgba(0,0,0,0.18)_31%,rgba(0,0,0,0)_40%)] md:block" />
      <Landmarks />
      <div className="relative flex h-full flex-col items-center px-4 pt-[82px] text-center md:pt-[100px]">
        <h1 id="hero-logo" className="hero-logo">
          <Wordmark className="h-24 w-[156px] md:h-40 md:w-[260px]" label="tal" />
        </h1>
        <div aria-hidden className="h-[178px] shrink-0 md:h-[210px]" />
        {/* Two sentences: on desktop each gets its own line ("In early preview…" never orphans "In"). */}
        <p className="hero-copy max-w-[342px] text-[16px] leading-6 tracking-[-0.1px] text-white/72 md:max-w-[640px] md:text-[18px] md:leading-7">
          {SUB.map((part, i) => (
            <span key={i} className="md:block">
              {i ? " " : ""}
              {part}
            </span>
          ))}
        </p>
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
