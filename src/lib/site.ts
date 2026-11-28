export const site = {
  name: "The Abyss",
  tagline: "Below the headlines, into the evidence.",
  description:
    "A science journal for everyone. Monthly issues, evidence-led articles, and free journal downloads. Below the headlines, into the evidence.",
  supportingDescription: "A science journal for everyone",
  correctionsEmail: "corrections.theabyss@gmail.com",
};

/**
 * Who writes the journal, as search engines should know them.
 * Used in each article's structured data (schema.org Person).
 * Empty fields are simply left out.
 */
export const authorProfile = {
  /** The name printed on articles. Must match the article's author field. */
  byline: "TJ",
  fullName: "Nimasha Thejani Ganegoda Gei",
  jobTitle: "Researcher",
  affiliation: "Northeastern University",
  profiles: ["https://www.linkedin.com/in/nimasha-thejani"] as string[],
};

export const FEED_PATH = "/feed.xml";

export const nav = [
  { href: "/current-issue", label: "Current issue" },
  { href: "/articles", label: "Articles" },
  { href: "/issues", label: "Archive" },
  { href: "/about", label: "About" },
  { href: "/newsletter", label: "Newsletter" },
  { href: "/search", label: "Search" },
];

export function publicationUrl() {
  return (process.env.SITE_URL || "https://theabyssos.com").replace(/\/$/, "");
}

/** schema.org author for an article byline: the journal, the named author, or a plain person. */
export function authorJsonLd(byline: string) {
  if (byline === site.name) {
    return { "@type": "Organization", name: site.name, url: publicationUrl() };
  }
  if (byline !== authorProfile.byline) {
    return { "@type": "Person", name: byline };
  }
  const { fullName, jobTitle, affiliation, profiles } = authorProfile;
  return {
    "@type": "Person",
    name: fullName || byline,
    ...(fullName && fullName !== byline ? { alternateName: byline } : {}),
    url: `${publicationUrl()}/about`,
    ...(jobTitle ? { jobTitle } : {}),
    ...(affiliation ? { affiliation: { "@type": "Organization", name: affiliation } } : {}),
    ...(profiles.length ? { sameAs: profiles } : {}),
  };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(iso: string | null) {
  if (!iso) return "Unpublished";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function readingTimeFrom(content: string) {
  const text = content
    .replace(/:::chart[\s\S]*?:::/g, "")
    .replace(/[#>*_`[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 220));
}
