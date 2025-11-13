import { Link, Navigate } from "react-router-dom";
import { auth } from "../lib/auth";

export default function Landing() {
  const token = auth.token;
  if (token) {
    // send them to /login and remember where they came from
    return <Navigate to="/feed" replace />;
  }

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center text-center">
      {/* Goat button (top-right corner) */}
      <Link
        to="/goat"
        className="absolute top-6 right-6 transition-transform hover:scale-110"
        title="GOAT Mode"
      >
        <img
          src="/goat.png"
          alt="GOAT"
          className="h-10 w-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
        />
      </Link>

      {/* Logo */}
      <img
        src="/gamebox-wordmark.png"
        alt="GameBox"
        className="fade-in-up mb-12 w-[340px] drop-shadow-[0_10px_45px_rgba(30,195,255,0.25)] select-none sm:w-[480px] md:w-[640px]"
        draggable={false}
        style={{ animationDelay: "0.3s" }}
      />

      {/* Button */}
      <Link
        to="/login"
        className="fade-in-up rounded-xl bg-[#1ec3ff] px-6 py-3 text-lg font-semibold text-slate-900 shadow hover:brightness-110 focus:ring-2 focus:ring-[#1ec3ff]/60 focus:outline-none"
        style={{ animationDelay: "1.1s" }}
      >
        Go to login →
      </Link>
    </section>
  );
}
