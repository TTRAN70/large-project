// src/pages/Feed.tsx
import { useEffect, useMemo, useState } from "react";
import GameCard from "../components/GameCard";
import { GAMES, type Game } from "../data/games";
import { useSearchMode } from "../lib/searchMode";
import SearchToggle from "../components/SearchToggle";
import { mockUsers } from "../data/users";

type Tab = "all" | "want" | "rated";
const WANT_KEY = "gb_want";
const RATE_KEY = "gb_ratings";

export default function Feed() {
  const { mode } = useSearchMode();

  // persistent wantlist & ratings (for Games mode)
  const [want, setWant] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(WANT_KEY) || "{}"); } catch { return {}; }
  });
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem(RATE_KEY) || "{}"); } catch { return {}; }
  });

  // UI state
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");

  useEffect(() => { localStorage.setItem(WANT_KEY, JSON.stringify(want)); }, [want]);
  useEffect(() => { localStorage.setItem(RATE_KEY, JSON.stringify(ratings)); }, [ratings]);

  function toggleWant(id: string) { setWant((w) => ({ ...w, [id]: !w[id] })); }
  function rate(id: string, n: number) { setRatings((r) => ({ ...r, [id]: n })); }

  const ql = q.trim().toLowerCase();

  // ---- Games view ----
  const filteredGames: Game[] = useMemo(() => {
    let list = GAMES;
    if (ql) {
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(ql) ||
          g.genre.toLowerCase().includes(ql) ||
          String(g.year).includes(ql)
      );
    }
    if (tab === "want")  list = list.filter((g) => want[g.id]);
    if (tab === "rated") list = list.filter((g) => (ratings[g.id] || 0) > 0);
    return list;
  }, [ql, tab, want, ratings]);

  // ---- Users view ----
  const filteredUsers = useMemo(() => {
    if (!ql) return mockUsers;
    return mockUsers.filter((u) =>
      [u.username, u.bio ?? ""].some((v) => v.toLowerCase().includes(ql))
    );
  }, [ql]);

  return (
    <section>
      {/* Search + Tabs/Toggle */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <label className="flex items-center gap-3 rounded-full border border-[rgba(30,195,255,0.35)] bg-[#071f2f] px-4 py-3">
            <svg className="h-5 w-5 text-[#7bd8ff]" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={mode === "games" ? "Search games…" : "Search users…"}
              className="w-full bg-transparent text-base text-white placeholder-gray-400 outline-none"
              aria-label={mode === "games" ? "Search games" : "Search users"}
            />
          </label>
        </div>

        {/* Tabs only in Games mode */}
        {mode === "games" ? (
          <div className="flex rounded-full border border-[#1ec3ff]/30 p-1 text-base">
            <TabBtn label="All Games" active={tab === "all"} onClick={() => setTab("all")} />
            <TabBtn label="Want-to-play" active={tab === "want"} onClick={() => setTab("want")} />
            <TabBtn label="Rated" active={tab === "rated"} onClick={() => setTab("rated")} />
          </div>
        ) : (
          <div className="h-0 sm:h-auto" />
        )}

        {/* Mode toggle always visible */}
        <SearchToggle />
      </div>

      {/* Content */}
      {mode === "games" ? (
        filteredGames.length === 0 ? (
          <p className="rounded-xl border border-[#1ec3ff]/20 bg-[#061a27]/70 p-7 text-center text-[#a7e9ff]">
            No games match your filters.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredGames.map((g) => (
              <GameCard
                key={g.id}
                game={g}
                want={!!want[g.id]}
                rating={ratings[g.id] || 0}
                onToggleWant={toggleWant}
                onRate={rate}
              />
            ))}
          </div>
        )
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.map((u) => (
            <li
              key={u.username}
              className="rounded-2xl border border-[rgba(30,195,255,0.25)] bg-[rgba(8,25,38,0.6)] p-4"
            >
              <div className="text-sm text-[#a7e9ff]">User</div>
              <div className="text-lg font-semibold text-white">@{u.username}</div>
              <p className="mt-1 text-sm text-gray-300">{u.bio || "—"}</p>
              {/* (Optional) Wire to Friends requests later */}
              <button
                type="button"
                className="mt-3 w-full rounded-lg border border-[#1ec3ff]/40 px-3 py-1.5 text-sm text-[#a7e9ff] hover:bg-[#1ec3ff]/10"
                title="(Mock) Add Friend"
              >
                Add Friend
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TabBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-5 py-2 transition-colors ${
        active ? "bg-[#1ec3ff]/20 text-[#a7e9ff]" : "text-gray-300 hover:text-[#1ec3ff]"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
