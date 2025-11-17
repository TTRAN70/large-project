import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { auth } from "../lib/auth";

type Person = {
  _id: string;
  username: string;
  bio?: string;
};

type User = {
  _id: string;
  username: string;
  bio: string;
  following: string[];
  followers?: string[];
  playlist: any[];
};

export default function FollowersPage() {
  const currentUserToken = auth.token?.token;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [following, setFollowing] = useState<Person[]>([]);
  const [followers, setFollowers] = useState<Person[]>([]);
  const [suggested, setSuggested] = useState<Person[]>([]);
  const [q, setQ] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    if (!currentUserToken) return;

    try {
      const res = await fetch(`/api/auth/profile/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${currentUserToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        return data;
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  }, [currentUserToken]);

  const fetchFollowingDetails = useCallback(
    async (user: User) => {
      if (!currentUserToken || !user.following || user.following.length === 0) {
        setFollowing([]);
        return;
      }

      try {
        // Fetch details for each user in following list
        const promises = user.following.map(async (username) => {
          const res = await fetch(`/api/users?username=${username}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${currentUserToken}`,
              "Content-Type": "application/json",
            },
          });

          if (res.ok) {
            const users = await res.json();
            // Return first match
            return Array.isArray(users) && users.length > 0 ? users[0] : null;
          }
          return null;
        });

        const results = await Promise.all(promises);
        const validUsers = results.filter((u): u is Person => u !== null);
        setFollowing(validUsers);
      } catch (error) {
        console.error("Error fetching following details:", error);
        setFollowing([]);
      }
    },
    [currentUserToken],
  );

  const fetchFollowers = useCallback(
    async (user: User) => {
      if (!currentUserToken) {
        setFollowers([]);
        return;
      }

      try {
        // Fetch all users and find who follows current user
        const all = ".*";
        const res = await fetch(`/api/users?username=${all}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${currentUserToken}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const allUsers = await res.json();
          // Filter users who follow the current user
          const followerUsers = allUsers.filter(
            (u: Person) =>
              u.username !== user.username &&
              user.followers?.includes(u.username),
          );
          setFollowers(followerUsers);
        }
      } catch (error) {
        console.error("Error fetching followers:", error);
        setFollowers([]);
      }
    },
    [currentUserToken],
  );

  const fetchSuggested = useCallback(
    async (user: User) => {
      if (!currentUserToken) {
        setSuggested([]);
        return;
      }

      try {
        // Fetch all users
        const all = ".*";
        const res = await fetch(`/api/users?username=${all}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${currentUserToken}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const allUsers = await res.json();
          // Filter out current user and users already following
          const suggestedUsers = allUsers
            .filter(
              (u: Person) =>
                u.username !== user.username &&
                !user.following.includes(u.username),
            )
            .slice(0, 8); // Limit to 8 suggestions
          setSuggested(suggestedUsers);
        }
      } catch (error) {
        console.error("Error fetching suggested users:", error);
        setSuggested([]);
      }
    },
    [currentUserToken],
  );

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const user = await fetchCurrentUser();
        if (user) {
          await Promise.all([
            fetchFollowingDetails(user),
            fetchFollowers(user),
            fetchSuggested(user),
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchCurrentUser, fetchFollowingDetails, fetchFollowers, fetchSuggested]);

  // Actions
  async function follow(user: Person) {
    if (!currentUserToken || !currentUser) return;

    try {
      const res = await fetch(`/api/auth/follow/${user._id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentUserToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        // Update local state
        setFollowing((prev) => [...prev, user]);
        setSuggested((prev) => prev.filter((u) => u._id !== user._id));

        // Update current user's following list
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                following: [...prev.following, user.username],
              }
            : null,
        );
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  }

  async function unfollow(userId: string, username: string) {
    if (!currentUserToken || !currentUser) return;

    try {
      const res = await fetch(`/api/auth/unfollow/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentUserToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        // Update local state
        setFollowing((prev) => prev.filter((u) => u._id !== userId));

        // Add back to suggested
        const unfollowedUser = following.find((u) => u._id === userId);
        if (unfollowedUser) {
          setSuggested((prev) => [...prev, unfollowedUser]);
        }

        // Update current user's following list
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                following: prev.following.filter((u) => u !== username),
              }
            : null,
        );
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  }

  function removeFollower(userId: string) {
    // This would need a backend endpoint to block/remove a follower
    // For now, just update local state
    setFollowers((prev) => prev.filter((u) => u._id !== userId));
  }

  // Filters
  const ql = q.toLowerCase();
  const filteredFollowing = useMemo(
    () => following.filter((p) => p.username.toLowerCase().includes(ql)),
    [following, ql],
  );
  const filteredFollowers = useMemo(
    () => followers.filter((p) => p.username.toLowerCase().includes(ql)),
    [followers, ql],
  );

  if (isLoading) {
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
        <div className="rounded-xl border border-[#1ec3ff]/20 bg-[#061a27]/70 p-4">
          <p className="text-[#a7e9ff]">Loading your network...</p>
        </div>
      </section>
    );
  }

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
            {q
              ? "No matching users in your following list."
              : "You aren't following anyone yet."}
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {filteredFollowing.map((u) => (
              <li
                key={u._id}
                className="rounded-2xl border border-[#1ec3ff]/25 bg-white/5 p-4"
              >
                <Link to={`/profile/${encodeURIComponent(u._id)}`}>
                  <div className="font-semibold hover:text-[#7bd8ff]">
                    @{u.username}
                  </div>
                </Link>
                <p className="text-sm text-gray-300">{u.bio || "—"}</p>
                <div className="mt-3">
                  <button
                    onClick={() => unfollow(u._id, u.username)}
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
            {q
              ? "No matching users in your followers list."
              : "No one follows you yet."}
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {filteredFollowers.map((u) => (
              <li
                key={u._id}
                className="rounded-2xl border border-[#1ec3ff]/25 bg-white/5 p-4"
              >
                <Link to={`/profile/${encodeURIComponent(u._id)}`}>
                  <div className="font-semibold hover:text-[#7bd8ff]">
                    @{u.username}
                  </div>
                </Link>
                <p className="text-sm text-gray-300">{u.bio || "—"}</p>
                <div className="mt-3">
                  <button
                    onClick={() => removeFollower(u._id)}
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
      {suggested.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Suggested users</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {suggested.map((u) => (
              <li
                key={u._id}
                className="rounded-2xl border border-[#1ec3ff]/25 bg-white/5 p-4"
              >
                <Link to={`/profile/${encodeURIComponent(u._id)}`}>
                  <div className="font-semibold hover:text-[#7bd8ff]">
                    @{u.username}
                  </div>
                </Link>
                <p className="text-sm text-gray-300">{u.bio || "—"}</p>
                <div className="mt-3">
                  <button
                    onClick={() => follow(u)}
                    className="w-full rounded-lg border border-[#1ec3ff] px-4 py-2 text-sm font-medium text-[#1ec3ff] transition-colors hover:bg-[#1ec3ff] hover:text-gray-900"
                  >
                    Follow
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
