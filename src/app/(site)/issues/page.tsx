import Link from "next/link";
import { Container, Kicker } from "@/components/site/layout";
import { IssueCover } from "@/components/site/IssueCover";
import { InProgressIssueCard } from "@/components/site/InProgressIssueCard";
import { issuePath } from "@/lib/issues";
import { listIssueMeta, listPublishedIssues } from "@/lib/store";

export const metadata = { title: "Archive", alternates: { canonical: "/issues" } };

export default async function ArchivePage() {
  const [issues, allIssueMeta] = await Promise.all([listPublishedIssues(), listIssueMeta()]);
  const current = issues[0];
  const nextIssues = current
    ? [1, 2].map((offset) => {
        const date = new Date(Date.UTC(current.year, current.month - 1 + offset, 1));
        const id = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
        const draft = allIssueMeta.find(issue => issue.id === id && issue.status === "draft");
        return {
          id,
          label: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(date),
          volume: draft?.volume ?? current.volume,
          number: draft?.number ?? current.number + offset,
          draft,
        };
      })
    : [];

  return (
    <Container className="py-14">
      <Kicker>The journal</Kicker>
      <h1 className="mt-4 font-serif text-5xl">Archive</h1>
      <p className="mt-4 mb-12 max-w-2xl text-[var(--muted-foreground)]">
        One issue a month, two articles in each. Every issue stays free to read, and every claim is sourced to the studies behind it.
      </p>
      <section className="journal-archive">
        <div className="archive-heading">
          <h2>{current ? `Volume ${current.volume} · ${current.year}–${String(current.year+1).slice(-2)}` : "The journal"}</h2>
          <span className="font-semibold text-sm">{issues.length} published {issues.length === 1 ? "issue" : "issues"}</span>
        </div>
        <div className="archive-grid">
          {issues.map((issue, index) => (
            <div key={issue.id} className="archive-item">
              <Link href={issuePath(issue)}>
                <IssueCover issue={issue} variant="archive" current={index === 0} />
                <h3>{issue.label}</h3>
              </Link>
              <p>Vol. {issue.volume} | No. {issue.number}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{[...issue.posts, ...(issue.upcomingArticles ?? [])].map(post => post.title).join(" · ")}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs font-semibold">
                <Link href={issuePath(issue)} className="action-link">View issue ›</Link>
                <a href={`${issuePath(issue)}/download`} download>↓ PDF</a>
              </div>
            </div>
          ))}
          {nextIssues.map(issue => issue.draft ? (
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
      {!issues.length && <p>No issues published yet.</p>}
    </Container>
  );
}
