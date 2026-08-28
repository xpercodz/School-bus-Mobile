import { Icon } from "@/components/Icon";

interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
}

export function SearchBar({ query, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Icon
        name="search"
        size={24}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
      />
      <input
        type="text"
        aria-label="Search students"
        placeholder="Search student..."
        value={query}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 w-full rounded-full bg-surface-container-high pl-12 pr-14 text-body-lg text-on-surface transition-colors placeholder:text-on-surface-variant focus:bg-surface-container-highest focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {query !== "" && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-variant"
        >
          <Icon name="close" />
        </button>
      )}
    </div>
  );
}
