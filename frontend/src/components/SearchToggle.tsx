import { useSearchMode, type SearchMode } from "../lib/searchMode";

export default function SearchToggle() {
  const { mode, setMode } = useSearchMode();

  const Btn = ({ value, label }: { value: SearchMode; label: string }) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      className={[
        "px-3 py-1 text-sm rounded-xl transition",
        mode === value
          ? "bg-black text-white"
          : "bg-gray-200/70 hover:bg-gray-300 text-gray-700",
      ].join(" ")}
      aria-pressed={mode === value}
    >
      {label}
    </button>
  );

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-gray-100" role="tablist" aria-label="Search type">
      <Btn value="games" label="Games" />
      <Btn value="users" label="Users" />
    </div>
  );
}
