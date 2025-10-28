// frontend/src/components/UserMenu.tsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../lib/auth";

type User = { username: string };

export default function UserMenu({ user }: { user: User | null }) {
  if (!user) return null;

  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function handleLogout() {
    auth.logout();
    setOpen(false);
    nav("/login", { replace: true });
    // Robust fallback if something blocks SPA nav:
    // setTimeout(() => { if (location.pathname !== "/login") window.location.replace("/login"); }, 50);
  }

  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      {/* …keep the same button + menu… */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full bg-[#1ec3ff]/15 px-3 py-1.5 text-sm text-[#a7e9ff] hover:bg-[#1ec3ff]/25 focus:outline-none focus:ring-2 focus:ring-[#1ec3ff]/50"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="user-menu"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1ec3ff]/25 text-xs font-semibold text-[#d7f4ff]">
          {initials}
        </span>
        <span className="max-w-[8rem] truncate">{user.username}</span>
        <svg className="h-4 w-4 opacity-80" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.207l3.71-3.977a.75.75 0 1 1 1.1 1.02l-4.25 4.56a.75.75 0 0 1-1.1 0l-4.25-4.56a.75.75 0 0 1 .02-1.06z"/>
        </svg>
      </button>

      {open && (
        <div id="user-menu" role="menu" className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-[#1ec3ff]/30 bg-[rgba(6,24,36,0.98)] p-1 shadow-xl backdrop-blur">
          <Link
            to={`/profile/${encodeURIComponent(user.username)}`}
            role="menuitem"
            className="block rounded-lg px-3 py-2 text-sm text-[#d7f4ff] hover:bg-[#1ec3ff]/10"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <Link
            to="/friends"
            role="menuitem"
            className="block rounded-lg px-3 py-2 text-sm text-[#d7f4ff] hover:bg-[#1ec3ff]/10"
            onClick={() => setOpen(false)}
          >
            Followers
          </Link>
          <button
            role="menuitem"
            onClick={handleLogout}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-200 hover:bg-red-500/10"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
