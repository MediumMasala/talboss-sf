import { site } from "@/content/site";
import { BrandMarquee } from "../BrandMarquee";

export function SelectProof() {
  return <BrandMarquee line={site.select.proofLine} />;
}
