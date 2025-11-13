import { useState, type FormEvent } from "react";
import { auth } from "../lib/auth";

type Props = {
  hiddenSetter: (v: boolean) => void; // close the modal when true
  messageSetter: (msg: string) => void; // toast/message on parent
  game_id: string;
  onReviewSubmitted: () => void;
};

export default function ReviewModal({
  hiddenSetter,
  messageSetter,
  game_id,
  onReviewSubmitted,
}: Props) {
  const [ratingState, setRating] = useState<number | "">("");
  const [bodyState, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (ratingState === "" || ratingState < 1 || ratingState > 10) {
      messageSetter("Please provide a rating from 1–10.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/auth/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token?.token ?? ""}`,
        },
        body: JSON.stringify({
          gameId: game_id,
          rating: Number(ratingState),
          body: bodyState,
        }),
      });

      const body = await res.json().catch(() => ({}) as any);
      if (!res.ok) {
        throw new Error(
          body.error || body.message || "Failed to submit review.",
        );
      }

      messageSetter("Review submitted!");
      onReviewSubmitted(); // notify parent
      hiddenSetter(true); // close modal
    } catch (err: any) {
      messageSetter(err?.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden
        onClick={() => hiddenSetter(true)}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#1ec3ff]/30 bg-[#071621] p-5 shadow-lg">
        <h2 className="mb-3 text-lg font-semibold text-white">
          Write a review
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#9fdcff]" htmlFor="rating">
              Number rating (1–10)
            </label>
            <input
              id="rating"
              type="number"
              min={1}
              max={10}
              step={1}
              value={ratingState}
              onChange={(e) =>
                setRating(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="mt-2 w-full rounded-lg border border-[#1ec3ff]/30 bg-[#020c14] px-3 py-2 text-sm text-white outline-none focus:border-[#1ec3ff] focus:ring-1 focus:ring-[#1ec3ff]"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[#9fdcff]" htmlFor="body">
              What are your thoughts?
            </label>
            <textarea
              id="body"
              rows={4}
              value={bodyState}
              onChange={(e) => setBody(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#1ec3ff]/30 bg-[#020c14] px-3 py-2 text-sm text-white outline-none focus:border-[#1ec3ff] focus:ring-1 focus:ring-[#1ec3ff]"
              placeholder="Share a quick review…"
              required
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#1ec3ff] px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-[#53d4ff] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Saving…" : "Submit review"}
            </button>

            <button
              type="button"
              onClick={() => hiddenSetter(true)} // <-- fix: just close
              className="rounded-lg border border-[#1ec3ff]/40 px-4 py-2 text-sm text-[#a7e9ff] hover:bg-[#1ec3ff]/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
