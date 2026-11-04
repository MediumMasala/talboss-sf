/* eslint-disable @next/next/no-img-element -- monochrome SVG marks */
import { site } from "@/content/site";

/** DS/Logo Marquee Row (18:1395): the 12 verified companies, white, optical heights 16–24 px, 48 px apart. */
const LOGOS: [string, string, number, number][] = [
  ["google", "Google", 23.386, 24],
  ["microsoft", "Microsoft", 22, 22],
  ["amazon", "Amazon", 59.721, 20],
  ["uber", "Uber", 59.553, 20],
  ["salesforce", "Salesforce", 34.286, 24],
  ["adobe", "Adobe", 24.849, 22],
  ["linkedin", "LinkedIn", 22, 22],
  ["paypal", "PayPal", 19.493, 24],
  ["intuit", "Intuit", 79.585, 16],
  ["spotify", "Spotify", 79.857, 24],
  ["razorpay", "Razorpay", 85.107, 18],
  ["sarvam", "Sarvam", 101.007, 16],
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center gap-8 pr-8 md:gap-12 md:pr-12" aria-hidden={hidden || undefined}>
      {LOGOS.map(([file, name, w, h]) => (
        <li key={file} className="flex items-center">
          {/* phones: 18 px tall rows (75 %); desktop: Figma's optical heights */}
          <img
            src={`/logos/${file}.svg`}
            alt={hidden ? "" : name}
            width={w}
            height={h}
            loading="lazy"
            className="block h-[calc(var(--h)*0.75px)] w-auto md:h-[calc(var(--h)*1px)]"
            style={{ ["--h" as string]: h }}
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * Logo marquee (21:964 / 22:1222). Two copies of the row drift left forever (42 s a loop, linear, transform only),
 * at 40 % white, under black edge fades; hovering or focusing it pauses the drift.
 */
export function Marquee() {
  return (
    <section aria-label={site.select.proofLine} className="flex flex-col items-center gap-6 pb-24 pt-10 md:gap-7 md:pb-[140px] md:pt-12">
      <p className="px-4 text-center text-[12px] font-medium uppercase leading-5 tracking-[1.2px] text-white/48 md:text-[13px]">{site.select.proofLine}</p>
      <div className="marquee relative h-12 w-full overflow-hidden" tabIndex={0}>
        <div className="marquee-track absolute top-1/2 -translate-y-1/2 opacity-40">
          <Row />
          <Row hidden />
        </div>
      </div>
    </section>
  );
}
