import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { auth } from "../lib/auth";
import { jwtDecode } from "jwt-decode";
import ReviewCard from "../components/ReviewCard.tsx";

type Review = {
  id: string;
  game: string;
  rating: number;
  body: string;
  createdAt: string;
  updatedAt: string;
};

type UserData = {
  _id: string;
  username: string;
  bio: string;
  playlist: any[];
  following: string[];
  reviews?: Review[];
};

export default function Profile() {
  const nav = useNavigate();
  const { id: routeUser } = useParams<{ id: string }>();

  const currentUserToken = auth.token?.token;
  const currentUser: any = currentUserToken
    ? jwtDecode(currentUserToken)
    : null;
  const isOwnProfile =
    currentUser?.id && routeUser ? routeUser === currentUser.id : false;

  // Local state mirrors current user for editing
  const [userData, setUserData] = useState<UserData | null>(null);
  const [usernameState, setUsername] = useState("");
  const [bioState, setBio] = useState("");
  const [message, setMessage] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const queryReviews = useCallback(async () => {
    if (!currentUserToken) return;

    const targetId = isOwnProfile ? currentUser.id : routeUser;
    if (!targetId) return;

    setIsLoadingReviews(true);
    try {
      const res = await fetch(`/api/auth/profile/${targetId}/reviews`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${currentUserToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [currentUserToken, isOwnProfile, currentUser?.id, routeUser]);

  const fetchUserData = useCallback(async () => {
    if (!currentUserToken) {
      setIsLoadingUser(false);
      return;
    }

    setIsLoadingUser(true);
    try {
      const endpoint = isOwnProfile
        ? `/api/auth/profile/me`
        : `/api/auth/profile/${routeUser}`;

      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${currentUserToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUserData(data);
        setUsername(data.username || "");
        setBio(data.bio || "");
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, [currentUserToken, isOwnProfile, routeUser]);

  // Initial fetch
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Fetch reviews when userData is loaded
  useEffect(() => {
    if (userData) {
      queryReviews();
    }
  }, [userData, queryReviews]);

  // Listen for auth changes
  useEffect(() => {
    const sync = () => {
      const userEncrypted = auth.token?.token;
      if (!userEncrypted) return;
      try {
        const user: any = jwtDecode(userEncrypted);
        setUsername(user.username || "");
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    };
    window.addEventListener("auth:change", sync);
    return () => window.removeEventListener("auth:change", sync);
  }, []);

  async function handleDelete(reviewId: string) {
    if (!currentUserToken) return;

    try {
      const res = await fetch(`/api/auth/review/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentUserToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        // Refresh reviews after successful deletion
        queryReviews();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  }

  function onStartEdit() {
    // reset to latest saved values when entering edit
    setUsername(userData?.username || "");
    setBio(userData?.bio || "");
    setIsEditing(true);
  }

  function onCancel() {
    // discard edits and return to view mode
    setUsername(userData?.username || "");
    setBio(userData?.bio || "");
    setIsEditing(false);
    setMessage("");
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserToken) return;

    const name = usernameState.trim();
    if (!name) {
      setMessage("Username cannot be empty.");
      return;
    }

    try {
      const res = await fetch(`/api/auth/profile/edit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentUserToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name,
          bio: bioState,
        }),
      });

      if (res.ok) {
        auth.setUsername(name);
        setMessage("Profile updated ✓");

        // Update local userData to reflect changes
        setUserData((prev) =>
          prev ? { ...prev, username: name, bio: bioState } : null,
        );

        // briefly show message, then exit edit mode
        setTimeout(() => {
          setMessage("");
          setIsEditing(false);
        }, 900);
      } else {
        setMessage("Uh oh. Something went wrong :(");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage("Uh oh. Something went wrong :(");
    }
  }

  async function onDelete() {
    if (!confirm("Delete your account? This will clear all your data.")) return;
    if (!currentUserToken) return;

    try {
      const res = await fetch(`/api/auth/profile/delete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentUserToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        auth.logout();
        window.dispatchEvent(new Event("auth:change"));
        nav("/login", { replace: true });
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  }

  if (isLoadingUser) {
    return (
      <section className="space-y-6">
        <div className="max-w-xl rounded-2xl border border-[#1ec3ff]/30 bg-white/5 p-5 backdrop-blur">
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </section>
    );
  }

  if (!userData && !isLoadingUser) {
    return (
      <section className="space-y-6">
        <div className="max-w-xl rounded-2xl border border-[#1ec3ff]/30 bg-white/5 p-5 backdrop-blur">
          <h1 className="text-2xl font-semibold text-white">User not found</h1>
          <p className="mt-2 text-gray-300">This user doesn't exist.</p>
        </div>
        <Link
          to="/feed"
          className="inline-block rounded-lg border border-[#1ec3ff]/40 px-3 py-1.5 text-[#a7e9ff] hover:bg-[#1ec3ff]/10"
        >
          ← Back to Feed
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {isOwnProfile ? "Your profile" : `${usernameState}'s profile`}
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
                value={usernameState}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-[rgba(30,195,255,0.35)] bg-[#072335] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-[rgba(30,195,255,0.45)]"
                placeholder="player1"
                required
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm text-gray-200">Bio</span>
              <textarea
                value={bioState}
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
              <div className="text-lg font-medium text-white">
                {usernameState}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-300">Bio</div>
              <p className="text-gray-200">
                {bioState?.trim() ? bioState : "No bio yet."}
              </p>
            </div>
          </div>
        )
      ) : (
        // Public/read-only profile view (other users)
        <div className="max-w-xl space-y-2 rounded-2xl border border-[#1ec3ff]/30 bg-white/5 p-5 backdrop-blur">
          <div className="text-lg font-medium">{usernameState}</div>
          <p className="text-gray-300">
            {bioState?.trim() ? bioState : "No bio yet."}
          </p>
        </div>
      )}

      {/* Reviews section */}
      {isLoadingReviews ? (
        <div className="max-w-xl">
          <p className="text-gray-300">Loading reviews...</p>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Reviews</h2>
          {reviews.map((el) => (
            <div key={el.id} className="space-y-2">
              <ReviewCard
                user={usernameState}
                createdAt={new Date(el.createdAt)}
                rating={el.rating}
                body={el.body}
                game={el.game}
              />
              {isOwnProfile && (
                <button
                  onClick={() => handleDelete(el.id)}
                  className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-200 hover:bg-red-500/10"
                >
                  Delete Review
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-xl rounded-2xl border border-[#1ec3ff]/20 bg-[#061a27]/70 p-5">
          <p className="text-center text-[#a7e9ff]">No reviews yet.</p>
        </div>
      )}

      <Link
        to="/feed"
        className="inline-block rounded-lg border border-[#1ec3ff]/40 px-3 py-1.5 text-[#a7e9ff] hover:bg-[#1ec3ff]/10"
      >
        ← Back to Feed
      </Link>
    </section>
  );
}
