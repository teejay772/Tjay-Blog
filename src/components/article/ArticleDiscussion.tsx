"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type DiscussionComment = {
  id: string;
  articleId: string;
  name: string;
  body: string;
  createdAt: string;
};

function displayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function initialFor(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function ArticleDiscussion({ articleId }: { articleId: string }) {
  const endpoint = useMemo(
    () => `/api/comments?articleId=${encodeURIComponent(articleId)}`,
    [articleId],
  );
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [draftName, setDraftName] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [website, setWebsite] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNote("");

    fetch(endpoint, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load comments.");
        return (await response.json()) as { comments?: DiscussionComment[] };
      })
      .then((payload) => {
        if (!cancelled) setComments(Array.isArray(payload.comments) ? payload.comments : []);
      })
      .catch(() => {
        if (!cancelled) setNote("Comments are temporarily unavailable.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draftName.trim();
    const body = draftBody.trim();
    if (!name || !body || posting) return;

    setPosting(true);
    setNote("");
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ articleId, name, body, website }),
      });
      const payload = (await response.json()) as {
        error?: string;
        comment?: DiscussionComment | null;
      };
      if (!response.ok) throw new Error(payload.error || "Could not post comment.");

      if (payload.comment) {
        setComments((current) => [...current, payload.comment as DiscussionComment]);
      }
      setDraftBody("");
      setWebsite("");
      setNote("Your comment has been published.");
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Could not post comment.");
    } finally {
      setPosting(false);
    }
  }

  const commentCountLabel = loading
    ? "Loading"
    : comments.length === 1
      ? "1 comment"
      : `${comments.length} comments`;

  return (
    <section
      id="comments"
      className="mt-16 border-t border-[#CFC6B6] pt-8 font-sans"
      aria-labelledby="discussion-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7A715F]">
            Reader discussion
          </p>
          <h2
            id="discussion-heading"
            className="mt-2 font-serif text-[30px] font-medium leading-tight text-[#0E1C3B] sm:text-[34px]"
          >
            Join the discussion
          </h2>
          <p className="mt-3 max-w-[660px] text-[14px] leading-6 text-[#565D6E]">
            Ask about the evidence, point us to a study we may have missed, or tell us what was unclear.
            Keep the discussion respectful and avoid personal medical advice.
          </p>
        </div>

        <div className="rounded-full border border-[#D8D0C2] bg-[#F8F4EC] px-3.5 py-1.5 text-xs font-medium text-[#4C5363]">
          {commentCountLabel}
        </div>
      </div>

      <form
        className="mt-7 rounded-[14px] border border-[#D8D0C2] bg-[#FBF8F1] p-5 shadow-[0_1px_0_rgba(14,28,59,0.03)] sm:p-6"
        onSubmit={submitComment}
      >
        <div className="flex items-center gap-3 border-b border-[#E1DACC] pb-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0E1C3B] font-serif text-sm font-semibold text-[#F8F4EC]">
            {draftName.trim() ? initialFor(draftName) : "•"}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0E1C3B]">Add a comment</h3>
            <p className="mt-0.5 text-xs text-[#6B7180]">No account or email required.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-5">
          <label className="grid gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#50586A] sm:max-w-[360px]">
            Display name
            <input
              type="text"
              required
              maxLength={80}
              placeholder="Your name"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              className="h-11 rounded-lg border border-[#CEC6B8] bg-white px-3.5 text-[15px] font-normal normal-case tracking-normal text-[#141A2E] outline-none transition focus:border-[#0E1C3B] focus:ring-2 focus:ring-[#0E1C3B]/10"
            />
          </label>

          <label className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            Website
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </label>

          <label className="grid gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#50586A]">
            Comment
            <textarea
              required
              rows={5}
              maxLength={4000}
              placeholder="What would you add to the discussion?"
              value={draftBody}
              onChange={(event) => setDraftBody(event.target.value)}
              className="min-h-[132px] resize-y rounded-lg border border-[#CEC6B8] bg-white px-3.5 py-3 font-serif text-[16px] font-normal leading-7 normal-case tracking-normal text-[#141A2E] outline-none transition focus:border-[#0E1C3B] focus:ring-2 focus:ring-[#0E1C3B]/10"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-[#E1DACC] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span
            className={`text-[12px] leading-5 ${
              note.startsWith("Could") || note.includes("unavailable") ? "text-[#9B2C2C]" : "text-[#6B7180]"
            }`}
            role="status"
            aria-live="polite"
          >
            {note || `${draftBody.length.toLocaleString()} / 4,000 characters`}
          </span>
          <button
            type="submit"
            disabled={posting || !draftName.trim() || !draftBody.trim()}
            className="min-h-11 rounded-none bg-[#BF3A1B] px-5 text-sm font-semibold text-white transition hover:bg-[#A3311A] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {posting ? "Publishing…" : "Publish comment"}
          </button>
        </div>
      </form>

      <div className="mt-9">
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-[14px] border border-[#DDD5C8] bg-white px-5 py-5 shadow-[0_1px_0_rgba(14,28,59,0.03)] sm:px-6"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F0EBE1] font-serif text-sm font-semibold text-[#0E1C3B]"
                    aria-hidden="true"
                  >
                    {initialFor(comment.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="font-semibold text-[#0E1C3B]">{comment.name}</span>
                      <time
                        dateTime={comment.createdAt}
                        className="text-xs text-[#777D89]"
                      >
                        {displayDate(comment.createdAt)}
                      </time>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap font-serif text-[17px] leading-7 text-[#202638]">
                      {comment.body}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : loading ? (
          <div className="rounded-[14px] border border-dashed border-[#D8D0C2] px-5 py-8 text-center text-sm text-[#6B7180]">
            Loading discussion…
          </div>
        ) : (
          <div className="rounded-[14px] border border-dashed border-[#D8D0C2] bg-[#FBF8F1]/60 px-6 py-9 text-center">
            <p className="font-serif text-xl text-[#0E1C3B]">Start the conversation</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B7180]">
              There are no comments yet. Share a question or observation about the evidence above.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
