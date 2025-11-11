import {useEffect, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { type Game } from "../data/games.ts"

const WANT_KEY = "gb_want";
const RATE_KEY = "gb_ratings";


export default function GameDetails() {
  const { title } = useParams<{ title: string }>();
  const nav = useNavigate();
  const [game, setGame] = useState<Game | null>(null);

  async function queryGame(){
     const res : Game[] = await fetch (`/api/auth/game?title=${title}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      if(res.ok)
        return res.json();
    });
    
    setGame(res[0]);
  }

  useEffect(() => {
    queryGame();
  }, []);

  const gid = game ? game._id : 0;

  // localStorage state
  const [want, setWant] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(WANT_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem(RATE_KEY) || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(WANT_KEY, JSON.stringify(want));
  }, [want]);
  useEffect(() => {
    localStorage.setItem(RATE_KEY, JSON.stringify(ratings));
  }, [ratings]);

  const rating = ratings[gid] || 0;

  function toggleWant() {
    setWant((w) => ({ ...w, [gid]: !w[gid] }));
  }
  function rate(n: number) {
    setRatings((r) => ({ ...r, [gid]: n }));
  }
  

  if (!game) {
    return (
      <section className="mx-auto max-w-6xl">
        <button
          onClick={() => nav(-1)}
          className="mb-5 rounded-lg border border-[#1ec3ff]/40 px-4 py-2 text-base text-[#a7e9ff] hover:bg-[#1ec3ff]/10"
        >
          ← Back
        </button>
        <div className="rounded-2xl border border-[#1ec3ff]/25 bg-white/5 p-8">
          <h1 className="text-2xl font-semibold text-white">Game not found</h1>
          <p className="text-gray-300">We couldn’t find that game.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[340px,1fr]">
      <button
        onClick={() => nav(-1)}
        className="md:col-span-2 -mb-2 w-max rounded-lg border border-[#1ec3ff]/40 px-4 py-2 text-base text-[#a7e9ff] hover:bg-[#1ec3ff]/10"
      >
        ← Back
      </button>

      {/* Cover (bigger) */}
      <div className="overflow-hidden rounded-2xl border border-[rgba(30,195,255,0.25)] bg-[rgba(8,25,38,0.6)]">
        <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover" />
      </div>

      {/* Details (bigger fonts + spacing) */}
      <div className="space-y-5 rounded-2xl border border-[#1ec3ff]/25 bg-white/5 p-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-white">{game.title} ({game.release_year})</h1>
          <div className="flex items-center gap-3 text-base text-[#a7e9ff]">
            {game.genres.map( el => (
              <span key={1} className="rounded bg-[#1ec3ff]/15 px-2.5 py-1"> {el}</span>
            ))}
          </div>
        </header>

        {/* Rating */}
        <div className="flex items-center gap-3">
          <StarRating value={rating} onChange={rate} size="lg" />
          <span className="text-base text-[#a7e9ff]">{rating.toFixed(1)}/10</span>
        </div>

        <div className="pt-1">
          <button
            onClick={toggleWant}
            className={`w-full rounded-lg border px-5 py-2.5 text-base transition-colors ${
              want[gid]
                ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                : "border-[#1ec3ff]/40 text-[#a7e9ff] hover:bg-[#1ec3ff]/10"
            }`}
            aria-pressed={!!want[gid]}
          >
            {want[gid] ? "In Want-to-play ✓" : "Add to Want-to-play"}
          </button>
        </div>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-white">About</h2>
          <p className="font-semibold text-gray-300">
            Developed By: {game.main_developer}
          </p>
          <p className="font-semibold text-gray-300">
            Published By: {game.publisher}
          </p>
          <p className="text-gray-300">
            {game.description}
          </p>
          <p className="font-semibold text-gray-300">
            Platforms:
          </p>
          <ul className="flex flex-row">
            {game.platforms.map( el => (
              <li key={1} className="text-gray-300 px-1"> {el} </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}

/** Whole-star renderer with half support (0..10 total). */
function StarRating({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  size?: "md" | "lg";
}) {
  const dim = size === "lg" ? 24 : 20; // px
  const cls = size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <div className="flex items-center" aria-label={`Rating: ${value} out of 10`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const base = (i - 1) * 2; // 0,2,4,6,8
        const halfValue = base + 1;
        const fullValue = base + 2;
        const starFill = Math.max(0, Math.min(1, (value - base) / 2)); // 0, .5, 1

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const left = e.clientX - rect.left < rect.width / 2;
          onChange(left ? halfValue : fullValue);
        };

        return (
          <button
            key={i}
            onClick={handleClick}
            className={`relative inline-flex ${cls} items-center justify-center p-0 m-0`}
            aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
            title={
              starFill === 1
                ? `${fullValue}/10`
                : starFill === 0.5
                ? `${halfValue}/10`
                : `${base}/10`
            }
            style={{ width: dim, height: dim }}
          >
            <svg viewBox="0 0 20 20" className={`absolute inset-0 ${cls} text-gray-600`} fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.803 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.803-2.036a1 1 0 00-1.175 0L6.81 16.283c-.785.57-1.84-.197-1.54-1.118l-1.07-3.292a1 1 0 00-.364-1.118L3.173 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
            </svg>
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${starFill * 100}%` }}
              aria-hidden
            >
              <svg viewBox="0 0 20 20" className={`${cls} text-yellow-300`} fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.803 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.803-2.036a1 1 0 00-1.175 0L6.81 16.283c-.785.57-1.84-.197-1.54-1.118l-1.07-3.292a1 1 0 00-.364-1.118L3.173 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
}
