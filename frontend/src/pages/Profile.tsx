// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { auth } from "../lib/auth";
import { jwtDecode } from "jwt-decode";
import { type User } from "../data/users";
import ReviewCard from "../components/ReviewCard.tsx";

type Review = {
  id: string;
  game: string;
  rating: number;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function Profile() {
  const nav = useNavigate();
  const { id: routeUser } = useParams<{ id: string }>();

  const currentUserToken: any = auth.token?.token; // whoever is logged in
  const currentUser: any = currentUserToken
    ? jwtDecode(currentUserToken)
    : null;
  const isOwnProfile = currentUser.id ? routeUser == currentUser.id : false;

  // Local state mirrors current user for editing
  const [userData, setUserData] = useState<any | null>(null);
  const [usernameState, setUsername] = useState("");
  const [bioState, setBio] = useState("");
  const [message, setMessage] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [reviews, setReviews] = useState([]);
  const [target, setTarget] = useState("");


  async function queryReviews(){
    const res = await fetch(`/api/auth/profile/${isOwnProfile ? currentUser.id : routeUser}/reviews`, {
      method: "GET",
    }).then((res) => {
      if(res.ok)
        return res.json();
    });

    setReviews(res.reviews);
  }

  // Keep fields in sync if user updates elsewhere
  useEffect(() => {
    async function fetchUserData() {
      const res = isOwnProfile
        ? await fetch(`/api/auth/profile/me`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${currentUserToken}`,
              "Content-Type": "application/json",
            },
          }).then((response) => {
            if (response.ok) return response.json();
            else return "no user found";
          })
        : await fetch(`/api/auth/profile/${routeUser}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${currentUserToken}`,
              "Content-Type": "application/json",
            },
          }).then((response) => {
            if (response.ok) return response.json();
            else return "no user found";
          });

      setUserData(res);
      return;
    }

    fetchUserData();

    const sync = () => {
      const userEncrypted = auth.token?.token;
      if (!userEncrypted) return;
      else {
        const user: any = jwtDecode(userEncrypted);
        setUsername(user.username);
      }
    };
    window.addEventListener("auth:change", sync);
    return () => window.removeEventListener("auth:change", sync);
  }, []);

  useEffect(() => {
    if(userData){
      setUsername(userData.username);
      setBio(userData.bio);
      queryReviews();
    }
  }, [userData])

  useEffect(() => {
    console.log(target);
  }, [target])

  async function handleDelete(){
    console.log(target);
    await fetch(`/api/auth/review/${target}`, {
      method: "DELETE",
      headers:{
        "Authorization": `Bearer ${currentUserToken}`,
        "Content-Type": "application/json",
      },}).then((res) => {
        if(res.ok)
          queryReviews();
      })
  }

  function onStartEdit() {
    // reset to latest saved values when entering edit
    setUsername(currentUser.username || "");
    setBio(currentUser.bio || "");
    setIsEditing(true);
  }

  function onCancel() {
    // discard edits and return to view mode

    setUsername(currentUser.username || "");
    setBio(currentUser.bio || "");
    setIsEditing(false);
    setMessage("");
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const name = usernameState.trim();
    if (!name) {
      setMessage("Username cannot be empty.");
      return;
    }

    const res = await fetch(`/api/auth/profile/edit`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${currentUserToken}`,
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
    } else setMessage("Uh oh. Something went wrong :(");

    // briefly show message, then exit edit mode
    setTimeout(() => {
      setMessage("");
      setIsEditing(false);
    }, 900);
  }

  function onDelete() {
    if (!confirm("Delete your account? This will clear all your data.")) return;

    // Clear app-local data (extend with friends keys)
    try {
      fetch(`/api/auth/profile/delete`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${currentUserToken}`,
        "Content-Type": "application/json",
      }}).then((res) => {
        if (res.ok) {
          auth.logout();
        }})
    } catch {}

    // Notify + send to signup
    window.dispatchEvent(new Event("auth:change"));
    nav("/login", { replace: true });
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
      {(reviews.length > 0) ? (
                    <div>
                      {reviews.map((el : Review) => (
                      <div key={el.id}>
                        <ReviewCard user={usernameState} createdAt={el.createdAt} rating={el.rating} body={el.body}></ReviewCard>
                        <button className="text-red-300 rounded-lg border border-[#1ec3ff]/40 px-3 py-1.5 text-sm text-[#a7e9ff] hover:bg-[#1ec3ff]/10" onClick={() => {
                          setTarget(el.id);
                          handleDelete();
                        }}>Delete?</button>
                      </div>
                      ))}
                    </div>
                  ) : (null)}
      <Link to="/feed" className="rounded-lg border border-[#1ec3ff]/40 px-3 py-1.5 text-[#a7e9ff] hover:bg-[#1ec3ff]/10">
        ← Back to Feed
      </Link>
    </section>
  );
}
