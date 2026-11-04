/**
 * Every word on the site lives here. Components only read from this file.
 *
 * v3 (4 Nov 2026): Tal, a talent agent. The page opens on the word "Talent" and ends on the reader's name.
 * The full key map, with where each string appears and why it's worded that way, is in docs/team/COPY.md.
 *
 * House rules for anyone editing: Tal is "it" or "Tal", never a gendered pronoun. The page speaks as "we".
 * The old programme name never appears on screen. `program: "select"` is an internal value only.
 */

export const BRAND_NAME = "Tal";

/**
 * Claims. Change them here only.
 * network: verified (~234K Tal app + ~1.04M Grapevine). Never say "active" or "every week".
 * startups: founder-stated, approved for use 4 Nov 2026.
 * Each is used once, in networkLine (select.origin.network).
 */
const claims = {
  network: "300,000+",
  startups: "5,000+",
};

/* ------------------------------------------------------------------ */
/* v3 strings that more than one place needs. Defined once, here.      */
/* ------------------------------------------------------------------ */

const hireLine = "It's free for you. Companies pay us when they hire someone we introduced.";
const askTal = "Ask Tal to represent you";
const askTalMe = "Ask Tal to represent me";
const founderTo = "A founder in San Francisco";
const pasteLink = "Paste my LinkedIn link";
const skipToResume = "Skip this and add my resume";

/** "What an agent does": three prose paragraphs, each under 45 words. The one AI mention on the page is in [0]. */
const agentParagraphs = [
  "We read everything you give us, properly. We use AI to read every profile and role, day and night, and people on our team decide who should meet whom. When we describe you to a founder, it should sound like we know your work.",
  "Then we look for the role, and for the person who makes the call on it, usually a founder or the manager you'd work for. A short note from someone they trust gets read, and that's the note we write.",
  "When we find something, we email you about it: the company, the role, the person and why we think it's worth your time. If you say no, nobody hears your name. Say yes, and we make the intro and set up the conversation.",
] as const;

/** The terms, as a letter of engagement. `{date}` is the computed end date, e.g. "4 May 2027". Under 120 words in total. */
const termsParagraphs = (date: string) => [
  hireLine + " You never pay us anything.",
  "We ask before your name goes anywhere. Every role comes to you first, by email, and nobody outside Tal hears about you unless you say yes to it.",
  `We'll represent you for six months, until ${date}. Then we'll ask if you want us to keep going. If we don't hear back, we'll assume you're not looking right now, and we'll stop.`,
  "We use your LinkedIn profile and resume only to represent you. Ask at support@gvine.app and we'll delete your profile and resume.",
];

const faqItems: [string, string][] = [
  ["Where are the roles?", "In San Francisco, the Bay Area, and remote."],
  ["I'm happy where I am. Should I still sign up?", "Yes, and it's a good time to. You keep your job, and we only write to you when a role looks worth your time."],
  ["Will my company find out?", "Not from us. Your name goes to a company only after you've said yes to that specific role."],
  ["How will I hear from you?", "By email, one role at a time. Each one says who the company is, what the role is and why we thought of you, and you reply yes or no."],
  ["What does it cost?", "Nothing. Companies pay us when they hire someone we introduced."],
  ["What happens after six months?", "We'll write and ask if you'd like us to keep going. If you don't reply, we'll take it that you're not looking right now, and we'll stop representing you."],
];

const originBody =
  "We started in Bengaluru with Grapevine, India's largest anonymous professional network, where more than a million verified professionals share real salaries and the truth about where they work. Then we built Round1, a hiring agency that became profitable placing engineers at India's fastest-growing AI companies. One engineer Round1 placed at Sarvam AI went on to become its CTO. Round1 taught us that the scarce thing in hiring is trust. A founder will make time for someone new when the note comes from people they believe. We built Tal on that.";

/** The only use of both claim numbers, each once. */
const networkLine = `There are about 20 of us, and the network behind Tal is ${claims.network} tech professionals and ${claims.startups} AI and consumer startups.`;

export const site = {
  name: BRAND_NAME,

  claims,

  /** Root layout metadata (app/layout.tsx). Same words as select.seo so every page tells one story. */
  seo: {
    title: "Tal: a talent agent for engineers, researchers, PMs and designers",
    description:
      "Tal is a talent agent for engineers, researchers, PMs and designers, for roles in San Francisco, the Bay Area, and remote. We ask you before anyone hears your name, and it's free for you.",
    ogAlt: "The word Talent, set over a photograph.",
  },

  /** The one funding claim. Top bar and end credits only. */
  funding: {
    before: "We have raised",
    amount: "$7 million",
    after: "from Peak XV (formerly Sequoia Capital).",
    line: "We have raised $7 million from Peak XV (formerly Sequoia Capital).",
  },

  /** Resume upload rules and messages for the resume step. */
  upload: {
    maxBytes: 5 * 1024 * 1024,
    extensions: [".pdf", ".docx"],
    mimeTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],

    idle: {
      button: "Choose a file",
      hint: "PDF or Word file, up to 5 MB",
      dragging: "Let go to add it",
    },

    errors: {
      wrongType: (ext: string) =>
        `That's ${ext ? `a ${ext} file` : "a file we can't read"}. We need a PDF or a Word document (.docx).`,
      tooBig: (size: string) => `That file is ${size}, and the limit is 5 MB. Saving it as a PDF usually makes it smaller.`,
      empty: "That file looks empty. Try another one.",
      corrupt: "We couldn't open that file. Try saving it again as a PDF.",
      multiple: "One file at a time, please.",
      network: "We couldn't reach our server. Check your connection and try again.",
      server: "Something went wrong on our side. Please try again in a minute.",
      tooBigForServer: "That file is too big for us to upload. A PDF under 4 MB will work.",
    },

    /** Under the drop zone and the email field. Links come from `legal` below. */
    consent: { before: "By continuing, you agree to our", privacy: "Privacy Policy", and: "and", terms: "Terms" },

  },

  /* ---------------------------------------------------------------- */
  /* v3: the US site at "/". The key name `select` is internal only.   */
  /* Keys are in flow order.                                          */
  /* ---------------------------------------------------------------- */
  select: {
    seo: {
      title: "Tal: a talent agent for engineers, researchers, PMs and designers",
      description:
        "Tal is a talent agent for engineers, researchers, PMs and designers, for roles in San Francisco, the Bay Area, and remote. We ask you before anyone hears your name, and it's free for you.",
      /** openGraph.siteName (app/page.tsx currently hardcodes the old name; use this). */
      siteName: BRAND_NAME,
    },

    /** Social card (app/opengraph-image.tsx): "Talent" on a graded photograph. */
    og: {
      line: "Talent",
      sub: "Tal is a talent agent, opening in San Francisco now.",
      alt: "The word Talent set over a photograph, with the line: Tal is a talent agent, opening in San Francisco now.",
    },

    /** 0. Top bar and fixed controls. The funding line is `site.funding.line`. */
    topBar: {
      wordmark: "tal",
      wordmarkLabel: "Tal, home",
    },
    sound: {
      off: "SOUND OFF",
      on: "SOUND ON",
      /** aria-label for the toggle, describing what a press does. */
      turnOn: "Turn sound on",
      turnOff: "Turn sound off",
    },
    /** Mobile bottom dock and desktop after-hero action. Hidden while the form is on screen. */
    dock: askTal,

    /** 1. Opening frame. */
    hero: {
      word: "Talent",
      /** The pick. Set under the word. */
      sub: "That's what we call the people we represent. Tal is a talent agent for engineers, researchers, PMs and designers, and we're opening in San Francisco now.",
      /** Ranked alternates, for the founder only. Never rendered. */
      alternates: [
        "In film, that's the word for the people in front of the camera, and every one of them has an agent. Tal is a talent agent for engineers, researchers, PMs and designers, opening in San Francisco now.",
        "That's what we call the people we represent. We read their work, find the founder who should meet them, and ask before we say their name. Tal is opening in San Francisco now.",
      ],
    },

    /** Mono step counter on the card. */
    steps: {
      label: (n: number, total: number) => `STEP ${n} OF ${total}`,
      names: ["YOU", "LINKEDIN", "THE LETTER", "RESUME"],
    },

    apply: {
      /** 1. Form, first step (on the linen card). */
      you: {
        /** Live title line before anything is typed (set in the display serif, crossfades to the typed name). */
        nameEmpty: "Your name",
        /** Mono credit under the live name. */
        credit: "REPRESENTED BY TAL",
        hint: "Tell us your name and where you work. We'll find you on LinkedIn and write the note we'd send a founder about you.",
        fields: {
          name: { label: "Full name", placeholder: "Your full name" },
          company: { label: "Company", placeholder: "Where you work now" },
          role: { label: "Title", placeholder: "Member of Technical Staff" },
        },
        cta: "Find me on LinkedIn",
        manual: "Paste my LinkedIn link instead",
        manualLabel: "Your LinkedIn link",
        manualPlaceholder: "linkedin.com/in/your-name",
        manualCta: "Use this link",
        badUrl: "That doesn't look like a LinkedIn profile link. It should look like linkedin.com/in/your-name.",
        missing: "We need your full name and where you work to find you.",
      },

      /** 2. Finding you. Driven by the API `stage`; use Math.max on the index. */
      search: {
        srLabel: "Looking for you on LinkedIn",
        stages: {
          search: "Looking for you on LinkedIn",
          people: "Going through the profiles with your name",
          profile: "Reading your profile",
          found: "Getting it ready for you to check",
        },
        /** Shown only when it's taking a while. */
        wait: "This usually takes about 15 seconds.",
        skip: skipToResume,
      },

      /** Error screens. Body leads with pasting the link; primary action = `manual`. */
      notFound: {
        title: "We couldn't find you on LinkedIn.",
        body: "Some profiles don't show up in search. Paste your link and we'll read it from there, or skip this and we'll work from your resume.",
        manual: pasteLink,
        skip: skipToResume,
      },
      /** API code "rate_limited" (per-network or per-name limit). Never says "couldn't find you". */
      rateLimited: {
        title: "We've had a lot of searches from your network this hour.",
        body: "Paste your LinkedIn link and we'll carry on from there. Or skip this, and we'll work from your resume.",
        manual: pasteLink,
        skip: skipToResume,
      },
      /** API code "daily_cap" (global per-day counter, resets daily). Never says "couldn't find you". */
      dailyCap: {
        title: "We've done all the LinkedIn searches we can for today.",
        body: "Paste your LinkedIn link and we'll carry on from there. Or try again tomorrow, or skip this and we'll work from your resume.",
        manual: pasteLink,
        skip: skipToResume,
      },
      /** HTTP 502: Apify (our LinkedIn search) is down. */
      searchDown: {
        title: "Our LinkedIn search isn't working right now, and that's on our side.",
        body: "Paste your LinkedIn link and we'll try it that way. Or skip this, and we'll work from your resume.",
        manual: pasteLink,
        skip: skipToResume,
      },
      /** HTTP 503 or no connection. */
      offline: {
        title: "You seem to be offline.",
        body: "When you're back, try again or paste your LinkedIn link. Everything you typed is still here.",
        retry: "Try again",
        manual: pasteLink,
      },

      /** 3. "Is this you?" (casting card). */
      confirm: {
        title: "Is this you?",
        hint: "We only read your public profile.",
        yes: "Yes, that's me",
        no: "No, not me",
        manual: "Paste my link",
        trying: "Looking at the next profile with your name",
        /** After three "No, not me". */
        outOfProfiles: "That's everyone we found with your name. Paste your LinkedIn link and we'll start from that.",
      },

      /** 4. The letter, on linen paper. Draft comes from /api/pitch. */
      email: {
        /** Above the letter. Only true if the letter is editable; otherwise use `introReadOnly`. */
        intro: "This is how we'd introduce you. Change anything that isn't right.",
        introReadOnly: "This is how we'd introduce you to a founder.",
        toLabel: "To",
        toLine: founderTo,
        fromLabel: "From",
        from: "Tal",
        subjectLabel: "Subject",
        /** "{Full name}, {title} at {company}". Pass the FULL name. Drops empty parts cleanly. */
        subject: (name: string, title: string, company: string) =>
          `${name}${title ? `, ${title}` : ""}${company ? `${title ? " at" : ", at"} ${company}` : ""}`,
        signature: "Tal, a talent agent",
        /** Small, under the signature. */
        sendNote: "We'll only send this to a founder you've agreed to meet.",
        drafting: "Writing your letter",
        draftTag: "DRAFT",
        /** When /api/pitch returns source:"fallback". */
        fallbackNote: "This first draft comes from your title alone. We'll write a better one once we've read your profile.",

        /** needsMore:true. Lead-in by what we have, then the one question. */
        needsMoreThin: "So far we only know your title.",
        needsMoreLinkedIn: "So far we only know what's on your LinkedIn.",
        question: "What's one thing you've built that you'd want a founder to hear about?",
        placeholder: "A sentence or two is plenty.",
        submit: "Add it to the letter",
        rewriting: "Adding it to the letter",
        rewritten: "We've added that in.",
        /** sr-only label for the one highlighted passage of their own words. */
        highlightLabel: "From your answer",
        keep: "Looks good as it is",
        error: "We couldn't rewrite it just now. Please try once more.",
      },

      /** 5. Resume, optional. Drop zone uses site.upload.idle / errors / consent. */
      resume: {
        title: "Want it sharper? Add your resume.",
        hint: "PDF or Word file, up to 5 MB. The more we read, the better we can introduce you.",
        drop: "Drop it here, or choose a file",
        cta: askTalMe,
        sending: ["Saving your details", "Putting it with your profile", "One moment"],
      },
      /** The quiet path. A small text link under the drop zone. */
      noResume: {
        link: "No resume handy? We'll work from your LinkedIn.",
        /** When LinkedIn was skipped, so the line stays true. */
        linkNoLinkedIn: "No resume handy? Your email is enough to start.",
        title: "Where should we write to you?",
        hint: "We'll email you when there's a role worth your time, and you tell us yes or no.",
        emailLabel: "Email",
        emailPlaceholder: "you@example.com",
        emailMissing: "We'll need an email to write to you.",
        emailInvalid: "That email doesn't look right. Check it for a typo.",
        cta: askTalMe,
        back: "Add a resume instead",
      },

      /** 6. Done: the title card. Their name is set in the display serif above `credit`. */
      done: {
        /** `date` like "4 May 2027". */
        credit: (date: string) => `REPRESENTED BY TAL · UNTIL ${date.toUpperCase()}`,
        /** Three sentences, in this order. */
        next: (first: string) =>
          `Thank you${first ? `, ${first}` : ""}. We'll read everything properly and start looking for roles worth your time.`,
        email: (email: string) => `When we find one, we'll write to you at ${email}.`,
        noEmail: "We couldn't find an email on your resume, so we can't write to you yet. Add one to your resume and upload it again.",
        private: "Nobody outside Tal hears your name until you say yes.",
      },
    },

    /** 7. What an agent does: three offset photo-and-prose pairs. */
    agent: {
      label: "WHAT AN AGENT DOES",
      paragraphs: agentParagraphs,
    },

    /** 8. The sample letter. An obviously invented person. Only when the hero letter isn't on screen. */
    sample: {
      label: "SAMPLE · AN INVENTED PERSON, TO SHOW HOW WE WRITE",
      to: founderTo,
      from: "Tal",
      subject: "Noor Halvorsen, staff engineer at Acme Freight",
      body: [
        "Noor leads routing at Acme Freight and rebuilt the dispatch system that plans every truck's day.",
        "Before that, Noor spent four years building the payments ledger at a regional bank.",
      ],
      signature: "Tal, a talent agent",
    },

    /** 9. Where we come from (forest night), then the contact sheet. */
    origin: {
      heading: "Where we come from",
      body: originBody,
      network: networkLine,
      caption: "People on Tal in Bengaluru",
    },

    /** 10. The terms, as a letter of engagement on paper. */
    terms: {
      label: "THE TERMS",
      heading: "What we're agreeing to",
      paragraphs: termsParagraphs,
      signature: "The Tal team, Bengaluru",
    },

    /** 11. Questions. Six, each answer two sentences or fewer. */
    faq: {
      heading: "Questions",
      items: faqItems,
    },

    /** 12. End credits. */
    credits: {
      cta: askTal,
      made: "Made in Bengaluru by the team behind Grapevine",
      photosLabel: "PHOTOGRAPHS",
      /** One line per photographer, e.g. "PHOTOGRAPH: JANE DOE / UNSPLASH". */
      photo: (name: string, source: string) => `PHOTOGRAPH: ${name.toUpperCase()} / ${source.toUpperCase()}`,
      privacy: "Privacy",
      terms: "Terms",
      /** Funding line: site.funding.line. Support email: site.legal.supportEmail. */
    },

    /** Logo row caption (components/tal/Sections.tsx). Honest: India bosses hire on Tal. Never imply US openings. */
    proofLine: "Bosses from these companies hire on Tal",
  },

  /** Runs under Grapevine's policies (Watercooler Chat Private Limited). /privacy and /terms redirect here. */
  legal: {
    privacyUrl: "https://www.grapevine.in/privacy",
    termsUrl: "https://www.grapevine.in/terms",
    supportEmail: "support@gvine.app",
    company: "Watercooler Chat Private Limited",
  },
};

export type Site = typeof site;
