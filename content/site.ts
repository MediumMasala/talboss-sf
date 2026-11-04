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
    title: `${BRAND_NAME}: apply in 60 seconds, get represented in 100+ companies`,
    description: "Upload your resume and talk to SF hiring managers directly. No HR, ATS, agency BS.",
    ogAlt: `${BRAND_NAME}: apply in 60 seconds, get represented in 100+ companies`,
  },

  funding: {
    before: "We have raised",
    amount: "$7 million",
    after: "from Top VCs.",
  },

  hero: {
    /** lead / main / scribble (underlined) / tail. */
    headline: { lead: "Apply in 60 seconds.", main: "Get represented in", scribble: "100+", tail: "companies." },
    trust: "We won't spam you.",
    /** Pill tags on the two hands. */
    tags: { left: "HIRING MANAGER", right: "YOU" },
  },

  /** The light, idle.space-style home page (the old dark page lives at /dark). */
  light: {
    nav: { badge: "SAN FRANCISCO" },
    /** The line under the headline. */
    sub: "Upload your resume and be part of 300,000 top candidates.",
    /** The bottom bar's button on phones, short so "Apply in 60 seconds." fits beside it. */
    stickyButtonShort: "Upload resume",
    /** The one line under the upload button. */
    hint: "PDF or DOCX · We won't spam you.",
    stickers: ["NO ATS", "NO AGENCY BS", "SF STARTUPS"],
  },

  howItWorks: {
    heading: "How it works",
    steps: [
      { title: "Upload your resume" },
      { title: "Our AI matches you with a hiring manager" },
      { title: "Intro chat with the hiring manager" },
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
      lines: ["Reading your resume", "Finding SF startups that fit", "Lining up hiring managers who'd want to talk"],
      waiting: "Almost there",
    },

    done: {
      title: "You're in.",
      body: "We will get back to you on this soon.",
      noEmail: "One thing: we couldn't find an email on your resume. Add it and upload again so hiring managers can reach you.",
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

  /** Runs under Grapevine's policies (Watercooler Chat Private Limited). /privacy and /terms redirect here. */
  legal: {
    privacyUrl: "https://www.grapevine.in/privacy",
    termsUrl: "https://www.grapevine.in/terms",
    supportEmail: "support@gvine.app",
    company: "Watercooler Chat Private Limited",
  },

};

export type Site = typeof site;
