import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

/** New social keys */
const FOLLOWING_KEY = "gb_following";
const FOLLOWERS_KEY = "gb_followers";

/** Legacy (friends/requests) – will migrate once */
const FRIENDS_KEY = "gb_friends";
const REQUESTS_KEY = "gb_friend_requests";

type Person = { username: string; bio?: string };

const MOCK_SUGGESTED: Person[] = [
  { username: "samus", bio: "Metroidvania enjoyer." },
  { username: "cloud9", bio: "JRPGs and coffee." },
  { username: "katamari", bio: "Rolling through backlogs." },
  { username: "shepard", bio: "Paragade choices only." },
];

/** helpers */
function load<T>(k: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(k) || "") as T; } catch { return fallback; }
}
function save<T>(k: string, v: T) {
  localStorage.setItem(k, JSON.stringify(v));
}

export default function FollowersPage() {
  // first load
  const [following, setFollowing] = useState<Person[]>(() => load(FOLLOWING_KEY, [] as Person[]));
  const [followers, setFollowers] = useState<Person[]>(() => load(FOLLOWERS_KEY, [] as Person[]));
  const [q, setQ] = useState("");

  // one-time migration from old keys (friend -> following, ignore requests)
  useEffect(() => {
    const migrated = localStorage.getItem("__gb_social_migrated__");
    if (migrated) return;
    const legacyFriends = load<Person[]>(FRIENDS_KEY, []);
    const legacyReqs = load<Person[]>(REQUESTS_KEY, []);
    if (legacyFriends.length || legacyReqs.length) {
      const merged = dedupe([...following, ...legacyFriends]);
      setFollowing(merged);
      // optional: treat pending requests as followers (people who “followed” you)
      const mergedFollowers = dedupe([...followers, ...legacyReqs]);
      setFollowers(mergedFollowers);
      localStorage.removeItem(FRIENDS_KEY);
      localStorage.removeItem(REQUESTS_KEY);
    }
    localStorage.setItem("__gb_social_migrated__", "1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist
  useEffect(() => save(FOLLOWING_KEY, following), [following]);
  useEffect(() => save(FOLLOWERS_KEY, followers), [followers]);

  // actions
  function follow(u: Person) {
    setFollowing(prev => dedupe([...prev, u]));
  }
  function unfollow(name: string) {
    setFollowing(prev => prev.filter(p => p.username !== name));
  }
  function removeFollower(name: string) {
    setFollowers(prev => prev.filter(p => p.username !== name));
  }

  // filters
  const ql = q.toLowerCase();
  const filteredFollowing = useMemo(
    () => following.filter(p => p.username.toLowerCase().includes(ql)),
    [following, ql]
  );
  const filteredFollowers = useMemo(
    () => followers.filter(p => p.username.toLowerCase().includes(ql)),
    [followers, ql]
  );

  // simple suggestion logic: suggest anyone you don't follow yet
  const suggested = useMemo(
    () => MOCK_SUGGESTED.filter(
      s => !following.some(f => f.username === s.username)
    ),
    [following]
  );

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your network</h1>
        <Link
          to="/feed"
          className="rounded-lg border border-[#1ec3ff]/40 px-3 py-1.5 text-[#a7e9ff] hover:bg-[#1ec3ff]/10"
        >
          ← Back to Feed
        </Link>
      </header>

      {/* Search */}
      <div>
        <label className="flex items-center gap-2 rounded-xl border border-[#1ec3ff]/35 bg-[#071f2f] px-3 py-2">
          <svg className="h-5 w-5 text-[#7bd8ff]" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your followers / following…"
            className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
          />
        </label>
      </div>

      {/* Following */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Following</h2>
        {filteredFollowing.length === 0 ? (
          <p className="rounded-xl border border-[#1ec3ff]/20 bg-[#061a27]/70 p-4 text-[#a7e9ff]">
            You aren’t following anyone yet.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {filteredFollowing.map((u) => (
              <li key={u.username} className="rounded-2xl border border-[#1ec3ff]/25 bg-white/5 p-4">
                <div className="font-semibold">@{u.username}</div>
                <p className="text-sm text-gray-300">{u.bio || "—"}</p>
                <div className="mt-3">
                  <button
                    onClick={() => unfollow(u.username)}
                    className="w-full rounded-lg border border-red-400/40 px-3 py-1.5 text-sm text-red-200 hover:bg-red-500/10"
                  >
                    Unfollow
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Followers */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Followers</h2>
        {filteredFollowers.length === 0 ? (
          <p className="rounded-xl border border-[#1ec3ff]/20 bg-[#061a27]/70 p-4 text-[#a7e9ff]">
            No one follows you yet.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {filteredFollowers.map((u) => (
              <li key={u.username} className="rounded-2xl border border-[#1ec3ff]/25 bg-white/5 p-4">
                <div className="font-semibold">@{u.username}</div>
                <p className="text-sm text-gray-300">{u.bio || "—"}</p>
                <div className="mt-3">
                  <button
                    onClick={() => removeFollower(u.username)}
                    className="w-full rounded-lg border border-[#1ec3ff]/40 px-3 py-1.5 text-sm text-[#a7e9ff] hover:bg-[#1ec3ff]/10"
                  >
                    Remove follower
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Suggestions */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Suggested users</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {suggested.map((u) => (
            <li key={u.username} className="rounded-2xl border border-[#1ec3ff]/25 bg-white/5 p-4">
              <div className="font-semibold">@{u.username}</div>
              <p className="text-sm text-gray-300">{u.bio || "—"}</p>
              <div className="mt-3">
                <button
                  onClick={() => follow(u)}
                  className="w-full rounded-lg border border-[#1ec3ff] px-4 py-2 text-sm font-medium text-[#1ec3ff] hover:bg-[#1ec3ff] hover:text-gray-900 transition-colors"
                >
                  Follow
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

function dedupe(list: Person[]) {
  const seen = new Set<string>();
  const out: Person[] = [];
  for (const p of list) {
    if (seen.has(p.username)) continue;
    seen.add(p.username);
    out.push(p);
  }
  return out;
}
