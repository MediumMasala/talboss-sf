import { site } from "@/content/site";

/** "We've raised" bar (20:964 / 22:1214): pinned above everything, glass 6 %, hairline, blur. Wraps after "Peak XV" on phones. */
export function RaisedBar() {
  const line = site.funding.line;
  const cut = line.indexOf(" (");
  return (
    <div className="sticky top-0 z-50 flex h-[53px] items-center justify-center border-b border-hair bg-white/6 px-4 text-center backdrop-blur-md md:h-9">
      <p className="t-helper text-white/72">
        {cut > 0 ? (
          <>
            {line.slice(0, cut)}
            <br className="md:hidden" />
            <span className="hidden md:inline"> </span>
            {line.slice(cut + 1)}
          </>
        ) : (
          line
        )}
      </p>
    </div>
  );
}
