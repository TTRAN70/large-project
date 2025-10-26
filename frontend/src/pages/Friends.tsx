import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const FRIENDS_KEY = "gb_friends";
const REQUESTS_KEY = "gb_friend_requests";

// tiny helper
function load<T>(k: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(k) || "") as T; } catch { return fallback; }
}

type Person = { username: string; bio?: string };

const MOCK_SUGGESTED: Person[] = [
  { username: "samus", bio: "Metroidvania enjoyer." },
  { username: "cloud9", bio: "JRPGs and coffee." },
  { username: "katamari", bio: "Rolling through backlogs." },
  { username: "shepard", bio: "Paragade choices only." },
];

export default function Friends() {
  const [friends, setFriends]   = useState<Person[]>(() => load(FRIENDS_KEY, [] as Person[]));
  const [requests, setRequests] = useState<Person[]>(() => load(REQUESTS_KEY, [] as Person[]));
  const [query, setQuery] = useState("");

  useEffect(() => localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends)), [friends]);
  useEffect(() => localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests)), [requests]);

  const filteredFriends = useMemo(
    () => friends.filter(f => f.username.toLowerCase().includes(query.toLowerCase())),
    [friends, query]
  );

  function addFriend(u: Person) {
    if (friends.some(f => f.username === u.username)) return;
    setFriends(prev => [...prev, u]);
    // if it was a request, clear it
    setRequests(prev => prev.filter(r => r.username !== u.username));
  }
  function removeFriend(name: string) {
    setFriends(prev => prev.filter(f => f.username !== name));
  }
  function accept(name: string) {
    const req = requests.find(r => r.username === name);
    if (req) addFriend(req);
  }
  function decline(name: string) {
    setRequests(prev => prev.filter(r => r.username !== name));
  }
  function sendRequest(u: Person) {
    if (u.username && !requests.some(r => r.username === u.username) && !friends.some(f => f.username === u.username)) {
      setRequests(prev => [...prev, u]);
    }
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Friends</h1>
        <Link to="/" className="rounded-lg border border-[#1ec3ff]/40 px-3 py-1.5 text-[#a7e9ff] hover:bg-[#1ec3ff]/10">
          ← Back to Feed
        </Link>
      </header>

      {/* Search bar */}
      <div>
        <label className="flex items-center gap-2 rounded-xl border border-[#1ec3ff]/35 bg-[#071f2f] px-3 py-2">
          <svg className="h-5 w-5 text-[#7bd8ff]" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search friends…"
            className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
          />
        </label>
      </div>

      {/* Current friends */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Your friends</h2>
        {filteredFriends.length === 0 ? (
          <p className="rounded-xl border border-[#1ec3ff]/20 bg-[#061a27]/70 p-4 text-[#a7e9ff]">No friends yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {filteredFriends.map((u) => (
              <li key={u.username} className="rounded-2xl border border-[#1ec3ff]/25 bg-white/5 p-4">
                <div className="font-semibold">@{u.username}</div>
                <p className="text-sm text-gray-300">{u.bio || "—"}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => removeFriend(u.username)} className="rounded-lg border border-red-400/40 px-3 py-1.5 text-sm text-red-200 hover:bg-red-500/10">
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Requests */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Friend requests</h2>
        {requests.length === 0 ? (
          <p className="rounded-xl border border-[#1ec3ff]/20 bg-[#061a27]/70 p-4 text-[#a7e9ff]">No pending requests.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {requests.map((u) => (
              <li key={u.username} className="rounded-2xl border border-[#1ec3ff]/25 bg-white/5 p-4">
                <div className="font-semibold">@{u.username}</div>
                <p className="text-sm text-gray-300">{u.bio || "—"}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => accept(u.username)} className="rounded-lg border border-emerald-400/40 px-3 py-1.5 text-sm text-emerald-200 hover:bg-emerald-500/10">
                    Accept
                  </button>
                  <button onClick={() => decline(u.username)} className="rounded-lg border border-red-400/40 px-3 py-1.5 text-sm text-red-200 hover:bg-red-500/10">
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Suggestions (mock) */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">People you might know</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {MOCK_SUGGESTED.map((u) => (
            <li key={u.username} className="rounded-2xl border border-[#1ec3ff]/25 bg-white/5 p-4">
              <div className="font-semibold">@{u.username}</div>
              <p className="text-sm text-gray-300">{u.bio || "—"}</p>
              <div className="mt-3">
                <button onClick={() => sendRequest(u)} className="w-full rounded-lg border border-[#1ec3ff]/40 px-3 py-1.5 text-sm text-[#a7e9ff] hover:bg-[#1ec3ff]/10">
                  Add Friend
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
