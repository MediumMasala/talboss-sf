/**
 * Every word on the landing page lives here.
 * Components only read from this file, so you can edit copy without touching them.
 *
 * Brand: Tal Boss (black canvas, #1c1c1e cards, SF Pro headlines, Inter body, white pill buttons).
 */

export const BRAND_NAME = "Tal Boss";

/**
 * Claims used in paid-ad copy. Change them here only.
 * network: verified (~234K Tal app + ~1.04M Grapevine). Never say "active" or "every week".
 * startups: founder-stated, not verified in our database.
 * Each number appears once in the page body (select.about), plus the hero field legend.
 */
const claims = {
  network: "300,000+",
  startups: "5,000+",
};

/** DEPRECATED (founder decision, 4 Nov 2026): no named humans. Kept only so components compile. */
export type TeamMember = { name: string; role: string; photo: string; linkedin: string };

export const site = {
  name: BRAND_NAME,

  claims,

  seo: {
    title: `${BRAND_NAME}: apply once, get represented in 1000+ job opportunities`,
    description: "Upload your resume and talk to SF startup founders directly. No HR, ATS, agency BS.",
    ogAlt: `${BRAND_NAME}: apply once, get represented in 1000+ job opportunities`,
  },

  funding: {
    before: "We have raised",
    amount: "$7 million",
    after: "from Peak XV (formerly Sequoia Capital).",
  },

  hero: {
    /** lead / main / scribble (underlined) / tail. */
    headline: { lead: "Apply once.", main: "Get represented in", scribble: "1000+", tail: "job opportunities." },
    trust: "We won't spam you.",
    /** Pill tags on the two hands. */
    tags: { left: "FOUNDER", right: "YOU" },
  },

  /** The light, idle.space-style page (preview at /v2). */
  light: {
    nav: { badge: "SAN FRANCISCO" },
    /** The one line under the upload button. */
    hint: "PDF or DOCX · We won't spam you.",
    stickers: ["NO ATS", "NO AGENCY BS", "SF STARTUPS"],
  },

  howItWorks: {
    heading: "How it works",
    steps: [
      { title: "Upload your resume" },
      { title: "Our AI matches you with a founder" },
      { title: "Intro chat with the founder" },
    ],
  },

  upload: {
    maxBytes: 5 * 1024 * 1024,
    extensions: [".pdf", ".docx"],
    mimeTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],

    idle: {
      button: "Upload your resume",
      hint: "PDF or DOCX",
      dragging: "Drop it here",
    },

    errors: {
      wrongType: (ext: string) => `That's ${ext ? `a ${ext}` : "not a resume"} file. We need a PDF or DOCX.`,
      tooBig: (size: string) => `That file is ${size}. Max is 5MB. Try exporting a lighter PDF.`,
      empty: "That file looks empty. Try another one?",
      corrupt: "That doesn't look like a real PDF or DOCX. Try exporting it again?",
      multiple: "One resume at a time, please.",
      network: "Couldn't reach us. Check your connection and try again.",
      server: "Something broke on our side. Give it another go in a minute.",
      tooBigForServer: "That file is too big to upload. Try a lighter PDF (under 4MB).",
    },

    /** Shown under the drop zone, before anything is uploaded. Links come from `legal` below. */
    consent: { before: "By uploading, you agree to our", privacy: "Privacy Policy", and: "and", terms: "Terms" },

    matching: {
      srLabel: "Matching your resume with startups",
      lines: ["Reading your resume", "Finding SF startups that fit", "Lining up founders who'd want to talk"],
      waiting: "Almost there",
    },

    done: {
      title: "You're in.",
      body: "We will get back to you on this soon.",
      noEmail: "One thing: we couldn't find an email on your resume. Add it and upload again so founders can reach you.",
      restart: "Upload a different resume",
      reupload: "Upload again",
    },

    uploadError: {
      title: "That didn't go through.",
      retry: "Try again",
      other: "Choose another file",
    },

    /** Only shown if you put a second upload box on the page. */
    elsewhere: {
      inProgress: "You've already got a resume going.",
      jump: "Finish it",
      done: "You're in. Your matches are on the way.",
    },
  },

  /** Real logos: Bay Area HQ companies whose bosses have live jobs on Tal Boss (same list as the live site). */
  proof: {
    line: "Hiring on Tal Boss",
    // [name, file in /brands, brand hex, width/height of the mark]
    brands: [
      ["Google", "google.svg", "4285F4", 0.97],
      ["NVIDIA", "nvidia.svg", "76B900", 1.51],
      ["Stripe", "stripe.svg", "635BFF", 0.71],
      ["Uber", "uber.svg", "000000", 2.98],
      ["Databricks", "databricks.svg", "FF3621", 0.92],
      ["Salesforce", "salesforce.svg", "00A1E0", 1.43],
      ["LinkedIn", "linkedin.svg", "0A66C2", 1.0],
      ["PayPal", "paypal.svg", "003087", 0.81],
      ["Adobe", "adobe.svg", "FF0000", 1.13],
      ["Intuit", "intuit.svg", "236CFF", 4.97],
      ["Okta", "okta.svg", "007DC1", 1.0],
      ["eBay", "ebay.svg", "E53238", 2.51],
    ] as [string, string, string, number][],
  },

  /** Tal Select (US): the landing at "/" for US LinkedIn ads. Every key is mapped in docs/team/COPY.md. */
  select: {
    seo: {
      title: "Tal Select: an AI talent agent for engineers, now opening in SF",
      description:
        "Tal is a talent agent for top professionals, opening in SF now. Tal finds roles that fit and emails them to you. Nobody sees your name until you say yes. Free.",
    },

    /** Social card (opengraph-image). */
    og: {
      line: "Keep building. Tal makes the intros.",
      sub: "Tal Select is opening in SF. Free for engineers.",
      alt: "Tal Select: keep building, Tal makes the intros.",
    },

    /** DEPRECATED (founder decision, 4 Nov): no named humans on the page. Leave empty; frontend should drop the team block. */
    team: [] as TeamMember[],

    hero: {
      eyebrow: "Tal Select · now opening in SF",
      /** Two lines. Line one sits quieter; line two carries the weight. */
      title: ["Keep building.", "Tal makes the intros."] as [string, string],
      sub: "Tal is a talent agent for top professionals, opening in SF now. For six months, Tal finds roles that fit you and emails them to you. Nobody sees your name until you say yes. Free.",
      /** Small line under the form card. Hide after done. */
      note: "You'll read the intro Tal would send a founder about you before he asks for your resume.",
    },

    apply: {
      you: {
        title: "Who should Tal represent?",
        hint: "Name, company and title. Tal finds your LinkedIn and drafts your intro from it.",
        fields: {
          name: { label: "Full name", placeholder: "Your full name" },
          company: { label: "Company", placeholder: "Where you work now" },
          role: { label: "Title", placeholder: "Member of Technical Staff" },
        },
        cta: "Draft my intro",
        manual: "Paste my LinkedIn link instead",
        manualLabel: "Your LinkedIn link",
        manualPlaceholder: "linkedin.com/in/your-name",
        manualCta: "Draft my intro",
        badUrl: "That isn't a LinkedIn profile link. It should look like linkedin.com/in/your-name.",
        missing: "Tal needs your full name and company to find you.",
      },
      search: {
        /** Index 0 = API stages "search" and "people", 1 = "profile", 2 = found and about to show. */
        lines: ["Searching LinkedIn", "Reading the profile Tal found", "Lining it up for you to check"],
        /** The only wait string on the page. */
        wait: "Usually about 15 seconds.",
        skip: "Skip this. I'll add my resume.",
      },
      confirm: {
        title: "Is this you?",
        hint: "Tal only reads your public profile.",
        yes: "Yes, that's me",
        no: "Not me",
        trying: "Trying the next match",
      },
      notFound: {
        title: "Tal couldn't find you.",
        body: "Some profiles don't show up in search. Paste your link, or skip it and Tal will work from your resume.",
        manual: "Paste my LinkedIn link",
        skip: "Skip. I'll add my resume.",
      },
      /** API code "rate_limited" (per-IP or per-name limit). Never say "couldn't find you". Primary action = paste link. */
      rateLimited: {
        title: "Tal is getting a lot of requests from your network.",
        body: "Lookups from your network are paused for now. Paste your LinkedIn link and Tal will carry on, or skip it and Tal will work from your resume.",
        manual: "Paste my LinkedIn link",
        skip: "Skip. I'll add my resume.",
      },
      /** Global daily lookup cap reached. Never say "couldn't find you". Primary action = paste link. */
      dailyCap: {
        title: "Tal's LinkedIn search is full for today.",
        body: "Paste your LinkedIn link and Tal will carry on, or skip it and Tal will work from your resume.",
        manual: "Paste my LinkedIn link",
        skip: "Skip. I'll add my resume.",
      },

      /** Bold move: the email card shown right after "Yes, that's me". Pitch from /api/pitch streams into the body. */
      email: {
        label: "The intro Tal will send",
        fromLabel: "From",
        from: "Tal · Tal Select",
        toLabel: "To",
        /** `kind` is a short noun phrase for their kind of role, e.g. "an ML infrastructure role". */
        to: (kind: string) => `a founder hiring for ${kind}`,
        toFallback: "a founder hiring for a role like yours",
        subjectLabel: "Subject",
        subject: (first: string, role: string, company: string) =>
          `Intro: ${first}${role ? `, ${role}` : ""}${company ? ` at ${company}` : ""}`,
        drafting: "Tal is drafting your intro",
        draftTag: "Draft",
        note: "Tal drafted this from your LinkedIn. His team sharpens it, and it goes out only after you say yes to a role.",
        /** One sharpening question. Show `questions[0]`; the rest are alternates to rotate or A/B. */
        questions: [
          "What's the hardest thing you've shipped?",
          "What are you proudest of from the last two years?",
          "What problem would you happily spend the next three years on?",
          "What do teammates come to you for?",
        ],
        /** Shown with the question when /api/pitch returns needsMore:true. Pick by what Tal actually has. */
        needsMoreThin: "Tal only has your title so far. One line from you changes that.",
        needsMoreLinkedIn: "Tal only has your LinkedIn so far. One line from you changes that.",
        /** DEPRECATED alias of needsMoreThin; never show it once LinkedIn is confirmed. */
        needsMore: "Tal only has your title so far. One line from you changes that.",
        placeholder: "One sentence is plenty.",
        submit: "Rewrite it",
        rewriting: "Tal is rewriting it with your answer",
        rewritten: "Rewritten with your answer.",
        keep: "Looks good as is",
        error: "Tal couldn't rewrite it just now. Try once more?",
      },

      /** The resume, asked for as a reward. */
      resume: {
        title: "Want it sharper? Give Tal your resume.",
        hint: "PDF or DOCX, up to 5MB. More for Tal to work from means a better intro.",
        authLabel: "US work authorization",
        authOptional: "Optional",
        auth: [
          ["citizen", "US citizen"],
          ["green_card", "Green card"],
          ["visa_no_sponsorship", "Visa, no sponsorship needed"],
          ["needs_sponsorship", "Will need sponsorship"],
          ["outside_us", "Based outside the US"],
        ] as [string, string][],
        cta: "Represent me",
        sending: ["Saving your details", "Setting up your Tal Select profile", "Starting your six months"],
      },
      /** The quiet path for people without a resume on hand. Shown as a small text link under the drop zone. */
      noResume: {
        link: "No resume handy? Tal will work from your LinkedIn.",
        /** Use when LinkedIn was skipped, so the line stays true. */
        linkNoLinkedIn: "No resume handy? Your email is enough for now.",
        title: "Where should Tal reach you?",
        hint: "Tal emails you when a role fits. You reply yes or no.",
        emailLabel: "Email",
        emailPlaceholder: "you@example.com",
        emailMissing: "Add an email so Tal can reach you.",
        emailInvalid: "That email doesn't look right. Check for a typo?",
        cta: "Represent me",
        back: "Add a resume instead",
      },
      done: {
        title: "You're in Tal Select.",
        lead: (first: string) => `Welcome${first ? `, ${first}` : ""}. Tal takes it from here.`,
        early: "You're early. Tal's first US intros go to the first members.",
        /** The intro card on the done screen, if it is shown again there. */
        pitch: {
          label: "The intro Tal will send",
          tag: "Draft",
          loading: "Tal is drafting your intro",
          note: "Tal drafted this from your LinkedIn and title. His team sharpens it before any founder reads it.",
          /** When the API returns source:"fallback". */
          fallbackNote: "A starting point. Tal writes the real one after reading your profile.",
        },
        steps: [
          { when: "Tonight", what: "Tal reads your profile and sharpens your intro." },
          { when: "As roles come in", what: "Tal emails you the ones that fit. Each email is one role, and you reply yes or no." },
          { when: "When you say yes", what: "Nobody sees your name before then. Tal sends your intro to the founder or hiring manager and sets up the conversation." },
          { when: "For 6 months", what: "Tal keeps looking while you keep building." },
        ],
        until: (date: string) => `Tal represents you until ${date}.`,
        email: (email: string) => `Tal will write to you at ${email}.`,
        noEmail: "Tal couldn't find an email on your resume. Add one and upload again so he can reach you.",
        free: "Free for you. Companies pay when they hire.",
      },
    },

    /** Proof section 1: how it works. */
    how: {
      heading: "How Tal works",
      steps: [
        { title: "Tell Tal who you are", body: "Name, company and title. Tal finds your LinkedIn and drafts your intro on the spot." },
        { title: "Sharpen it in one line", body: "Answer one question and Tal rewrites the draft with your detail in it." },
        { title: "Tal finds the roles", body: "Tal and his team work round the clock to find roles that fit, then email them to you." },
        { title: "You say yes, then meet the boss", body: "Your name stays private until you say yes. Then Tal sets up the conversation with the founder or hiring manager." },
      ],
    },

    /** Proof section 2: the terms, stated plainly. */
    deal: {
      heading: "The deal",
      items: [
        { title: "Free for you", body: "Companies pay when they hire someone Tal introduced. You never pay." },
        { title: "Your yes, every time", body: "Tal asks before putting you forward for any role, one role at a time." },
        { title: "Six months, then you decide", body: "Representation ends on a date you can see. Want more time? Tal will ask." },
        { title: "Your data has one job", body: "Tal uses your profile and resume to represent you. Ask and we delete them." },
      ],
    },

    /** Numbers section is cut (each claim appears once, in `about.more`). Kept empty so Sections.tsx compiles until it is removed. */
    stats: [] as { value: string; label: string }[],

    /** Proof section 3: Meet Tal. The only body copy that uses the claim numbers (in `more`). */
    about: {
      heading: "Meet Tal",
      body: "An AI agent with a human team behind him. He reads every profile, finds the roles that fit, and emails them to you.",
      /** Second paragraph, smaller. */
      more: `Tal comes from a hiring network built in Bengaluru, with ${claims.network} tech professionals and ${claims.startups} AI and consumer startups. Tal Select is opening in SF now, and the first members get Tal's first US intros.`,
      /** DEPRECATED with `team`; unused. */
      teamLabel: "",
    },

    proofLine: "Bosses from these companies hire on Tal",

    faq: {
      heading: "Questions",
      items: [
        ["Who is Tal?", "The agent behind Tal Select. Tal drafts your intro, his team sharpens it, and together they pitch you to the founders and hiring managers who make the call."],
        ["How does Tal find roles?", "Tal and his team search for roles that match your experience, your level and your work authorization, and bring you only the ones that fit."],
        ["How will I hear from Tal?", "By email. When a role fits, Tal writes to you about it, and you reply yes or no."],
        ["I'm not looking. Should I join?", "That's the best time. You keep your job, and you decide on each role Tal brings you."],
        ["What does it cost?", "Nothing. Companies pay when they hire someone Tal introduced. Representation lasts six months, then Tal asks if you want more."],
        ["Will my company find out?", "Your name goes to a company only after you say yes to that specific role. Tal asks every time."],
        ["What about work authorization?", "Tell Tal your status when you join. Tal only puts you forward for roles where it works."],
        ["Who runs Tal, and what happens to my data?", "Tal is built by Grapevine (Watercooler Chat Private Limited) in Bengaluru. Your LinkedIn and resume are used to represent you, nothing else. Email support@gvine.app and we delete them."],
      ] as [string, string][],
    },

    /** Also the nav button label. Hide both after done. */
    final: {
      heading: "Your name, in front of the right founder.",
      sub: "Free. Six months. Your name goes out only with your yes.",
      cta: "Join Tal Select",
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
