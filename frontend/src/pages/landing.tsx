import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center text-center">
      {/* Goat button (top-right corner) */}
      <Link
        to="/goat"
        className="absolute top-6 right-6 hover:scale-110 transition-transform"
        title="GOAT Mode"
      >
        <img
          src="/goat.png"
          alt="GOAT"
          className="w-10 h-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
        />
      </Link>

      {/* Logo */}
      <img
        src="/gamebox-wordmark.png"
        alt="GameBox"
        className="mb-12 w-[340px] sm:w-[480px] md:w-[640px] drop-shadow-[0_10px_45px_rgba(30,195,255,0.25)] select-none fade-in-up"
        draggable={false}
        style={{ animationDelay: "0.3s" }}
      />

      {/* Button */}
      <Link
        to="/login"
        className="rounded-xl bg-[#1ec3ff] px-6 py-3 text-lg font-semibold text-slate-900 shadow hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#1ec3ff]/60 fade-in-up"
        style={{ animationDelay: "1.1s" }}
      >
        Go to login →
      </Link>
    </section>
  );
}
