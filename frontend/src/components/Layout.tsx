import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001a25] to-[#021f30] text-white">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
