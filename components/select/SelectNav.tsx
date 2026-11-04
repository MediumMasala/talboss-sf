import { Container, Wordmark } from "../ui";

export function SelectNav() {
  return (
    <header>
      <Container className="flex items-center justify-between py-5 sm:py-6">
        <a href="/" aria-label="Tal Select home" className="flex items-center gap-3 rounded-md">
          <Wordmark className="w-11 sm:w-14" />
          <span className="hidden h-6 w-px bg-line-strong sm:block" aria-hidden="true" />
          <span className="hidden text-[13px] font-semibold tracking-[0.14em] text-ink uppercase sm:block">Select</span>
        </a>
        <nav aria-label="Page" className="flex items-center gap-5 text-[14px] text-muted">
          <a href="#how" className="transition-colors hover:text-ink">How it works</a>
          <a href="#faq" className="hidden transition-colors hover:text-ink sm:inline">FAQ</a>
          <a href="#apply" className="rounded-full border border-line-strong px-4 py-2 font-medium text-ink transition-colors hover:border-ink">Apply</a>
        </nav>
      </Container>
    </header>
  );
}
