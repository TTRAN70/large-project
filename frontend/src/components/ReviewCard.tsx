import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

type Props = {
  user: string;
  rating: number; // 1..10
  body: string;
  createdAt: string | Date;
  game: string;
};

export default function ReviewCard({
  user,
  rating,
  body,
  createdAt,
  game,
}: Props) {
  const safeRating = Number.isFinite(rating)
    ? Math.max(1, Math.min(10, Math.round(rating)))
    : 0;

  const dateStr = new Date(createdAt).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const { pathname } = useLocation();

  return (
    <article className="rounded-2xl border border-[rgba(30,195,255,0.25)] bg-[rgba(8,25,38,0.6)] p-4">
      {pathname.startsWith("/game/") ? (
        <header className="mb-1 text-sm text-[#a7e9ff]">
          {user}&rsquo;s Review
        </header>
      ) : (
        <Link
          to={`/game/${encodeURIComponent(game)}`}
          className="text-lg font-medium text-[#a7e9ff] hover:text-[#7bd8ff]"
        >
          {game}
        </Link>
      )}

      <div className="mb-1 text-lg font-semibold text-white">
        {safeRating}/10
      </div>

      <p className="text-sm text-gray-300">{body || "—"}</p>

      <footer className="mt-2 text-xs text-[#a7e9ff]/70">{dateStr}</footer>
    </article>
  );
}
