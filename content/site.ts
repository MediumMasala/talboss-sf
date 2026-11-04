/**
 * Every word on the site lives here. Components only read from this file.
 *
 * v4 (4 Nov 2026): short and plain, one line per screen, in the voice of the India onboarding.
 * The key map, with where each string appears, is in docs/team/COPY.md.
 *
 * House rules: Tal is "Tal" or "it", never a gendered pronoun. The page speaks as "we".
 * The old programme name never appears on screen. `program: "select"` is an internal value only.
 */

export const BRAND_NAME = "Tal";

/**
 * Claims. Change them here only.
 * network: verified (~234K Tal app + ~1.04M Grapevine). Never say "active" or "every week".
 * startups: founder-stated, approved for use 4 Nov 2026.
 * Each is used once, in select.stats.
 */
const claims = {
  network: "300,000+",
  startups: "5,000+",
};

const askTal = "Ask Tal to represent you";
const pasteLink = "Paste my LinkedIn link";
const pasteLinkInstead = "Paste my LinkedIn link instead";
const free = "Free for you. Companies pay us when they hire someone we introduced.";

export const site = {
  name: BRAND_NAME,

  claims,

  /** Root layout metadata (app/layout.tsx). */
  seo: {
    title: "Tal: a talent agent for engineers, researchers, PMs and designers",
    description:
      "Tal is a talent agent for engineers, researchers, PMs and designers, for roles in San Francisco, the Bay Area, and remote. We ask you before anyone hears your name, and it's free for you.",
  },

  /** The one funding claim. Top bar and footer only. */
  funding: {
    line: "We have raised $7 million from Peak XV (formerly Sequoia Capital).",
  },

  /** Resume upload rules and messages (resume step, app/api/upload, lib/validation). */
  upload: {
    maxBytes: 5 * 1024 * 1024,
    extensions: [".pdf", ".docx"],
    mimeTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    idle: {
      hint: "PDF or DOCX, up to 5 MB",
      dragging: "Drop it here",
    },
    errors: {
      wrongType: (ext: string) => `That's ${ext ? `a ${ext} file` : "a file we can't read"}. Please use a PDF or DOCX.`,
      tooBig: (size: string) => `That file is ${size}. The limit is 5 MB.`,
      empty: "That file is empty. Try another one.",
      corrupt: "We couldn't open that file. Try saving it again as a PDF.",
      multiple: "One file at a time, please.",
      network: "We couldn't reach Tal. Check your connection and try again.",
      server: "Something went wrong on our side. Please try again in a minute.",
      tooBigForServer: "That file is too big to upload. A PDF under 4 MB will work.",
    },
    /** Under the drop area and the email field. Links come from `legal`. */
    consent: { before: "By continuing, you agree to our", privacy: "Privacy Policy", and: "and", terms: "Terms" },
  },

  /* ---------------------------------------------------------------- */
  /* v4: the US site at "/". `select` is an internal key name only.    */
  /* ---------------------------------------------------------------- */
  select: {
    seo: {
      title: "Tal: a talent agent for engineers, researchers, PMs and designers",
      description:
        "Tal is a talent agent for engineers, researchers, PMs and designers, for roles in San Francisco, the Bay Area, and remote. We ask you before anyone hears your name, and it's free for you.",
      siteName: BRAND_NAME,
    },

    /** Social card text (the OG image is a generated still with "Talent."). */
    og: {
      line: "Talent.",
      sub: "Tal is a talent agent, now opening in San Francisco.",
      alt: "The word Talent. over a black and white photograph, with the line: Tal is a talent agent, now opening in San Francisco.",
    },

    /** Top nav (landing) and header (flow). Funding line: site.funding.line. */
    topBar: {
      wordmark: "tal",
      wordmarkLabel: "Tal, home",
      questions: "Questions?",
      cta: askTal,
    },
    sound: {
      off: "SOUND OFF",
      on: "SOUND ON",
      turnOn: "Turn sound on",
      turnOff: "Turn sound off",
    },
    /** Mobile bottom dock. */
    dock: askTal,

    /* ------------------------------ Landing ------------------------------ */

    /** L1. Hero. */
    hero: {
      word: "Talent.",
      sub: "Tal is a talent agent for engineers, researchers, PMs and designers, now opening in San Francisco.",
      cta: askTal,
      note: free,
    },

    /** L2. Glass chat card. An illustration, so it names no real company. */
    chat: {
      label: "An example",
      tal: "Tal",
      you: "You",
      messages: [
        { from: "tal", text: "Found 3 roles that fit you this week." },
        { from: "tal", text: "Staff engineer, Series B payments company, San Francisco." },
        { from: "you", text: "Yes to the payments one. No to the other two." },
        { from: "tal", text: "Intro sent to the founder. They'll write to you directly." },
      ] as { from: "tal" | "you"; text: string }[],
    },

    /** L3. White card with four stats. Each claim number appears here and nowhere else. */
    stats: {
      heading: "Behind Tal",
      items: [
        { value: claims.network, label: "tech professionals in our network" },
        { value: claims.startups, label: "AI and consumer startups" },
        { value: "6 months", label: "of representation" },
        { value: "$0", label: "in fees for you" },
      ],
      /** One line under the stats. The only Sarvam mention. */
      origin:
        "Tal is built in Bengaluru by the team behind Grapevine and Round1. An engineer Round1 placed at Sarvam AI went on to become its CTO.",
    },

    /** L4. How it works, numbered 01 to 04. */
    how: {
      heading: "How it works",
      steps: [
        { title: "Tell Tal who you are", body: "Your name, company and title. It takes a minute." },
        { title: "Tal finds your LinkedIn", body: "You confirm it's you. A resume is optional." },
        { title: "Tal emails you roles that fit", body: "One role at a time, in San Francisco, the Bay Area, or remote." },
        { title: "You say yes, Tal makes the intro", body: "Nobody hears your name until you say yes." },
      ],
    },

    /** L5. The terms, a short dark card. `paragraphs(date)` takes the computed end date, e.g. "4 May 2027". */
    terms: {
      heading: "The terms",
      paragraphs: (date: string) => [
        free,
        "We ask you before your name goes to anyone.",
        `We represent you for six months, until ${date}. Then we ask if you'd like us to keep going. If we don't hear back, we stop.`,
        "Ask at support@gvine.app and we'll delete your profile and resume.",
      ],
    },

    /** L6. Questions. Six, each answer two sentences or fewer. */
    faq: {
      heading: "Questions",
      items: [
        ["Where are the roles?", "In San Francisco, the Bay Area, and remote."],
        ["I'm not looking right now. Should I sign up?", "Yes. You keep your job, and we only email you when a role fits."],
        ["Will my company find out?", "Not from us. Your name goes to a company only after you say yes to that role."],
        ["How will I hear from Tal?", "By email, one role at a time. You reply yes or no."],
        ["What does it cost?", "Nothing. Companies pay us when they hire someone we introduced."],
        ["What happens after six months?", "We ask if you'd like us to keep going. If you don't reply, we take it you're not looking right now, and we stop."],
      ] as [string, string][],
    },

    /** L7. Footer (giant metallic "tal"). Funding: site.funding.line. Email: site.legal.supportEmail. */
    credits: {
      cta: askTal,
      made: "Made in Bengaluru by the team behind Grapevine",
      privacy: "Privacy",
      terms: "Terms",
    },

    /** Logo row caption, only if a logo row is shown. India bosses; never implies US openings. */
    proofLine: "Bosses from these companies hire on Tal",

    /* -------------------------------- Flow -------------------------------- */

    /** Bottom progress bar, five segments (A1 to A6). */
    steps: {
      label: (n: number, total: number) => `Step ${n} of ${total}`,
      names: ["Name", "Company", "Title", "LinkedIn", "Resume"],
    },

    apply: {
      /** Shared by every question screen. */
      continue: "Continue",
      enterHint: "or press Enter to continue",

      /** A1. */
      name: {
        question: "What's your full name?",
        sub: "This is the name we'll represent.",
        placeholder: "Your full name",
        missing: "Add your full name to continue.",
      },
      /** A2. */
      company: {
        question: "Where do you work?",
        sub: "Company name is enough.",
        placeholder: "Company",
        missing: "Add where you work to continue.",
      },
      /** A3. */
      title: {
        question: "What's your title?",
        sub: "Member of Technical Staff, Staff Engineer, Product Lead…",
        placeholder: "Member of Technical Staff",
      },

      /** A4. */
      search: {
        title: "Finding you on LinkedIn",
        wait: "This usually takes about 15 seconds.",
        manual: pasteLinkInstead,
      },

      /** Paste-link screen, reachable from A1 to A5b. */
      link: {
        question: "What's your LinkedIn link?",
        placeholder: "linkedin.com/in/your-name",
        badUrl: "That isn't a LinkedIn profile link. It looks like linkedin.com/in/your-name.",
      },

      /** A5. */
      confirm: {
        title: "Is this you?",
        hint: "We only read your public profile.",
        yes: "Yes, that's me",
        no: "No, not me",
        manual: "Paste my link",
        trying: "Checking the next profile",
        outOfProfiles: "That's everyone we found. Paste your LinkedIn link instead.",
      },

      /** A5b states. Primary action is always `manual`. Only notFound says we couldn't find them. */
      notFound: {
        title: "We couldn't find you on LinkedIn",
        sub: "Paste your LinkedIn link and we'll take it from there.",
        manual: pasteLink,
        skip: "Skip, I'll add my resume",
      },
      rateLimited: {
        title: "Tal is getting a lot of requests from your network",
        sub: "Paste your LinkedIn link to keep going.",
        manual: pasteLink,
        skip: "Skip, I'll add my resume",
      },
      dailyCap: {
        title: "Tal's LinkedIn search is full for today",
        sub: "Paste your LinkedIn link to keep going, or try again tomorrow.",
        manual: pasteLink,
        skip: "Skip, I'll add my resume",
      },
      searchDown: {
        title: "Tal's LinkedIn search isn't working right now",
        sub: "Paste your LinkedIn link to keep going.",
        manual: pasteLink,
        skip: "Skip, I'll add my resume",
      },
      offline: {
        title: "You're offline",
        sub: "Check your connection and try again.",
        retry: "Try again",
        manual: pasteLink,
      },

      /** A6. */
      resume: {
        title: "Add your resume",
        sub: "Optional. It helps Tal represent you better.",
        drop: "Drop a PDF or DOCX, or click to choose",
        cta: "Continue",
        sending: "Saving your resume",
      },
      /** A6b. Reached from the quiet link under the drop area. */
      noResume: {
        link: "No resume handy? We'll work from your LinkedIn.",
        /** When LinkedIn was skipped, so the line stays true. */
        linkNoLinkedIn: "No resume handy? Your email is enough to start.",
        title: "Where should Tal write to you?",
        sub: "We'll email you when a role fits.",
        emailLabel: "Email",
        emailPlaceholder: "you@example.com",
        emailMissing: "Add your email to continue.",
        emailInvalid: "That email doesn't look right.",
        cta: "Continue",
        back: "Add a resume instead",
      },

      /** A7. Their name, set large, then the credit line and three sentences. */
      done: {
        /** `date` like "4 May 2027". Set in tracked caps by CSS. */
        credit: (date: string) => `Represented by Tal · until ${date}`,
        next: "We'll read your profile and start looking for roles that fit.",
        email: (email: string) => `When one does, we'll email you at ${email}.`,
        noEmail: "We couldn't find an email on your resume. Add one so we can write to you.",
        private: "Nobody hears your name until you say yes.",
        close: "Done",
      },
    },
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
