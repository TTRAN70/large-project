// frontend/src/components/Header.tsx
import { Link, useLocation } from "react-router-dom";
import { auth } from "../lib/auth";
import { useEffect, useState } from "react";
import UserMenu from "./UserMenu";

export default function Header() {
  const [user, setUser] = useState(auth.user);
  const loc = useLocation();

  useEffect(() => {
    // Update on route changes
    setUser(auth.user);
  }, [loc.key]);

  useEffect(() => {
    const onAuthChange = () => setUser(auth.user);
    // our custom event (same-tab)
    window.addEventListener("auth:change", onAuthChange);
    // storage event (other tabs)
    window.addEventListener("storage", onAuthChange);
    return () => {
      window.removeEventListener("auth:change", onAuthChange);
      window.removeEventListener("storage", onAuthChange);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(30,195,255,0.35)] bg-[rgba(0,18,30,0.8)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="font-bold text-xl tracking-tight text-[#1ec3ff]">
          GameBox
        </Link>
        <div className="flex-1" />
        {!user ? (
          <nav className="ml-3 flex items-center gap-3 text-sm">
            <Link
              to="/login"
              className="rounded-lg border border-[#1ec3ff]/50 px-3 py-1.5 text-[#1ec3ff] hover:bg-[#1ec3ff]/10"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-[#1ec3ff] px-3 py-1.5 font-medium text-slate-900 hover:brightness-110"
            >
              Sign up
            </Link>
          </nav>
        ) : (
          <UserMenu user={user} />
        )}
      </div>
    </header>
  );
}
