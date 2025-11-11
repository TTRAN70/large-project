// src/components/GameCard.tsx
import { Link } from "react-router-dom";
import { useState } from "react";
import { type Game } from "../data/games";

type Props = {
  game: Game;
  want: boolean;
  rating: number; // 0..10 (supports halves)
  onToggleWant: (id: string) => void;
  onRate: (id: string, n: number) => void;
};

export default function GameCard({
  game,
  want,
  rating,
  onToggleWant,
  onRate,
}: Props) {
  const [imgOk, setImgOk] = useState(true);

  const accent = "#a78bfa";
  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-[rgba(30,195,255,0.25)] bg-[rgba(8,25,38,0.6)] shadow transition-shadow hover:shadow-lg"
      style={{
        boxShadow: accent
          ? `0 0 0 1px ${accent}22, 0 10px 30px ${accent}22`
          : undefined,
      }}
    >
      {/* Cover (clickable) */}
      <Link to={`/game/${encodeURIComponent(game.title)}`} className="block">
        <div className="aspect-[10/12] w-full overflow-hidden">
          {imgOk ? (
            <img
              src={game.cover_url}
              alt={game.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#0e2333] text-lg font-medium text-[#a7e9ff]">
              No image
            </div>
          )}
        </div>
      </Link>

      {/* Accent corner */}
      {accent && (
        <span
          aria-hidden
          className="absolute right-0 top-0 h-10 w-10"
          style={{
            background: `linear-gradient(135deg, transparent 50%, ${accent} 50%)`,
          }}
        />
      )}

      {/* Body */}
      <div className="space-y-3 p-4">
        {/* Title (clickable) */}
        <h3 className="line-clamp-1 text-[1.1rem] font-semibold text-white">
          <Link
            to={`/game/${encodeURIComponent(game.title)}`}
            className="hover:underline"
          >
            {game.title}
          </Link>
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-[#a7e9ff]">
          <span>{game.release_year}</span>
          <span className="rounded bg-[#1ec3ff]/15 px-2 py-0.5 text-[#a7e9ff]">
            {game.genres[0]}
          </span>
        </div>

        {/* Rating: 5 whole stars with overlay fill (0%, 50%, 100%) => total 0..10 */}
        <div
          className="mt-1 flex items-center gap-2"
          aria-label={`Rating: ${rating} out of 10`}
        >
          {[1, 2, 3, 4, 5].map((i) => {
            const base = (i - 1) * 2; // 0,2,4,6,8 (points before this star)
            const halfValue = base + 1; // 1,3,5,7,9
            const fullValue = base + 2; // 2,4,6,8,10
            // 0, .5, or 1 of this star is filled based on overall rating
            const starFill = Math.max(0, Math.min(1, (rating - base) / 2));

            const onStarClick = (e: React.MouseEvent<HTMLButtonElement>) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const leftHalf = e.clientX - rect.left < rect.width / 2;
              onRate(game._id, leftHalf ? halfValue : fullValue);
            };

            return (
              <button
                key={i}
                onClick={onStarClick}
                className="relative inline-flex h-5 w-5 items-center justify-center p-0 m-0"
                aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
                title={
                  starFill === 1
                    ? `${fullValue}/10`
                    : starFill === 0.5
                    ? `${halfValue}/10`
                    : `${base}/10`
                }
              >
                {/* base gray star */}
                <svg
                  viewBox="0 0 20 20"
                  className="absolute inset-0 h-5 w-5 text-gray-600"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.803 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.803-2.036a1 1 0 00-1.175 0L6.81 16.283c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.173 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                </svg>

                {/* yellow overlay star, clipped by width */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${starFill * 100}%` }}
                  aria-hidden
                >
                  <svg
                    viewBox="0 0 20 20"
                    className="h-5 w-5 text-yellow-300"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.803 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.803-2.036a1 1 0 00-1.175 0L6.81 16.283c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.173 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                  </svg>
                </div>
              </button>
            );
          })}
          <span className="text-sm text-[#a7e9ff]">
            {Number.isFinite(rating) ? rating.toFixed(1) : "0.0"}/10
          </span>
        </div>

        {/* CTA */}
        <div className="pt-3">
          <button
            onClick={() => onToggleWant(game._id)}
            className={`w-full rounded-lg border px-4 py-2 text-sm transition-colors ${
              want
                ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                : "border-[#1ec3ff]/40 text-[#a7e9ff] hover:bg-[#1ec3ff]/10"
            }`}
            aria-pressed={want}
            aria-label={
              want ? "Remove from Want to play" : "Add to Want to play"
            }
          >
            {want ? "In Want-to-play ✓" : "Add to Want-to-play"}
          </button>
        </div>
      </div>
    </article>
  );
}
