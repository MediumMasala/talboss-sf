import { permanentRedirect } from "next/navigation";

// The light page was previewed here before it became the home page.
export default function V2() {
  permanentRedirect("/");
}
