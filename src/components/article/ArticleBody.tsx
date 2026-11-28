"use client";

import type { Components } from "react-markdown";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChartBlock } from "@/components/article/ChartBlock";
import { splitContent } from "@/lib/content";
import { extractHeadings } from "@/lib/headings";
import { remarkArticle } from "@/lib/article-markdown";
import { EvidenceLadder } from "@/components/article/ArticleFeatures";
import { evidencePlacement } from "@/lib/article-features";
import type { EvidenceLadder as Ladder } from "@/lib/types";

const components: Components = {
  h1: ({ children }) => <h2 className="article-section-heading">{children}</h2>,
  h2: ({ children, node }) => (
    <h2
      id={node?.properties.id as string | undefined}
      className="article-section-heading"
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="article-subheading">{children}</h3>
  ),
  p: ({ children, node }) => {
    const hasImage = node?.children?.some(
      (child) => child.type === "element" && child.tagName === "img",
    );
    if (hasImage) return <>{children}</>;
    return <p className="article-paragraph">{children}</p>;
  },
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="font-serif italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="my-12 border-l-[3px] border-brand pl-6 font-serif text-[1.45rem] leading-snug text-foreground [&>p]:my-0 [&>p]:text-[1.45rem] [&>p]:leading-snug">
      {children}
    </blockquote>
  ),
  img: ({ src, alt, title }) =>
    typeof src === "string" ? (
      <figure className="article-figure">
        <span className="block overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || ""}
            className="mx-auto block h-auto w-full object-contain"
            loading="lazy"
            decoding="async"
          />
        </span>
        {title || alt ? (
          <figcaption className="mt-4 text-sm leading-[1.55] text-muted-foreground">
            {alt ? (
              <span className="font-semibold text-foreground">{alt}</span>
            ) : null}
            {alt && title ? " " : null}
            {title || (!alt ? alt : null)}
          </figcaption>
        ) : null}
        {/* Shown on phones only (reader.css); FigureViewer handles the click. */}
        <button type="button" className="article-figure-open" data-figure-open>
          View full screen ›
        </button>
      </figure>
    ) : null,
  ol: ({ children }) => <ol className="article-list list-decimal">{children}</ol>,
  ul: ({ children }) => <ul className="article-list list-disc">{children}</ul>,
  li: ({ children }) => <li className="pl-1">{children}</li>,
  a: ({ href, children }) => {
    const isCitation = Boolean(href?.startsWith("#ref-"));
    if (isCitation) {
      return (
        <sup className="citation ml-0.5">
          <a
            href={href}
            aria-label={`Reference ${String(children)}`}
            className="font-sans text-[0.7em] font-semibold text-brand no-underline hover:underline"
          >
            [{children}]
          </a>
        </sup>
      );
    }
    return (
      <a
        href={href}
        className="underline decoration-brand/40 underline-offset-4 hover:decoration-brand"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  },
  table: ({ children }) => (
    <div
      className="article-table-scroll"
      role="region"
      aria-label="Article table"
      tabIndex={0}
    >
      <table className="article-table">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-border text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-3 font-medium first:pl-0">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-t border-border px-3 py-3 align-top leading-6 first:pl-0">
      {children}
    </td>
  ),
  pre: ({ children }) => <pre className="article-code">{children}</pre>,
  hr: () => <hr className="my-10 border-border" />,
};

export function ArticleBody({
  content,
  citationIds = [],
  evidenceLadder,
}: {
  content: string;
  citationIds?: number[];
  evidenceLadder?: Ladder | null;
}) {
  const placement = evidencePlacement(content, evidenceLadder);
  const bodyComponents: Components = {
    ...components,
    h2: ({ children, node }) => (
      <>
        {evidenceLadder && placement.before === node?.properties.id && (
          <EvidenceLadder ladder={evidenceLadder} />
        )}
        <h2
          id={node?.properties.id as string | undefined}
          className="article-section-heading"
        >
          {children}
        </h2>
      </>
    ),
  };
  const headingIds = extractHeadings(content).map((heading) => heading.id);
  const contentBlocks = splitContent(content);
  const headingOffsets = contentBlocks.reduce<number[]>(
    (offsets, block) => [
      ...offsets,
      offsets[offsets.length - 1] +
        (block.type === "markdown" ? extractHeadings(block.content).length : 0),
    ],
    [0],
  );
  const blocks = contentBlocks.map((block, index) => {
    if (block.type === "chart") return { ...block, headingIds: [] };
    return {
      ...block,
      headingIds: headingIds.slice(
        headingOffsets[index],
        headingOffsets[index + 1],
      ),
    };
  });

  return (
    <div className="article-prose">
      {evidenceLadder && placement.start && (
        <EvidenceLadder ladder={evidenceLadder} />
      )}
      {blocks.map((block, index) =>
        block.type === "chart" ? (
          <ChartBlock key={`chart-${index}`} spec={block.spec} />
        ) : (
          <Markdown
            key={`md-${index}`}
            remarkPlugins={[
              remarkGfm,
              [remarkArticle, { headingIds: block.headingIds, citationIds }],
            ]}
            components={bodyComponents}
          >
            {block.content}
          </Markdown>
        ),
      )}
      {evidenceLadder && placement.end && (
        <EvidenceLadder ladder={evidenceLadder} />
      )}
    </div>
  );
}
