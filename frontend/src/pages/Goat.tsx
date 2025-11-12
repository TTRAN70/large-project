// src/pages/Goat.tsx
import { Link } from "react-router-dom";

export default function Goat() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen text-center space-y-8">
      {/* Back button */}
      <Link
        to="/"
        className="fixed top-6 left-6 rounded-lg border border-[#1ec3ff]/40 text-[#a7e9ff] px-3 py-1.5 text-sm hover:bg-[#1ec3ff]/10"
      >
        ← Back to Landing
      </Link>

      {/* GOAT Image */}
      <img
        src="/goat-achievements.png"
        alt="GOAT Achievements"
        className="max-w-[90%] md:max-w-[90%] rounded-lg shadow-lg border border-[#1ec3ff]/20"
      />
    </section>
  );
}
