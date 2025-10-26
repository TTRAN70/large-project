// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../lib/auth";

export default function Profile() {
  const nav = useNavigate();
  const { username: routeUser } = useParams<{ username: string }>();

  const current = auth.user; // whoever is logged in
  const isOwnProfile = current && routeUser === current.username;

  // Local state mirrors current user for editing
  const [username, setUsername] = useState(routeUser || current?.username || "");
  const [bio, setBio] = useState(current?.bio || "");
  const [message, setMessage] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Keep fields in sync if user updates elsewhere
  useEffect(() => {
    const sync = () => {
      const u = auth.user;
      if (!u) return;
      setUsername(u.username);
      setBio(u.bio || "");
    };
    window.addEventListener("auth:change", sync);
    return () => window.removeEventListener("auth:change", sync);
  }, []);

  function onStartEdit() {
    // reset to latest saved values when entering edit
    const u = auth.user;
    setUsername(u?.username || "");
    setBio(u?.bio || "");
    setIsEditing(true);
  }

  function onCancel() {
    // discard edits and return to view mode
    const u = auth.user;
    setUsername(u?.username || "");
    setBio(u?.bio || "");
    setIsEditing(false);
    setMessage("");
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    const name = username.trim();
    if (!name) {
      setMessage("Username cannot be empty.");
      return;
    }

    const was = auth.user?.username;
    auth.update({ username: name, bio: bio.trim() });
    setMessage("Profile updated ✓");

    // If username changed, update the URL to the new profile path
    if (was && was !== name) {
      nav(`/profile/${encodeURIComponent(name)}`, { replace: true });
    }

    // briefly show message, then exit edit mode
    setTimeout(() => {
      setMessage("");
      setIsEditing(false);
    }, 900);
  }

  function onDelete() {
    if (!confirm("Delete your account? This will clear local data.")) return;

    // Clear app-local data (extend with friends keys)
    try {
      localStorage.removeItem("gb_user");
      localStorage.removeItem("gb_want");          // want-to-play (Feed)
      localStorage.removeItem("gb_ratings");       // ratings (Feed)
      localStorage.removeItem("gb_friends");       // friends list (Friends page)
      localStorage.removeItem("gb_friend_requests"); // friend requests (Friends page)
    } catch {}

    // Notify + send to signup
    window.dispatchEvent(new Event("auth:change"));
    nav("/signup", { replace: true });
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {isOwnProfile ? "Your profile" : `${routeUser}'s profile`}
          </h1>
          {!isOwnProfile && (
            <p className="text-sm text-gray-300">Public view (read-only)</p>
          )}
        </div>

        {/* Edit button for own profile when not editing */}
        {isOwnProfile && !isEditing && (
          <button
            onClick={onStartEdit}
            className="rounded-lg border border-[#1ec3ff]/40 px-3 py-1.5 text-sm text-[#a7e9ff] hover:bg-[#1ec3ff]/10"
          >
            Edit profile
          </button>
        )}
      </header>

      {/* Own profile: edit OR view */}
      {isOwnProfile ? (
        isEditing ? (
          // Edit mode
          <form
            onSubmit={onSave}
            className="max-w-xl space-y-4 rounded-2xl border border-[#1ec3ff]/30 bg-white/5 p-5 backdrop-blur"
          >
            {message && (
              <div
                role="status"
                className="rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200"
              >
                {message}
              </div>
            )}

            <label className="block space-y-1">
              <span className="text-sm text-gray-200">Username</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-[rgba(30,195,255,0.35)] bg-[#072335] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-[rgba(30,195,255,0.45)]"
                placeholder="player1"
                required
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm text-gray-200">Bio</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full resize-y rounded-lg border border-[rgba(30,195,255,0.35)] bg-[#072335] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-[rgba(30,195,255,0.45)]"
                placeholder="Tell people what you play!"
              />
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="rounded-lg bg-[#1ec3ff] px-4 py-2 font-medium text-slate-900 hover:brightness-110"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-[#1ec3ff]/40 px-4 py-2 text-[#a7e9ff] hover:bg-[#1ec3ff]/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="ml-auto rounded-lg border border-red-500/40 px-4 py-2 text-red-200 hover:bg-red-500/10"
              >
                Delete account
              </button>
            </div>
          </form>
        ) : (
          // View mode
          <div className="max-w-xl space-y-4 rounded-2xl border border-[#1ec3ff]/30 bg-white/5 p-5 backdrop-blur">
            <div>
              <div className="text-sm text-gray-300">Username</div>
              <div className="text-lg font-medium text-white">{username}</div>
            </div>
            <div>
              <div className="text-sm text-gray-300">Bio</div>
              <p className="text-gray-200">
                {bio?.trim() ? bio : "No bio yet."}
              </p>
            </div>
          </div>
        )
      ) : (
        // Public/read-only profile view (other users)
        <div className="max-w-xl space-y-2 rounded-2xl border border-[#1ec3ff]/30 bg-white/5 p-5 backdrop-blur">
          <div className="text-lg font-medium">{routeUser}</div>
          <p className="text-gray-300">
            {routeUser}’s bio is hidden in this mock. (Public view.)
          </p>
        </div>
      )}
    </section>
  );
}
