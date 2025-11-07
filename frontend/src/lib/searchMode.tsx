import React, { createContext, useContext, useState } from "react";

export type SearchMode = "games" | "users";

type Ctx = { mode: SearchMode; setMode: (m: SearchMode) => void };

const SearchModeContext = createContext<Ctx | null>(null);

export const SearchModeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [mode, setModeState] = useState<SearchMode>(
    () => (localStorage.getItem("searchMode") as SearchMode) || "games"
  );
  const setMode = (m: SearchMode) => {
    setModeState(m);
    localStorage.setItem("searchMode", m);
  };
  return <SearchModeContext.Provider value={{ mode, setMode }}>{children}</SearchModeContext.Provider>;
};

export const useSearchMode = () => {
  const ctx = useContext(SearchModeContext);
  if (!ctx) throw new Error("useSearchMode must be used within <SearchModeProvider>");
  return ctx;
};
