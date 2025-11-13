// src/components/Layout.tsx
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";

export default function Layout() {
  const { pathname } = useLocation();
  const hideHeader = pathname === "/" || pathname === "/goat"; // hide header on landing & goat pages

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-[url('/background.jpg')] bg-cover bg-center opacity-100 [filter:blur(30px)_brightness(0.99)]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[rgba(2,12,24,0.72)]" aria-hidden />
      </div>

      {/* Only show header when not on landing/goat */}
      {!hideHeader && (
        <header className="sticky top-0 z-20">
          <Header />
        </header>
      )}

      {/* Adjust layout if header is hidden */}
      <main
        className={`relative z-10 ${
          hideHeader
            ? "flex min-h-screen items-center justify-center"
            : "pt-6 md:pt-8"
        }`}
      >
        <div
          className={`mx-auto w-full ${
            hideHeader
              ? "" // landing & goat pages full-screen
              : "max-w-[1200px] px-4 sm:px-6 lg:px-8"
          }`}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
