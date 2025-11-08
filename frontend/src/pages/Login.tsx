// frontend/src/pages/Login.tsx
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { auth } from "../lib/auth";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");

  // If user was sent here by Protected, go back there after login; else go to "/"
  const from = (location.state as any)?.from?.pathname || "/";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const emailData = String(f.get("email") || "").trim();
    const passwordData = String(f.get("password") || "").trim();

    if (!emailData || !passwordData) {
      setError("Please enter a username and password.");
      return;
    }


    const res = await fetch("/api/auth/login", { method: "POST", headers:{"Content-Type": "application/json"}, body: JSON.stringify({
      email: emailData,
      password: passwordData
    })}).then( response =>{
      if(response.ok){
        return response.json();
      } else{
          //todo: error handling
      }
    })
  
  //send user to either initally desired page, or feed by default
    if(from == "/"){
      nav("/feed");
    } else{
      nav(from, { replace: true });
    }
    
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-[rgba(30,195,255,0.35)] bg-[rgba(255,255,255,0.04)] p-6 backdrop-blur"
        aria-labelledby="login-title"
      >
        <h1 id="login-title" className="text-xl font-semibold text-white">Log in</h1>

        {error && (
          <div role="alert" className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <label className="block space-y-1">
          <span className="text-sm text-gray-200">Email</span>
          <input
            name="email"
            className="w-full rounded-lg border border-[rgba(30,195,255,0.35)] bg-[#072335] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-[rgba(30,195,255,0.45)]"
            placeholder="player1@email.domain"
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

        <button type="submit" className="w-full rounded-lg bg-[#1ec3ff]/80 px-4 py-2 font-medium text-slate-900 hover:bg-[#1ec3ff]">
          Continue
        </button>

        <p className="pt-1 text-sm text-gray-300">
          Don’t have an account? <Link to="/signup" className="text-[#1ec3ff] hover:underline">Sign up</Link>
        </p>
      </form>
        <p className="flex mt-10 justify-bottom content-end text-sm text-gray-300">
        <Link to="/reset" className="text-[#1ec3ff] hover:underline">Forgot password?</Link>
        </p>
    </div>
  );
}
