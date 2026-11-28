import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article/ArticleBody";
import { ArticleAtAGlance } from "@/components/article/ArticleFeatures";
import { ArticleDiscussion } from "@/components/article/ArticleDiscussion";
import { articleFeatures } from "@/lib/article-features";
import { ArticleNavigation } from "@/components/article/ArticleNavigation";
import { SourceList } from "@/components/article/SourceList";
import { Container, Kicker } from "@/components/site/layout";
import { ShareActions } from "@/components/site/ShareActions";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { CITATIONS_BY_SLUG } from "@/lib/citations";
import { extractHeadings } from "@/lib/headings";
import { ARTICLE_CARD_SIZE } from "@/lib/article-card";
import { FEED_PATH, authorJsonLd, publicationUrl, site } from "@/lib/site";
import { getPostBySlug, listPostMeta, listPublishedIssues } from "@/lib/store";
import { FigureViewer } from "@/components/article/FigureViewer";
import { ContentsTracker } from "@/components/article/ContentsTracker";
import { issuePath } from "@/lib/issues";

type Props = { params: Promise<{ slug: string }> };

function shortDate(iso: string | null) {
  if (!iso) return "Unpublished";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "published" || !post.publishedAt) return {};
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  // Each article has its own link-preview image, drawn from its title.
  const card = { url: `/api/article-card/${post.slug}`, ...ARTICLE_CARD_SIZE, alt: post.title };
  return {
    title,
    description,
    authors: [{ name: post.author }],
    alternates: {
      canonical: `/articles/${post.slug}`,
      types: { "application/rss+xml": FEED_PATH },
    },
    openGraph: {
      type: "article",
      siteName: site.name,
      title,
      description,
      url: `/articles/${post.slug}`,
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: [card],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [card],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const original = await getPostBySlug(slug);
  if (!original || original.status !== "published" || !original.publishedAt) notFound();

  const [issues, allPosts] = await Promise.all([listPublishedIssues(), listPostMeta()]);
  const issue = issues.find((item) =>
    item.posts.some((post) => post.id === original.id),
  );
  // Two other published articles, newest first, for the "Read next" block.
  const readNext = allPosts
    .filter((item) => item.status === "published" && item.publishedAt && item.id !== original.id)
    .sort((a, b) => Date.parse(b.publishedAt ?? "") - Date.parse(a.publishedAt ?? ""))
    .slice(0, 2);
  const post = issue?.posts.find((item) => item.id === original.id) || original;
  const references = post.references ?? CITATIONS_BY_SLUG[slug] ?? [];
  const features = articleFeatures(post);
  const headings = extractHeadings(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    identifier: post.articleCode,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: `${publicationUrl()}/api/article-card/${slug}`,
    author: authorJsonLd(post.author),
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: publicationUrl(),
      logo: { "@type": "ImageObject", url: `${publicationUrl()}/brand/abyss-logo.png` },
    },
    mainEntityOfPage: `${publicationUrl()}/articles/${slug}`,
    isPartOf: issue
      ? {
          "@type": "PublicationIssue",
          issueNumber: issue.number,
          isPartOf: {
            "@type": "PublicationVolume",
            volumeNumber: issue.volume,
          },
        }
      : undefined,
    citation: references.map((ref) => ref.url).filter(Boolean),
  };

  return (
    <article className="journal-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Container className="article-container">
        {issue ? (
          <p className="article-breadcrumb">
            <Link href={issuePath(issue)}>
              Vol. {issue.volume} | No. {issue.number} · {issue.label}
            </Link>
          </p>
        ) : null}

        <header className="journal-article-heading">
          <Kicker>{post.articleType || "Research Article"}</Kicker>
          <h1>{post.title}</h1>
          <p className="article-deck">{post.excerpt}</p>
          <div className="article-meta-row">
            <div className="article-byline">
              <p className="article-author">{post.author}</p>
              <p>
                Published{" "}
                <time dateTime={post.publishedAt || undefined}>
                  {shortDate(post.publishedAt)}
                </time>
                {post.articleCode ? ` · ${post.articleCode}` : ""} · {post.readingTime} min read
              </p>
            </div>
            <ShareActions slug={post.slug} />
          </div>
        </header>

        <div className="journal-article-grid">
          <div className="article-reading-column">
            <details className="article-mobile-contents print:hidden">
              <summary>
                <span className="article-mobile-contents-label">
                  In this article · {headings.length}{" "}
                  {headings.length === 1 ? "section" : "sections"}
                </span>
              </summary>
              <ArticleNavigation headings={headings} hasSources={references.length > 0} />
            </details>

            <ArticleAtAGlance summary={features.atAGlance} abstract={post.abstract} />

            <ArticleBody
              content={post.content}
              citationIds={references.map((reference) => reference.id)}
              evidenceLadder={features.evidenceLadder}
            />
            <SourceList citations={references} />

            {readNext.length > 0 && (
              <section className="article-read-next print:hidden" aria-labelledby="read-next">
                <h2 id="read-next">Read next</h2>
                <ol>
                  {readNext.map((item) => (
                    <li key={item.id}>
                      <Kicker>{item.articleType || item.topic}</Kicker>
                      <h3>
                        <Link href={`/articles/${item.slug}`}>{item.title}</Link>
                      </h3>
                      <p>{item.excerpt}</p>
                      <p className="article-read-next-meta">
                        {[item.articleCode, shortDate(item.publishedAt), `${item.readingTime} min read`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </li>
                  ))}
                </ol>
                <Link href="/articles" className="article-read-next-all">
                  All articles ›
                </Link>
              </section>
            )}

            <section className="article-end-newsletter print:hidden" aria-labelledby="end-newsletter">
              <h2 id="end-newsletter">Get the next article the day it is published.</h2>
              <p>One issue a month. Two articles. Free. Unsubscribe anytime.</p>
              <SubscribeForm showLabel inverse />
            </section>

            <ArticleDiscussion articleId={post.id} />
          </div>

          <aside className="journal-article-aside print:hidden">
            <div className="article-aside-sticky flex flex-col gap-6">
              <div
                className="article-desktop-contents"
                style={{
                  maxHeight: "none",
                  overflow: "visible",
                  borderTopWidth: "4px",
                  padding: "22px 24px",
                }}
              >
                <ArticleNavigation
                  headings={headings}
                  hasSources={references.length > 0}
                  title={post.title}
                />
              </div>

              {!!issue?.upcomingArticles?.length && (
                <section className="article-coming-up px-1">
                  <Kicker>Coming up</Kicker>
                  <ul>
                    {issue.upcomingArticles.map((item) => (
                      <li key={item.articleCode}>{item.title}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="article-newsletter article-aside-newsletter" style={{ padding: "22px 24px" }}>
                <p className="mb-5 font-serif text-xl leading-[1.3] text-white">
                  Get each article the day it&apos;s published.
                </p>
                <SubscribeForm showLabel buttonLabel="Subscribe free" inverse />
              </section>
            </div>
          </aside>
        </div>
      </Container>
      <FigureViewer />
      <ContentsTracker />
    </article>
  );
}
