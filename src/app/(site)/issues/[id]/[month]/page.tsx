import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Kicker } from "@/components/site/layout";
import { IssueCover } from "@/components/site/IssueCover";
import { issueCoverDescription } from "@/lib/issue-cover";
import { IssueContents } from "@/components/site/IssueContents";
import { getPublishedIssue } from "@/lib/store";
import { issuePath } from "@/lib/issues";
import { publicationUrl, site } from "@/lib/site";
type Props = { params: Promise<{ id: string; month: string }> };
async function load({ params }: Props) {
  const { id, month } = await params;
  if (!/^\d{4}$/.test(id) || !/^(0[1-9]|1[0-2])$/.test(month)) return null;
  return getPublishedIssue(`${id}-${month}`);
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const issue = await load(props);
  return issue
    ? {
        title: `${issue.label} — Vol. ${issue.volume}, No. ${issue.number}`,
        description: `${site.name}: ${issue.posts.length} articles in ${issue.label}. Read online or download the journal.`,
        alternates: { canonical: issuePath(issue) },
      }
    : {};
}
export default async function IssuePage(props: Props) {
  const issue = await load(props);
  if (!issue) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PublicationIssue",
    name: `${site.name} — ${issue.label}`,
    issueNumber: issue.number,
    datePublished: `${issue.id}-01`,
    isPartOf: {
      "@type": "PublicationVolume",
      volumeNumber: issue.volume,
      isPartOf: {
        "@type": "Periodical",
        name: site.name,
        url: publicationUrl(),
      },
    },
    hasPart: issue.posts.map((post) => ({
      "@type": "Article",
      headline: post.title,
      identifier: post.articleCode,
      url: `${publicationUrl()}/articles/${post.slug}`,
    })),
  };
  return (
    <Container className="issue-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <p className="issue-breadcrumb"><Link href="/issues">Archive</Link> / {issue.year} / Vol. {issue.volume}, No. {issue.number}</p>
      <div className="issue-page-heading">
        <h1>{issue.label}</h1>
        <p>Vol. {issue.volume} | No. {issue.number}</p>
      </div>
      <div className="current-issue">
        <div>
          <Link href={`${issuePath(issue)}/cover`} aria-label={`View full-size cover for ${issue.label}`}><IssueCover issue={issue} /></Link>
          <div className="issue-cover-links">
            <a href="#about-the-cover">About the cover &darr;</a>
            <a href={`/api/download/contents/${issue.id}`} download>Table of contents (PDF) &darr;</a>
            {issue.posts.length > 0 && <a href={`${issuePath(issue)}/download`} download className="action-button">Full issue (PDF) &darr;</a>}
          </div>
        </div>
        <div>
          <Kicker>From the editor</Kicker>
          <div className="editor-letter">
            {issue.editorLetter ? issue.editorLetter.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>Each article in this issue starts from something people are already talking about and goes back to the published research. The point of The Abyss is to sort strong evidence from early findings, plainly, with every claim traced back to its source, so that the next time one of these stories crosses your feed you know how much weight it can bear.</p>}
          </div>
          <p className="editor-byline">{issue.editorName === site.name ? "TJ" : issue.editorName}, Editor</p>
          <h2 className="table-of-contents-heading">Table of contents</h2>
          <IssueContents issue={issue} />
          <section id="about-the-cover" className="about-the-cover">
            <Kicker>About the cover</Kicker>
            <p>{issueCoverDescription(issue)}</p>
          </section>
        </div>
      </div>
    </Container>
  );
}
