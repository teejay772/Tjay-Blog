import type { Metadata } from "next";
import Link from "next/link";
import { Container, Kicker } from "@/components/site/layout";
import { listPublishedPosts, listTopics } from "@/lib/store";

export const metadata: Metadata = {
  title: "Articles",
  description: "Every published piece from The Abyss, newest first.",
};

function shortDate(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function ArticlesPage() {
  const [unsorted, topics] = await Promise.all([listPublishedPosts(), listTopics()]);
  // Newest first, whatever order the store returns and whichever piece is featured.
  const posts = [...unsorted].sort(
    (a, b) => Date.parse(b.publishedAt ?? "") - Date.parse(a.publishedAt ?? ""),
  );
  const topicName = Object.fromEntries(topics.map((topic) => [topic.slug, topic.name]));
  // Only topics that have at least one published article, so no link leads to an empty page.
  const usedTopics = topics
    .map((topic) => ({
      ...topic,
      count: posts.filter((post) => post.topic === topic.slug).length,
    }))
    .filter((topic) => topic.count > 0);

  return (
    <Container className="articles-index py-12 sm:py-16">
      <Kicker>The journal</Kicker>
      <h1 className="mt-3 font-serif text-4xl tracking-tight text-[var(--navy)] sm:text-6xl">
        Articles
      </h1>
      <p className="mt-4 max-w-2xl font-serif text-xl leading-normal text-muted-foreground">
        Newest first. Each piece is a test of a claim, not a recap of a trend.
      </p>

      <form action="/search" role="search" className="articles-search">
        <label htmlFor="articles-q">Search titles, summaries and full text</label>
        <div>
          <input
            id="articles-q"
            type="search"
            name="q"
            placeholder="Peptides, FDA, collagen"
          />
          <button type="submit">Search</button>
        </div>
      </form>

      {usedTopics.length > 0 && (
        <nav aria-label="Topics" className="articles-topics">
          <span>Topics</span>
          {usedTopics.map((topic) => (
            <Link key={topic.slug} href={`/topics/${topic.slug}`}>
              {topic.name} ({topic.count})
            </Link>
          ))}
        </nav>
      )}

      <div className="articles-rule" />

      {posts.length === 0 ? (
        <p className="mt-12 text-muted-foreground">No published pieces yet.</p>
      ) : (
        <ol className="articles-list">
          {posts.map((post) => (
            <li key={post.id}>
              <div className="articles-list-meta">
                <time dateTime={post.publishedAt ?? undefined}>{shortDate(post.publishedAt)}</time>
                {post.articleCode ? <span>{post.articleCode}</span> : null}
              </div>
              <div className="articles-list-body">
                <Kicker>{post.articleType || topicName[post.topic] || post.topic}</Kicker>
                <h2>
                  <Link href={`/articles/${post.slug}`}>{post.title}</Link>
                </h2>
                <p>{post.excerpt}</p>
                <p className="articles-list-footnote">
                  {topicName[post.topic] ?? post.topic} · {post.readingTime} min read
                </p>
              </div>
              <Link
                href={`/articles/${post.slug}`}
                className="articles-list-read"
                aria-label={`Read ${post.title}`}
              >
                Read ›
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Container>
  );
}
