"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type FigureItem = { src: string; alt: string };

/**
 * Full-screen view for article figures on phones.
 *
 * Mounted once per article. Any element with `data-figure-open` inside an
 * `.article-figure` opens that figure; the viewer reads the article's figures
 * from the page so it can step to the previous and next one. A native
 * <dialog> gives Escape-to-close and keeps keyboard focus inside while open.
 */
export function FigureViewer() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [figures, setFigures] = useState<FigureItem[]>([]);
  const [index, setIndex] = useState(0);

  const open = useCallback((target: HTMLImageElement | null) => {
    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>(".article-prose .article-figure img"),
    );
    if (!images.length) return;
    setFigures(images.map((img) => ({ src: img.currentSrc || img.src, alt: img.alt })));
    setIndex(Math.max(0, target ? images.indexOf(target) : 0));
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const trigger = (event.target as Element | null)?.closest("[data-figure-open]");
      if (!trigger) return;
      event.preventDefault();
      open(trigger.closest(".article-figure")?.querySelector("img") ?? null);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  const figure = figures[index];
  const label = figure?.alt.match(/^Figure\s+\d+/i)?.[0] ?? "Figure";

  return (
    <dialog
      ref={dialogRef}
      className="figure-viewer"
      aria-label={figure ? `${label}, full screen` : "Figure, full screen"}
      onClick={(event) => {
        // A tap on the dark backdrop around the figure closes the viewer.
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      <div className="figure-viewer-bar">
        <span>
          {label.toUpperCase()} OF {figures.length}
        </span>
        <button type="button" onClick={() => dialogRef.current?.close()}>
          Close
        </button>
      </div>
      <div className="figure-viewer-stage">
        {figure ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={figure.src} alt={figure.alt} />
        ) : null}
      </div>
      <p className="figure-viewer-hint">Turn your phone sideways. Pinch to zoom.</p>
      <div className="figure-viewer-steps">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
        >
          ‹ Previous
        </button>
        <button
          type="button"
          disabled={index >= figures.length - 1}
          onClick={() => setIndex((value) => Math.min(figures.length - 1, value + 1))}
        >
          Next ›
        </button>
      </div>
    </dialog>
  );
}
