function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="relative w-full max-w-md">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] rounded-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400/30 focus:shadow-[0_0_16px_rgba(96,165,250,0.15)] text-sm transition-all duration-500"
      />
    </div>
  );
}

export default SearchBar;
