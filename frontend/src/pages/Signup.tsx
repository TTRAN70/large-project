import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { auth } from "../lib/auth"; // <- relative path (no alias)

export default function Signup() {
  const nav = useNavigate();
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const username = String(f.get("username") || "").trim();
    const email    = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "").trim();
    const confirm  = String(f.get("confirm")  || "").trim();

    if (!username || !email || !password || !confirm) {
      setError("Please fill out all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    // when backend ready:
    // await fetch("/auth/signup", { method: "POST", body: JSON.stringify({...}) });
    // if ok: nav("/login") or auto-login from returned JWT
    // Frontend-only: pretend signup worked
    auth.login({ username });
    nav("/", { replace: true });
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
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
    </div>
  );
}
