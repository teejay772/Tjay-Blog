import Link from "next/link";
import { Container, Kicker } from "@/components/site/layout";
import { site } from "@/lib/site";

export const metadata = { title: "Editorial standards" };
export default function EditorialStandardsPage() {
  return (
    <Container className="publication-page">
      <Kicker>About The Abyss</Kicker>
      <h1>Editorial standards</h1>
      <p className="publication-deck">How articles in The Abyss are sourced, checked and corrected.</p>
      <div className="publication-copy">
        <p>The Abyss explains published research to general readers. We do not conduct original research, and nothing we publish is medical advice. Every factual claim in an article is tied to a peer-reviewed study, a regulatory document, or a named expert, and each article closes with a numbered, linked reference list so readers can check the source themselves. Before publication, each article is checked line by line against its sources by a second reader. When we get something wrong, we correct it in place, add a dated note to the article, and record it on our <Link href="/corrections">Corrections</Link> page; readers can report an error at <a href={`mailto:${site.correctionsEmail}`}>{site.correctionsEmail}</a>.</p>
      </div>
    </Container>
  );
}
