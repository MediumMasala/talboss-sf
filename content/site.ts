/**
 * Every word on the landing page lives here.
 * Components only read from this file, so you can edit copy without touching them.
 *
 * Brand: Tal Boss (black canvas, #1c1c1e cards, SF Pro headlines, Inter body, white pill buttons).
 */

export const BRAND_NAME = "Tal Boss";

export const site = {
  name: BRAND_NAME,

  seo: {
    title: `${BRAND_NAME}: apply once, get represented in 1000+ job opportunities`,
    description: "Upload your resume and talk to SF startup founders directly. No HR, ATS, agency BS.",
    ogAlt: `${BRAND_NAME}: apply once, get represented in 1000+ job opportunities`,
  },

  funding: {
    before: "We have raised",
    amount: "$7 million",
    after: "from Sequoia.",
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

  /** Tal Select (US): the landing at "/" for US LinkedIn ads. */
  select: {
    seo: {
      title: "Tal Select: get represented for top SF and US tech roles",
      description: "Apply once. For six months, Tal Select puts you forward by name for top SF and US tech roles, to the people who hire. Free for you.",
    },
    eyebrow: "Tal Select · San Francisco",
    headline: { lead: "Apply once.", main: "We represent you for", scribble: "6 months.", tail: "" },
    sub: "Tal Select is the talent agency inside Tal's network of 300,000+ tech professionals. We put you forward, by name, for top roles in SF and across the US, and set up the conversations with the people who hire.",
    chips: ["Free for you", "Founders and hiring managers, not job boards", "Six months, every role that fits"],
    tags: { left: "THE BOSS", right: "YOU" },

    apply: {
      you: {
        title: "Start with who you are",
        hint: "We'll find your public LinkedIn profile, so you don't have to fill in a form.",
        fields: {
          name: { label: "Full name", placeholder: "Alex Chen" },
          company: { label: "Company", placeholder: "Where you work now" },
          role: { label: "Title", placeholder: "Senior Software Engineer" },
        },
        cta: "Find my LinkedIn",
        manual: "Paste my LinkedIn link instead",
        manualLabel: "LinkedIn profile link",
        manualPlaceholder: "linkedin.com/in/your-name",
        manualCta: "Use this profile",
        badUrl: "That doesn't look like a LinkedIn profile link (linkedin.com/in/…).",
        missing: "Add your full name and company.",
      },
      search: {
        lines: ["Searching LinkedIn", "Reading your profile", "Matching your experience"],
        wait: "Usually under a minute.",
        skip: "Skip this, I'll just add my resume",
      },
      confirm: {
        title: "Is this you?",
        yes: "Yes, that's me",
        no: "No, not me",
        trying: "Checking the next profile",
      },
      notFound: {
        title: "We couldn't find you on LinkedIn",
        body: "Paste your profile link, or skip it and we'll work from your resume.",
        skip: "Skip, I'll add my resume",
      },
      resume: {
        title: "Last step: your resume",
        hint: "PDF or DOCX, up to 5MB. We read it so we can pitch you well.",
        authLabel: "US work authorization",
        auth: [
          ["citizen", "US citizen"],
          ["green_card", "Green card"],
          ["visa_no_sponsorship", "Visa, no sponsorship needed"],
          ["needs_sponsorship", "Will need sponsorship"],
          ["outside_us", "Based outside the US"],
        ] as [string, string][],
        sending: ["Saving your resume", "Building your Tal Select profile", "Lining up the roles that fit"],
      },
      done: {
        title: "You're in Tal Select.",
        lead: (first: string) => `Welcome${first ? `, ${first}` : ""}. Here's what happens next.`,
        steps: [
          { when: "This week", what: "A person on our talent team reads your profile and resume. No keyword filters." },
          { when: "Next", what: "We write your Tal Select pitch: a short, specific case for you, in our words." },
          { when: "For 6 months", what: "We put you forward for top SF and US roles that fit, to the founders and hiring managers who make the call." },
          { when: "When it clicks", what: "You get an intro and a direct chat with the person hiring. You decide who to talk to." },
        ],
        until: (date: string) => `Your representation runs until ${date}.`,
        email: (email: string) => `We'll reach you at ${email}.`,
        noEmail: "We couldn't find an email on your resume. Add one and upload again so we can reach you.",
        free: "Free for you. Companies pay us when they hire.",
      },
    },

    stats: [
      { value: "300K+", label: "tech professionals in the Tal network" },
      { value: "6 months", label: "of active representation from one application" },
      { value: "1:1", label: "intros to the person hiring, not a recruiter queue" },
    ],

    compare: {
      heading: "Represented, not filtered",
      cols: ["Applying on your own", "With Tal Select"],
      rows: [
        ["Who reads you first", "A keyword filter", "A person on our talent team"],
        ["How you show up", "One resume in a pile", "By name, with a pitch written for you"],
        ["Who you talk to first", "A recruiter screen", "The founder or hiring manager"],
        ["How long it works", "One job at a time", "Every role that fits, for 6 months"],
      ] as [string, string, string][],
    },

    proofLine: "Bosses from these companies hire on Tal",

    how: {
      heading: "How it works",
      steps: [
        { title: "Tell us who you are", body: "Name, company and title. We pull your LinkedIn so there's no form." },
        { title: "Add your resume", body: "One upload finishes your application." },
        { title: "We pitch you", body: "For six months we put you forward, by name, for roles that fit." },
        { title: "Talk to the boss", body: "When a founder or hiring manager wants to meet, we set up the chat." },
      ],
    },

    faq: {
      heading: "Questions",
      items: [
        ["Who is Tal Select for?", "Engineers, product managers, designers, and data and ML people with a strong track record who want roles at top startups and tech companies in San Francisco and across the US."],
        ["What does it cost?", "Nothing. Tal Select is free for you. Companies pay us when they hire someone we introduced."],
        ["Will you send my resume anywhere without asking?", "No. We ask you before we put you forward for a specific role."],
        ["What happens after six months?", "Your representation ends. If you're still looking, we'll ask whether you want to keep going."],
        ["What about work authorization?", "Tell us your status when you apply. We only put you forward for roles where it fits."],
        ["Who is behind Tal?", "Tal is built by Grapevine (Watercooler Chat Private Limited). Our network of 300,000+ tech professionals is where Tal Select comes from."],
        ["What do you do with my data?", "We use your LinkedIn profile and resume to represent you, and nothing else. You can ask us to delete them at any time."],
      ] as [string, string][],
    },

    final: { heading: "Six months of introductions start with one application.", cta: "Apply to Tal Select" },
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
