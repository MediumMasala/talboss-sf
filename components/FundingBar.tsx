import { site } from "@/content/site";

export function FundingBar() {
  const { before, amount, after } = site.funding;
  return (
    <p className="funding-bar">
      {before} <b className="font-bold">{amount}</b> {after}
    </p>
  );
}
