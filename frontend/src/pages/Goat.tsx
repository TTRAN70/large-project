// src/pages/Goat.tsx
import { Link } from "react-router-dom";

export default function Goat() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center space-y-8 text-center">
      {/* Back button */}
      <Link
        to="/"
        className="fixed top-6 left-6 rounded-lg border border-[#1ec3ff]/40 px-3 py-1.5 text-sm text-[#a7e9ff] hover:bg-[#1ec3ff]/10"
      >
        ← Back to Landing
      </Link>

      {/* GOAT Image */}
      <img
        src="/goat-achievements.jpg"
        alt="GOAT Achievements"
        className="max-w-[90%] rounded-lg border border-[#1ec3ff]/20 shadow-lg md:max-w-[90%]"
      />
    </section>
  );
}
