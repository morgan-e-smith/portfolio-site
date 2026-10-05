// Site-wide settings. Morgan: fill in the empty values below; anything left
// empty is hidden or disabled on the site rather than guessed.

export const site = {
  name: "Morgan Smith",
  title: "AI and Marketing Transformation Manager",

  // Contact links. Empty string = the button shows as disabled.
  // The email address is never written into the page or the repository as plain text.
  // It is stored reversed and base64-encoded, and only decoded when someone clicks the button.
  // To switch addresses, encode the new one: node -e 'console.log(Buffer.from([...ADDRESS].reverse().join("")).toString("base64"))'
  emailEncoded: "bW9jLmxpYW1nQDI0bmFncm9tLmh0aW1z",
  linkedin: "https://www.linkedin.com/in/morganelizabethsmith/",
  github: "https://github.com/morgan-e-smith/portfolio-site",

  // Web resume PDF (no phone number). Put the file in /public and set the path,
  // e.g. "/morgan-smith-resume.pdf". Empty = resume buttons link to /resume.
  resumePdf: "/morgan-smith-resume.pdf",

  // Headshot for About. Put the file in /public and set the path. Empty = placeholder.
  photo: "",

  // The "Ask my portfolio" assistant (build step 5). Off until it is built and
  // its test set passes. On Vercel, set PUBLIC_ASSISTANT_ENABLED=true to turn it on.
  assistantEnabled: import.meta.env.PUBLIC_ASSISTANT_ENABLED === "true",
};

// Held and draft pages are built for local and preview review but never appear
// on the production site. Vercel sets VERCEL_ENV automatically.
export const showDrafts = import.meta.env.DEV || process.env.VERCEL_ENV === "preview" || process.env.SHOW_DRAFTS === "true";

export const nav = [
  { label: "Work", href: "/work" },
  { label: "How I work", href: "/how-i-work" },
  { label: "Writing", href: "/writing" },
  { label: "About", href: "/about" },
  { label: "Resume", href: "/resume" },
];

export const resumeHref = () => site.resumePdf || "/resume";
