"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const home = pathname === "/";

  return (
    <header className="journal-header sticky top-0 z-50 bg-[var(--background)] print:hidden">
      <div>
        <Link
          href="/"
          className={`journal-brand ${home ? "journal-brand-home" : ""}`}
          aria-label="The Abyss home"
        >
          <Image src="/brand/abyss-logo.png" alt="" width={40} height={40} />
          {home ? (
            <span className="brand-mission">
              A science journal
              <br />
              for everyone
            </span>
          ) : (
            <span>
              <i>The</i> Abyss
            </span>
          )}
        </Link>

        <nav aria-label="Main navigation" className="items-center">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === "/issues" && pathname.startsWith("/issues/")) ||
              (item.href === "/articles" &&
                (pathname.startsWith("/articles/") || pathname.startsWith("/topics")));
            const href =
              home && item.href === "/newsletter"
                ? "#newsletter"
                : item.href;

            return (
              <Link
                key={item.href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative px-2.5 py-1 text-[14px] font-semibold tracking-[0.05em] no-underline transition-[opacity,transform] duration-150 hover:!text-inherit hover:opacity-70 focus-visible:rounded-sm ${
                  active
                    ? "after:absolute after:inset-x-2.5 after:bottom-[5px] after:h-[2px] after:bg-current"
                    : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
