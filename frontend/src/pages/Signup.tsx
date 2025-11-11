import { Link } from "react-router-dom";
import { useState } from "react";

export default function Signup() {
  const [error, setError] = useState("");
  const [msgState, setMsgState] = useState(true);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const usernameData = String(f.get("username") || "").trim();
    const emailData = String(f.get("email") || "").trim();
    const passwordData = String(f.get("password") || "").trim();
    const confirm = String(f.get("confirm") || "").trim();

    if (!usernameData || !emailData || !passwordData || !confirm) {
      setError("Please fill out all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (passwordData.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (passwordData !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameData,
        email: emailData,
        password: passwordData,
      }),
    }).then((response) => {
      if (response.ok) {
        setMsgState(!msgState);
        return response.json();
      } else {
        //todo: error handling
      }
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-[rgba(30,195,255,0.35)] bg-[rgba(255,255,255,0.04)] p-6 backdrop-blur"
        aria-labelledby="signup-title"
      >
        <h1 id="signup-title" className="text-xl font-semibold text-white">
          Create your account
        </h1>

        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        <label className="block space-y-1">
          <span className="text-sm text-gray-200">Username</span>
          <input
            name="username"
            className="w-full rounded-lg border border-[rgba(30,195,255,0.35)] bg-[#072335] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-[rgba(30,195,255,0.45)]"
            placeholder="player1"
            required
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-gray-200">Email</span>
          <input
            name="email"
            type="email"
            className="w-full rounded-lg border border-[rgba(30,195,255,0.35)] bg-[#072335] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-[rgba(30,195,255,0.45)]"
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-gray-200">Password</span>
          <input
            name="password"
            type="password"
            className="w-full rounded-lg border border-[rgba(30,195,255,0.35)] bg-[#072335] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-[rgba(30,195,255,0.45)]"
            placeholder="••••••••"
            required
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-gray-200">Confirm password</span>
          <input
            name="confirm"
            type="password"
            className="w-full rounded-lg border border-[rgba(30,195,255,0.35)] bg-[#072335] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-[rgba(30,195,255,0.45)]"
            placeholder="••••••••"
            required
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-[#1ec3ff]/80 px-4 py-2 font-medium text-slate-900 hover:bg-[#1ec3ff]"
        >
          Sign up
        </button>

        <p className="pt-1 text-sm text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="text-[#1ec3ff] hover:underline">
            Log in
          </Link>
        </p>
      </form>
      <p
        className={
          (msgState == true ? "hidden " : "") +
          "msg justify-bottom mt-10 flex content-end text-sm text-gray-300"
        }
      >
        An account verification email was sent, please follow the sent link
        before logging in (check your junk folder).
      </p>
    </div>
  );
}
