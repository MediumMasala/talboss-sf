import { site } from "@/content/site";
import { Container, Wordmark } from "./ui";

/** `consent`: also say "By uploading, you agree to…" here, for pages that don't show it under the button. */
export function Footer({ consent = false }: { consent?: boolean }) {
  const { privacyUrl, termsUrl, supportEmail, company } = site.legal;
  const agree = site.upload.consent;
  const link = "transition-colors hover:text-ink";
  return (
    <footer className="border-t border-line py-10">
      <Container className="flex flex-col gap-6 text-[13px] text-muted sm:flex-row sm:items-end sm:justify-between">
        <Wordmark className="w-10" />
        <div className="flex flex-col gap-2 sm:items-end">
          {consent && (
            <p>
              {agree.before}{" "}
              <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-muted/40 underline-offset-2 hover:text-ink">
                {agree.privacy}
              </a>{" "}
              {agree.and}{" "}
              <a href={termsUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-muted/40 underline-offset-2 hover:text-ink">
                {agree.terms}
              </a>
              .
            </p>
          )}
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className={link}>
              Privacy
            </a>
            <a href={termsUrl} target="_blank" rel="noopener noreferrer" className={link}>
              Terms
            </a>
            <a href={`mailto:${supportEmail}`} className={link}>
              {supportEmail}
            </a>
          </nav>
          <p>
            © {new Date().getFullYear()} {company}
          </p>
        </div>
      </Container>
    </footer>
  );
}
