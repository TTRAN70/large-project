import { useState, type FormEvent } from "react";
import { auth } from "../lib/auth.ts";

type Props = {
  hiddenSetter: Function;
  messageSetter: Function;
  game_id: string; 
};

export default function ReviewModal({
    hiddenSetter,
    messageSetter,
    game_id
}: Props) {

    const [ratingState, setRating] = useState("");
    const [bodyState, setBody] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e : FormEvent){
        e.preventDefault();

        try {
            setSubmitting(true);
            const res = await fetch(`/api/auth/review`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${auth.token?.token}`
                },
                body: JSON.stringify({ 
                    gameId: game_id,
                    rating: parseInt(ratingState),
                    body: bodyState
                 }),
            });

            const body = await res.json().catch(() => ({} as any));

            if (!res.ok) {
                throw new Error(body.error || body.message || "Invalid or expired link.");
            }
            
    } catch (err: any) {
      
    } finally {
      setSubmitting(false);
      messageSetter("Review Submitted");
      hiddenSetter(true);
    }}

   return (
    <div className="z-0 fixed inset-0">
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-[#9fdcff]" htmlFor="password">
              Number rating (1-10)
            </label>
            <input
              id="rating"
              type="rating"
              value={ratingState?.toString()}
              onChange={(e) => setRating(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#1ec3ff]/30 bg-[#020c14] px-3 py-2 text-sm text-white outline-none focus:border-[#1ec3ff] focus:ring-1 focus:ring-[#1ec3ff]"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[#9fdcff]" htmlFor="confirm">
              What are your thoughts?
            </label>
            <input
              id="body"
              value={bodyState}
              onChange={(e) => setBody(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#1ec3ff]/30 bg-[#020c14] px-3 py-2 text-sm text-white outline-none focus:border-[#1ec3ff] focus:ring-1 focus:ring-[#1ec3ff]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-lg bg-[#1ec3ff] px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-[#53d4ff] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Submit Review"}
          </button>
        </form>
    </div> 
    </div>
  );
}
