import { site } from "@/content/site";

const icon = "size-7";
const BLOCKS = [
  {
    className: "bg-[#ffe14d] text-[#0a0a0a]",
    icon: (
      <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 16V4M6 10l6-6 6 6M5 20h14" />
      </svg>
    ),
  },
  {
    className: "bg-[#2f5bff] text-white",
    icon: (
      <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 3.5 11.6 8.4 16.5 10 11.6 11.6 10 16.5 8.4 11.6 3.5 10 8.4 8.4ZM18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9Z" />
      </svg>
    ),
  },
  {
    className: "bg-[#e5482a] text-white",
    icon: (
      <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12Z" />
      </svg>
    ),
  },
];

/** Three loud colour blocks, like Idle's feature cards. */
export function LightSteps() {
  const { heading, steps } = site.howItWorks;
  return (
    <section aria-labelledby="how-heading" className="px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
      <h2 id="how-heading" className="text-center font-display text-[36px] font-semibold tracking-[-0.04em] text-ink sm:text-[52px]">
        {heading}
      </h2>
      <ol className="mx-auto mt-8 grid max-w-[1000px] gap-3 sm:mt-12 md:grid-cols-3 md:gap-4">
        {steps.map((step, i) => {
          const block = BLOCKS[i % BLOCKS.length];
          return (
            <li key={step.title} className={`flex min-h-[176px] flex-col justify-between rounded-[28px] p-6 md:min-h-[260px] ${block.className}`}>
              <div className="flex items-center justify-between">
                <span className="badge mono">Step {i + 1}</span>
                <span aria-hidden="true">{block.icon}</span>
              </div>
              <p className="font-display text-[26px] leading-[1.1] font-semibold tracking-[-0.03em] text-balance">{step.title}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
