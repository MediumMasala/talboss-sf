import { site } from "@/content/site";
import { Container, Wordmark } from "./ui";

export function Nav() {
  return (
    <header>
      <Container className="flex items-center py-5 sm:py-6">
        <a href="/" aria-label={`${site.name} home`} className="rounded-md">
          <Wordmark className="w-11 sm:w-14" />
        </a>
      </Container>
    </header>
  );
}
