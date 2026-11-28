import Link from "next/link";
import { Container } from "@/components/site/layout";
import { IssueCover } from "@/components/site/IssueCover";
import { IssueContents } from "@/components/site/IssueContents";
import { InProgressIssueCard } from "@/components/site/InProgressIssueCard";
import { JournalNewsletter } from "@/components/site/JournalNewsletter";
import { issuePath } from "@/lib/issues";
import { FEED_PATH, site } from "@/lib/site";
import { listIssueMeta, listPublishedIssues } from "@/lib/store";

export const metadata = {
  alternates: { canonical: "/", types: { "application/rss+xml": FEED_PATH } },
};

export default async function HomePage() {
  const [issues, issueMetadata] = await Promise.all([listPublishedIssues(), listIssueMeta()]);
  const latestIssue = issues[0];

  // The newest published issue is the homepage feature; earlier issues remain in the archive.
  const featuredIssue = latestIssue;

  const archiveIssues = [...issues];
  const nextIssues = latestIssue
    ? [1, 2].map((offset) => {
        const date = new Date(Date.UTC(latestIssue.year, latestIssue.month - 1 + offset, 1));
        const id = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
        const draft = issueMetadata.find((issue) => issue.id === id && issue.status === "draft");
        return {
          id,
          label: new Intl.DateTimeFormat("en-US", {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          }).format(date),
          volume: draft?.volume ?? latestIssue.volume,
          number: draft?.number ?? latestIssue.number + offset,
          draft,
        };
      })
    : [];

  return (
    <>
      <Container className="home-editorial">
        <section className="journal-masthead">
          <h1><i>The</i> Abyss</h1>
          <p>{site.tagline}</p>
        </section>

        {featuredIssue ? (
          <section className="current-issue" aria-labelledby="home-articles-heading">
            <div>
              <Link
                href={issuePath(featuredIssue)}
                aria-label={`View Volume ${featuredIssue.volume}, Number ${featuredIssue.number}, ${featuredIssue.label}`}
                className="block text-[var(--foreground)] hover:!text-[var(--foreground)]"
              >
                <IssueCover issue={featuredIssue} />
              </Link>
            </div>

            <div>
              <div className="current-issue-meta">
                <span className="issue-badge">Current issue</span>
                <span>Vol. {featuredIssue.volume} | No. {featuredIssue.number} · {featuredIssue.label}</span>
                <span className="font-semibold text-[var(--brand)]">
                  {issues.length} published {issues.length === 1 ? "issue" : "issues"}
                </span>
              </div>

              <h2 id="home-articles-heading" className="issue-contents-heading">In this issue</h2>
              <IssueContents issue={featuredIssue} compact />

              <div className="issue-home-actions">
                <Link href={issuePath(featuredIssue)} className="action-button">
                  View the full issue ›
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="py-16">
            <p>The next issue is on its way. Subscribe to hear when it is published.</p>
          </section>
        )}

        <section id="archive" className="journal-archive" aria-labelledby="home-archive-heading">
          <div className="archive-heading">
            <h2 id="home-archive-heading">
              {latestIssue ? `Volume ${latestIssue.volume} · ${archiveIssues[0]?.year}–${String(latestIssue.year + 1).slice(-2)}` : "The journal archive"}
            </h2>
            <Link href="/issues">Browse archive →</Link>
          </div>

          <div className="archive-grid">
            {archiveIssues.map((issue) => (
              <div key={issue.id} className="archive-item">
                <Link
                  href={issuePath(issue)}
                  className="block text-[var(--foreground)] hover:!text-[var(--foreground)]"
                  aria-label={`Read ${issue.label}, Volume ${issue.volume}, Number ${issue.number}`}
                >
                  <IssueCover issue={issue} variant="archive" current={issue.id === latestIssue?.id} />
                  <h3>{issue.label}</h3>
                </Link>
                <p>Vol. {issue.volume} | No. {issue.number}</p>
              </div>
            ))}

            {nextIssues.map((issue) => issue.draft ? (
              <InProgressIssueCard key={issue.id} issue={issue.draft} />
            ) : (
              <div key={issue.id} className="archive-item archive-upcoming">
                <div className="upcoming-cover" aria-label={`${issue.label} upcoming`}>Upcoming</div>
                <h3>{issue.label}</h3>
                <p>Vol. {issue.volume} | No. {issue.number}</p>
              </div>
            ))}
          </div>
        </section>
      </Container>
      <JournalNewsletter />
    </>
  );
}
