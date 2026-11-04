import { site } from "@/content/site";
import { Wordmark } from "../ui";

/** Floating glass pill, like Idle's: wordmark on the left, mono badge on the right. The upload button lives in the bottom bar. */
export function LightNav() {
  const { badge } = site.light.nav;
  return (
    <header className="sticky top-0 z-20 px-4 pt-3 sm:pt-4">
      <div className="glass-nav mx-auto flex max-w-[1000px] items-center justify-between rounded-[20px] py-2.5 pr-3 pl-4 sm:pr-4 sm:pl-5">
        <a href="/" aria-label={`${site.name} home`} className="rounded-md">
          <Wordmark className="w-8 sm:w-9" />
        </a>
        <span className="badge mono">{badge}</span>
      </div>
    </header>
  );
}
