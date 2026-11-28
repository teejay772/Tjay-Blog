"use client";

import { useEffect } from "react";

/**
 * Marks the section the reader is in, in the desktop "In this article" list.
 *
 * Sets aria-current on the matching link, so screen readers hear it too and
 * the style lives in CSS. The section counts as current once its heading has
 * passed the top quarter of the screen.
 */
export function ContentsTracker() {
  useEffect(() => {
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(".article-desktop-contents a[href^='#']"),
    );
    const targets = links
      .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
      .filter((target): target is HTMLElement => Boolean(target));
    if (!targets.length) return;

    let frame = 0;
    function update() {
      frame = 0;
      const line = window.innerHeight * 0.25;
      let current: HTMLElement | null = null;
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= line) current = target;
      }
      for (const link of links) {
        const active = current !== null && link.hash === `#${current.id}`;
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
