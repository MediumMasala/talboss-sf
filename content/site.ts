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

export const site = {
  name: BRAND_NAME,

  claims,

  /** Root layout metadata (app/layout.tsx). */
  seo: {
    title: "Tal: a talent agent for engineers, researchers, PMs and designers",
    description:
      "Tal is a talent agent for engineers, researchers, PMs and designers, for roles in San Francisco, the Bay Area, and remote. We ask you before anyone hears your name, and it's free for you.",
  },

  /** The one funding claim. The pinned bar above the nav only (v4.1: cut from the footer). */
  funding: {
    line: "We’ve raised $7 million from Peak XV (formerly Sequoia Capital).",
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
      tooBigForServer: "That file is too big to upload. A PDF under 5 MB will work.",
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

    /** Social card text. The OG image is the hero: the metallic tal wordmark over a glowing skyline at night. */
    og: {
      line: "tal",
      sub: "The talent agent for engineers, researchers, PMs and designers. Now in San Francisco.",
      alt: "The silver tal wordmark in a black sky above a glowing city skyline, with the line: The talent agent for engineers, researchers, PMs and designers. Now in San Francisco.",
    },

    /** Top nav (landing) and header (flow). Funding line: site.funding.line. */
    topBar: {
      wordmark: "tal",
      wordmarkLabel: "Tal, home",
      questions: "Questions?",
      cta: askTal,
    },

    /* ------------------------------ Landing ------------------------------ */

    /** L1. Hero (Figma 4:43 / 5:65). The metallic tal wordmark is the headline; this is the line under it. */
    hero: {
      sub: "The talent agent for engineers, researchers, PMs and designers. Now in San Francisco.",
      cta: askTal,
      note: "Free for you. Companies pay when they hire.",
    },

    /** L2. Glass chat card (4:80). Names no real company. The caption under the card says what it is. */
    chat: {
      tal: "Tal",
      role: "Your talent agent",
      caption: "What a week with Tal looks like. Every intro waits for your yes.",
      /** The thread types itself in when it scrolls into view. `after` is the pause before each message (ms). */
      messages: [
        {
          from: "tal",
          meta: "Tal · Monday",
          text: "Three new roles for you. Two in SF, one remote.",
          roles: [
            ["Staff engineer", "a Series B payments company"],
            ["Founding engineer", "a seed-stage dev tools company"],
            ["ML engineer", "a Series A health company"],
          ],
          after: 400,
        },
        { from: "you", text: "Yes to the payments one. No to the other two.", after: 1500 },
        { from: "tal", meta: "Tal · Tuesday", text: "Intro sent to the founder. They'll reply here.", after: 1100 },
      ] as { from: "tal" | "you"; meta?: string; text: string; roles?: [string, string][]; after: number }[],
      typing: "Tal is typing",
    },

    /** L3. Behind Tal (white card 4:124). Each claim number appears here and nowhere else. */
    stats: {
      heading: "Behind Tal",
      body: "Tal just opened in San Francisco. Behind it is a network of 300,000+ tech professionals and 5,000+ AI and consumer startups, and a team that reads every profile.",
      items: [
        { value: claims.network, label: "tech professionals" },
        { value: claims.startups, label: "AI and consumer startups" },
      ],
    },

    /** The product mock inside the Behind Tal card (DS/Product Mock · Roles 19:923). */
    mock: {
      who: "Tal",
      role: "Your talent agent",
      eyebrow: "Monday · picked for you",
      title: "3 roles that fit you this week",
      yes: "Yes",
      roles: [
        { title: "Staff engineer", company: "Series B payments company", where: "San Francisco" },
        { title: "Founding engineer", company: "Seed-stage dev tools", where: "Remote" },
        { title: "ML engineer", company: "Series A health", where: "Bay Area" },
      ],
      notice: { who: "Tal", when: "now", title: "Intro sent to the founder.", body: "They'll write to you directly." },
    },

    /** L4. How it works, numbered 01 to 04 (4:154). */
    how: {
      heading: "How it works",
      sub: "Three questions now. Tal does the rest.",
      steps: [
        { title: "Tell Tal who you are", body: "Your name, where you work and your title. That's all it asks." },
        { title: "Tal finds your LinkedIn", body: "Your photo, roles and history fill in by themselves." },
        { title: "Tal emails you roles that fit", body: "Only roles at AI and consumer startups that match what you do." },
        { title: "You say yes, Tal makes the intro", body: "Nobody hears your name until you do." },
      ],
    },

    /** L5. The deal (glass card 22:1165). Each row leads in white and continues in 64 % white. */
    deal: {
      heading: "The deal",
      rows: [
        ["Free for you.", " Companies pay Tal when they hire."],
        ["Tal asks before every introduction.", " Nobody hears your name until you say yes."],
        ["Tal represents you for six months.", " If you go quiet, Tal assumes you're not looking and stops."],
        ["Roles are in San Francisco, the Bay Area, and remote.", ""],
      ] as [string, string][],
    },

    /** L6. Questions (4:195). Each answer two sentences or fewer. */
    faq: {
      heading: "Questions",
      items: [
        ["Who is Tal for?", "Engineers, researchers, PMs and designers in San Francisco, the Bay Area or remote."],
        ["Does it cost anything?", "Nothing. Companies pay Tal when they hire someone it introduced."],
        ["Will my employer find out?", "Not from Tal. Your name goes to a company only after you say yes to that role."],
        ["Which companies does Tal work with?", "AI and consumer startups, from seed to late stage. Tal only sends you roles that fit what you do."],
        ["What happens after six months?", "Tal asks if you'd like it to keep going. If you don't reply, it takes it you're not looking right now, and stops."],
        ["How do I delete my data?", "Write to support@gvine.app and Tal deletes your profile and resume."],
      ] as [string, string][],
    },

    /** L7. Footer (4:224) and the giant wordmark. Email: site.legal.supportEmail. */
    credits: {
      cta: askTal,
      copyright: "© 2026 Tal",
      privacy: "Privacy",
      terms: "Terms",
    },

    /** Logo marquee caption (21:965). India bosses; never implies US openings. */
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
      /** v4.1: the footer's back pill (desktop). */
      back: "Back",

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
        /** Under the title (v4.1, from the Figma frame). */
        sub: "Tal is pulling your photo, role and work history so you don't have to type it.",
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
        /** v4.1: primary action on this state, per the Figma frame. `wait(s)` while the server's Retry-After runs. */
        retry: "Try again",
        wait: (s: string) => `Try again in ${s}`,
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
        /** v4.1: under a chosen file's name. */
        replace: "Click to choose another",
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
        sending: "Saving",
        back: "Add a resume instead",
      },

      /** A7 (Figma 3:661 / 5:917). Their name, set large, the credit caps, one line about what's ahead, three chips. */
      done: {
        /** `date` like "4 May 2027". Set in tracked caps by CSS. */
        credit: (date: string) => `Represented by Tal · until ${date}`,
        sub: "Tal is reading your profile now. Roles in San Francisco, the Bay Area and remote will reach your inbox as they fit, and every introduction waits for your yes.",
        /** The three chips that float up under the line. */
        places: ["San Francisco", "Bay Area", "Remote"],
        email: (email: string) => `Tal will write to ${email}.`,
        noEmail: "We couldn't find an email on your resume. Write to support@gvine.app so Tal can reach you.",
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
