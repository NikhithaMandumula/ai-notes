function SortDropdown({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-2.5 py-1.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-blue-400/40 transition-all duration-200 shrink-0"
    >
      <option value="newest">Newest</option>
      <option value="oldest">Oldest</option>
      <option value="title_asc">A-Z</option>
      <option value="title_desc">Z-A</option>
      <option value="updated">Edited</option>
    </select>
  );
}

export default SortDropdown;
