import type { Metadata } from "next";
import { Container, Kicker } from "@/components/site/layout";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "About", description: site.description };

export default function AboutPage() {
  return (
    <Container className="publication-page">
      <Kicker>About The Abyss</Kicker>
      <h1>Below the headlines, into the evidence.</h1>
      <p className="publication-deck">A science journal for everyone.</p>
      <div className="publication-copy">
        <p>The Abyss is written and edited by TJ, a graduate research student who is passionate about science and the way it shapes the world, and who sees every day how claims spread on social media without facts and without anyone checking the studies behind them. For people who do want to fact-check, the scientific papers themselves are not easy for a general audience to read or understand. The Abyss exists to close that gap.</p>
        <p>Each article takes a topic people are already talking about and goes back to the source: what was actually tested, in whom, against what, and what the authors themselves said the result does and does not show. The writing is for a general reader. No background in science is assumed, and every term that needs explaining is explained.</p>
        <p>The aim is not to tell anyone what to do. It is to make sure that when you decide whether to buy, try or ignore something, you are deciding on the evidence rather than the marketing. Nothing here is medical advice; the references at the end of every article are there so you can check the work.</p>
      </div>
    </Container>
  );
}
