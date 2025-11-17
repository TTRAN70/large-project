import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { type Game } from "../data/games";
import { type User } from "../data/users";
import ReviewModal from "../components/ReviewModal";
import ReviewCard from "../components/ReviewCard";
import { auth } from "../lib/auth";

const WANT_KEY = "gb_want";

type Review = {
  _id: string;
  user: User;
  game: string;
  rating: number;
  body: string;
  createdAt: string; // API returns ISO strings
  updatedAt: string;
};

export default function GameDetails() {
  const { title } = useParams<{ title: string }>();
  const nav = useNavigate();
  const currentUserToken = auth.token?.token;

  const [game, setGame] = useState<Game | null>(null);
  const [hiddenState, setHiddenState] = useState(true);
  const [messageState, setMessageState] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingGame, setIsLoadingGame] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const queryGame = useCallback(async () => {
    if (!title) {
      setIsLoadingGame(false);
      return;
    }

    setIsLoadingGame(true);
    try {
      const res = await fetch(
        `/api/auth/game?title=${encodeURIComponent(title)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!res.ok) {
        setGame(null);
        return;
      }
      const data: Game[] = await res.json();
      setGame(data?.[0] ?? null);
    } catch (error) {
      console.error("Error fetching game:", error);
      setGame(null);
    } finally {
      setIsLoadingGame(false);
    }
  }, [title]);

  const queryReviews = useCallback(async () => {
    if (!game?._id) return;

    setIsLoadingReviews(true);
    try {
      const res = await fetch(`/api/auth/review/${game._id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        setReviews([]);
        return;
      }
      const data: Review[] = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [game?._id]);

  useEffect(() => {
    queryGame();
  }, [queryGame]);

  useEffect(() => {
    if (game?._id) {
      queryReviews();
    }
  }, [game?._id, queryReviews]);

  const gid = game?._id ?? "0"; // use string key

  const [want, setWant] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(WANT_KEY) || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(WANT_KEY, JSON.stringify(want));
  }, [want]);

  async function toggleWant() {
    if (!currentUserToken || !game?._id) return;

    const newWantState = !want[gid];

    try {
      if (newWantState) {
        // Adding to want-to-play
        await fetch(`/api/auth/watch/${game._id.trim()}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentUserToken}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        // Removing from want-to-play
        await fetch(`/api/auth/watch/${game._id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${currentUserToken}`,
            "Content-Type": "application/json",
          },
        });
      }
      // Update local state after successful API call
      setWant((w) => ({ ...w, [gid]: newWantState }));
    } catch (error) {
      console.error("Error toggling want:", error);
    }
  }

  // Callback to refresh reviews after posting a new one
  const handleReviewSubmitted = useCallback(() => {
    queryReviews();
  }, [queryReviews]);

  if (isLoadingGame) {
    return (
      <section className="mx-auto max-w-6xl">
        <button
          onClick={() => nav(-1)}
          className="mb-5 rounded-lg border border-[#1ec3ff]/40 px-4 py-2 text-base text-[#a7e9ff] hover:bg-[#1ec3ff]/10"
        >
          ← Back
        </button>
        <div className="rounded-2xl border border-[#1ec3ff]/25 bg-white/5 p-8">
          <p className="text-gray-300">Loading game details...</p>
        </div>
      </section>
    );
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
          <p className="text-gray-300">We couldn't find that game.</p>
        </div>
      </section>
    );
  }

  if (hiddenState) {
    return (
      <section className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[340px,1fr]">
        <button
          onClick={() => nav(-1)}
          className="-mb-2 w-max rounded-lg border border-[#1ec3ff]/40 px-4 py-2 text-base text-[#a7e9ff] hover:bg-[#1ec3ff]/10 md:col-span-2"
        >
          ← Back
        </button>

        {/* Cover */}
        <div className="overflow-hidden rounded-2xl border border-[rgba(30,195,255,0.25)] bg-[rgba(8,25,38,0.6)]">
          <img
            src={game.cover_url}
            alt={game.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="space-y-5 rounded-2xl border border-[#1ec3ff]/25 bg-white/5 p-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-white">
              {game.title} ({game.release_year})
            </h1>
            <div className="flex items-center gap-3 text-base text-[#a7e9ff]">
              {game.genres?.map((el) => (
                <span key={el} className="rounded bg-[#1ec3ff]/15 px-2.5 py-1">
                  {el}
                </span>
              ))}
            </div>
          </header>

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
            <p className="text-gray-300">{game.description}</p>
            <p className="font-semibold text-gray-300">Platforms:</p>
            <ul className="flex flex-row">
              {game.platforms?.map((el) => (
                <li key={el} className="px-1 text-gray-300">
                  {el}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {messageState === "" ? (
          <button
            className="mt-10 rounded-lg border border-[#1ec3ff]/40 px-3 py-1.5 text-[#a7e9ff] hover:bg-[#1ec3ff]/10 md:col-span-2"
            onClick={() => setHiddenState(false)}
          >
            Leave a review
          </button>
        ) : (
          <p className="mt-10 rounded-lg border border-[#1ec3ff]/40 px-3 py-1.5 text-[#a7e9ff] hover:bg-[#1ec3ff]/10 md:col-span-2">
            {messageState}
          </p>
        )}

        {isLoadingReviews ? (
          <div className="md:col-span-2">
            <p className="text-gray-300">Loading reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid gap-4 md:col-span-2">
            {reviews.map((el) => (
              <ReviewCard
                key={el._id}
                user={el.user.username}
                createdAt={new Date(el.createdAt)} // convert to Date here
                rating={el.rating}
                body={el.body}
                game={""}
              />
            ))}
          </div>
        ) : null}
      </section>
    );
  } else {
    return (
      <ReviewModal
        messageSetter={setMessageState}
        hiddenSetter={setHiddenState}
        game_id={game._id}
        onReviewSubmitted={handleReviewSubmitted}
      />
    );
  }
}
