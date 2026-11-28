import type { Metadata } from "next";
import { Container, Kicker } from "@/components/site/layout";
import { SubscribeForm } from "@/components/site/SubscribeForm";

export const metadata: Metadata = {
  title: "Newsletter",
  alternates: { canonical: "/newsletter" },
  description:
    "One issue a month. Two articles. Free. Get The Abyss in your inbox when each article is published.",
};

export default function SubscribePage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <Kicker>Newsletter</Kicker>
          <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
            One issue a month.
            <br />
            Two articles. Free.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Get each article when it is published, with sources you can follow
            and evidence you can check. Read online or download the full
            journal.
          </p>
          <ul className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
            <li>No paywall. Free article and journal downloads.</li>
            <li>Unsubscribe anytime.</li>
          </ul>
        </div>
        <div className="border border-border bg-card p-6 sm:p-8 lg:col-span-6">
          <p className="font-serif text-2xl">Get the next issue</p>
          <p className="mt-2 mb-6 text-sm text-muted-foreground">
            The next piece lands here first.
          </p>
          <SubscribeForm showLabel />
        </div>
      </div>
    </Container>
  );
}
