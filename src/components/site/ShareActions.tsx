"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/site/PrintButton";

export function ShareActions({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState<string | null>(null);

  async function share() {
    setCopied(false);
    setFallback(null);
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: window.location.href });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setFallback(window.location.href);
    }
  }

  return (
    <div className="article-actions print:hidden" data-article-slug={slug}>
      <div className="flex flex-wrap gap-2">
        <PrintButton />
        <Button type="button" size="sm" className="article-share" onClick={() => void share()}>
          Share
        </Button>
      </div>
      <p role="status" className="article-copy-status">
        {copied
          ? "Article link copied to clipboard."
          : fallback
            ? "Select and copy the article link below to share it."
            : ""}
      </p>
      {fallback && (
        <input
          className="article-copy-fallback"
          aria-label="Article link to share"
          readOnly
          value={fallback}
          onFocus={(event) => event.currentTarget.select()}
        />
      )}
    </div>
  );
}
