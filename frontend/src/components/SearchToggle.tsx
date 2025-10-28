import { useSearchMode, type SearchMode } from "../lib/searchMode";

export default function SearchToggle() {
  const { mode, setMode } = useSearchMode();

  const Btn = ({ value, label }: { value: SearchMode; label: string }) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      className={[
        "px-3 py-1 text-sm font-medium rounded-xl transition-colors duration-200",
        mode === value
          ? "bg-[#1ec3ff] text-gray-900 shadow-sm"
          : "bg-gray-800 text-gray-200 hover:bg-[#1ec3ff]/30 hover:text-white",
      ].join(" ")}
      aria-pressed={mode === value}
    >
      {label}
    </button>
  );

  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-2xl bg-gray-900/60 backdrop-blur-sm border border-gray-700"
      role="tablist"
      aria-label="Search type"
    >
      <Btn value="games" label="Games" />
      <Btn value="users" label="Users" />
    </div>
  );
}
