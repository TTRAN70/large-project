export type Game = {
  id: string;
  title: string;
  year: number;
  genre: string;
  cover: string;   // image URL
  accent?: string; // eg "#7dd3fc" for a subtle edge glow
};

export const GAMES: Game[] = [
  {
    id: "neon-chronicles",
    title: "Neon Chronicles",
    year: 2024,
    genre: "RPG",
    cover: "https://images.unsplash.com/photo-1582562124811-c09040d0fb1a?q=80&w=1200&auto=format&fit=crop",
    accent: "#60a5fa",
  },
  {
    id: "pixel-legends",
    title: "Pixel Legends",
    year: 2023,
    genre: "Adventure",
    cover: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
    accent: "#22d3ee",
  },
  {
    id: "chromatic-warriors",
    title: "Chromatic Warriors",
    year: 2024,
    genre: "Action",
    cover: "https://images.unsplash.com/photo-1550179401-2009f7a5d5f9?q=80&w=1200&auto=format&fit=crop",
    accent: "#a78bfa",
  },
  {
    id: "arcade-dreams",
    title: "Arcade Dreams",
    year: 2022,
    genre: "Platformer",
    cover: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
    accent: "#34d399",
  },
  {
    id: "manga-quest",
    title: "Manga Quest",
    year: 2024,
    genre: "Strategy",
    cover: "https://images.unsplash.com/photo-1472457897821-70d3819a0e24?q=80&w=1200&auto=format&fit=crop",
    accent: "#f472b6",
  },
];
