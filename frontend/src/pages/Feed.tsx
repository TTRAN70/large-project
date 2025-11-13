// src/pages/Feed.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import GameCard from "../components/GameCard";
import { type Game } from "../data/games";
import { useSearchMode } from "../lib/searchMode";
import SearchToggle from "../components/SearchToggle";
import { type User } from "../data/users";
import { auth } from "../lib/auth";

type Tab = "all" | "want" | "rated";
const WANT_KEY = "gb_want";
const RATE_KEY = "gb_ratings";
const DEBOUNCE_DELAY = 500; // 500ms debounce delay

type UserAction = [target: string, action: string];

export default function Feed() {
  const { mode } = useSearchMode();
  const [user, setUser] = useState<User | null>(null);
  const [targetUserAction, setTargetUserAction] = useState<UserAction>([
    "",
    "",
  ]);
  const [gamesData, setGamesData] = useState<Game[]>([]);
  const [usersData, setUsersData] = useState<User[]>([]);
  const currentUserToken = auth.token?.token;

  const [searchTerm, setSearchTerm] = useState(".*");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // persistent wantlist & ratings (for Games mode)
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

  // UI state
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Track previous mode and tab to detect changes
  const prevModeRef = useRef(mode);
  const prevTabRef = useRef(tab);
  const prevSearchTermRef = useRef(searchTerm);

  const queryUser = useCallback(async () => {
    if (!currentUserToken) return null;

    try {
      const res = await fetch(`/api/auth/profile/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${currentUserToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }, [currentUserToken]);

  const queryGames = useCallback(async (searchString: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/game?title=${searchString}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setGamesData(data);
      } else {
        setGamesData([]);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      setGamesData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const queryPlaylist = useCallback(
    async (searchString = "") => {
      setIsLoading(true);
      try {
        // Fetch fresh user data
        const userData = await queryUser();

        if (userData && userData.playlist) {
          if (!searchString.trim() || searchString === ".*") {
            // If no search string, return all games
            setGamesData([...userData.playlist]);
          } else {
            // Filter games that match the search string
            const filtered = userData.playlist.filter((game) => {
              const searchLower = searchString.toLowerCase();
              return game.title?.toLowerCase().includes(searchLower);
            });
            setGamesData(filtered);
          }
        } else {
          setGamesData([]);
        }
      } catch (error) {
        console.error("Error fetching playlist:", error);
        setGamesData([]);
      } finally {
        setIsLoading(false);
      }
    },
    [queryUser],
  );

  const queryReviewed = useCallback(
    async (searchString: string) => {
      if (!currentUserToken) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/auth/games/reviewed`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${currentUserToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Filter for games that have been rated
          if (!searchString.trim() || searchString === ".*") {
            // If no search string, return all games
            setGamesData(data);
          } else {
            // Filter games that match the search string
            const filtered = data.filter((game) => {
              const searchLower = searchString.toLowerCase();
              return game.title?.toLowerCase().includes(searchLower);
            });
            setGamesData(filtered);
          }
        } else {
          setGamesData([]);
        }
      } catch (error) {
        console.error("Error fetching reviewed games:", error);
        setGamesData([]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserToken],
  );

  const queryUsers = useCallback(
    async (searchString: string) => {
      if (!currentUserToken) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/users?username=${searchString}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${currentUserToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsersData(data);
        } else {
          setUsersData([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsersData([]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserToken],
  );

  // Initial user query
  useEffect(() => {
    queryUser();
  }, [queryUser]);

  // Sync want state with user playlist
  useEffect(() => {
    if (user && gamesData.length > 0) {
      const newWant: Record<string, boolean> = {};
      gamesData.forEach((game) => {
        const isInPlaylist = user.playlist?.some((p) => p._id === game._id);
        newWant[game._id] = !!isInPlaylist;
      });
      setWant((w) => ({ ...w, ...newWant }));
    }
  }, [gamesData, user]);

  // Debounced search handler
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      if (q === "") {
        setSearchTerm(".*");
      } else {
        setSearchTerm(q.trim().toLowerCase());
      }
    }, DEBOUNCE_DELAY);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [q]);

  // Main effect to handle mode, tab, and search changes
  useEffect(() => {
    // Update refs
    prevModeRef.current = mode;
    prevTabRef.current = tab;
    prevSearchTermRef.current = searchTerm;

    // Determine what query to run
    if (mode === "games") {
      if (tab === "want") {
        queryPlaylist(searchTerm);
      } else if (tab === "rated") {
        queryReviewed(searchTerm);
      } else {
        queryGames(searchTerm);
      }
    } else if (mode === "users") {
      queryUsers(searchTerm);
    }
  }, [
    mode,
    tab,
    searchTerm,
    queryGames,
    queryUsers,
    queryPlaylist,
    queryReviewed,
  ]);

  // Handle follow/unfollow actions
  useEffect(() => {
    if (!targetUserAction[0] || !targetUserAction[1]) return;

    const performAction = async () => {
      if (!currentUserToken) return;

      try {
        const endpoint =
          targetUserAction[1] === "follow"
            ? `/api/auth/follow/${targetUserAction[0]}`
            : `/api/auth/unfollow/${targetUserAction[0]}`;

        await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentUserToken}`,
            "Content-Type": "application/json",
          },
        });

        await queryUser();
      } catch (error) {
        console.error("Error performing user action:", error);
      }
    };

    performAction();
  }, [targetUserAction, currentUserToken, queryUser]);

  // Persist want and ratings to localStorage
  useEffect(() => {
    localStorage.setItem(WANT_KEY, JSON.stringify(want));
  }, [want]);

  useEffect(() => {
    localStorage.setItem(RATE_KEY, JSON.stringify(ratings));
  }, [ratings]);

  async function toggleWant(id: string) {
    if (!currentUserToken) return;

    try {
      if (want[id] === false || !want[id]) {
        await fetch(`/api/auth/watch/${id.trim()}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentUserToken}`,
            "Content-Type": "application/json",
          },
        });
        setWant((w) => ({ ...w, [id]: true }));
      } else {
        await fetch(`/api/auth/watch/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${currentUserToken}`,
            "Content-Type": "application/json",
          },
        });
        setWant((w) => ({ ...w, [id]: false }));
      }
    } catch (error) {
      console.error("Error toggling want:", error);
    }
  }

  function rate(id: string, n: number) {
    setRatings((r) => ({ ...r, [id]: n }));
  }

  return (
    <section>
      {/* Search + Tabs/Toggle */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <label className="flex items-center gap-3 rounded-full border border-[rgba(30,195,255,0.35)] bg-[#071f2f] px-4 py-3">
            <svg
              className="h-5 w-5 text-[#7bd8ff]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
                clipRule="evenodd"
              />
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
            <TabBtn
              label="All Games"
              active={tab === "all"}
              onClick={() => setTab("all")}
            />
            <TabBtn
              label="Want-to-play"
              active={tab === "want"}
              onClick={() => setTab("want")}
            />
            <TabBtn
              label="Rated"
              active={tab === "rated"}
              onClick={() => setTab("rated")}
            />
          </div>
        ) : (
          <div className="h-0 sm:h-auto" />
        )}

        {/* Mode toggle always visible */}
        <SearchToggle />
      </div>

      {/* Content */}
      {mode === "games" ? (
        gamesData.length === 0 ? (
          <p className="rounded-xl border border-[#1ec3ff]/20 bg-[#061a27]/70 p-7 text-center text-[#a7e9ff]">
            {isLoading ? "Loading..." : "No games match your filters."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gamesData.map((g) => (
              <GameCard
                key={g._id}
                game={g}
                want={!!want[g._id]}
                onToggleWant={toggleWant}
                onRate={rate}
              />
            ))}
          </div>
        )
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {usersData.map((u) =>
            user && u.username !== user.username ? (
              <li
                key={u._id}
                className="rounded-2xl border border-[rgba(30,195,255,0.25)] bg-[rgba(8,25,38,0.6)] p-4"
              >
                <div className="text-sm text-[#a7e9ff]">User</div>
                <Link to={`/profile/${encodeURIComponent(u._id)}`}>
                  <div className="text-lg font-semibold text-white">
                    @{u.username}
                  </div>
                </Link>
                <p className="mt-1 text-sm text-gray-300">{u.bio || "—"}</p>
                {user && user.following?.includes(u.username) ? (
                  <button
                    type="button"
                    data-id={u._id}
                    className="mt-3 w-full rounded-lg border border-[#1ec3ff]/40 px-3 py-1.5 text-sm text-[#a7e9ff] hover:bg-[#1ec3ff]/10"
                    title="Unfollow user"
                    onClick={() => {
                      setTargetUserAction([u._id, "unfollow"]);
                    }}
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    type="button"
                    className="mt-3 w-full rounded-lg border border-[#1ec3ff]/40 px-3 py-1.5 text-sm text-[#a7e9ff] hover:bg-[#1ec3ff]/10"
                    title="Follow user"
                    onClick={() => {
                      setTargetUserAction([u._id, "follow"]);
                    }}
                  >
                    Follow
                  </button>
                )}
              </li>
            ) : null,
          )}
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
        active
          ? "bg-[#1ec3ff]/20 text-[#a7e9ff]"
          : "text-gray-300 hover:text-[#1ec3ff]"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
