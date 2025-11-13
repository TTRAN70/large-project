import { Link } from "react-router-dom";
import { useState } from "react";
import { type Game } from "../data/games";

type Props = {
  game: Game;
  want: boolean;
  onToggleWant: (id: string) => void;
  onRate: (id: string, n: number) => void;
};

export default function GameCard({ game, want, onToggleWant, onRate }: Props) {
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
          className="absolute top-0 right-0 h-10 w-10"
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
