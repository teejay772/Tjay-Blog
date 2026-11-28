import {
  EVIDENCE_STAGES,
  type AbstractSection,
  type AtAGlance,
  type EvidenceLadder as Ladder,
} from "@/lib/types";

export function ArticleAtAGlance({
  summary,
  abstract,
}: {
  summary?: AtAGlance | null;
  abstract?: AbstractSection[] | null;
}) {
  if (!summary && !abstract?.length) return null;
  const sections = abstract?.length
    ? abstract
    : summary
      ? [
          { label: "What we know", text: summary.known },
          { label: "What we don’t know", text: summary.unknown },
          { label: "What to watch", text: summary.watch },
        ]
      : [];

  return (
    <section
      className={`article-glance${abstract?.length ? " article-abstract" : ""}`}
      aria-label="At a glance"
      style={{ margin: 0, padding: "24px 28px" }}
    >
      <p className="journal-kicker uppercase">At a glance</p>
      <dl
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginTop: "14px",
        }}
      >
        {sections.map((section, index) => (
          <div key={index} style={{ display: "block" }}>
            <dt
              style={{
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: 1.55,
                color: "#0E1C3B",
              }}
            >
              {section.label}
            </dt>
            <dd
              style={{
                marginTop: "4px",
                fontSize: "16px",
                lineHeight: 1.55,
                color: "#4A5163",
              }}
            >
              {section.text}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function EvidenceLadder({ ladder }: { ladder: Ladder }) {
  return (
    <figure
      className="article-evidence"
      aria-label={`The evidence ladder: ${ladder.subject}`}
    >
      <p className="journal-kicker uppercase">The evidence ladder</p>
      <p className="evidence-subject">{ladder.subject}</p>
      <ol className="evidence-steps">
        {EVIDENCE_STAGES.map((stage, index) => (
          <li
            key={stage}
            className={stage === ladder.stage ? "is-highlighted" : undefined}
          >
            <span
              className="evidence-bar"
              style={{ height: `${38 + index * 22}px` }}
              aria-hidden="true"
            />
            <span className="evidence-label">{stage}</span>
            {stage === ladder.stage && (
              <span className="evidence-marker">Main evidence</span>
            )}
          </li>
        ))}
      </ol>
      <figcaption>{ladder.caption}</figcaption>
      <p className="evidence-note">
        Study design and quality matter at every stage. Regulatory approval is a
        separate assessment for a specific use.
      </p>
    </figure>
  );
}
