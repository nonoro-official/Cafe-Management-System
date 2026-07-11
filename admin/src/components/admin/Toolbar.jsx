const Toolbar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  sortValue,
  onSortChange,
  sortOptions = [],
  actionLabel,
  onAction,
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar__search">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
          <circle cx="6.3" cy="6.3" r="4.3" stroke="#6b4e38" strokeWidth="1.3" />
          <path d="M13 13l-3.2-3.2" stroke="#6b4e38" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
        />
      </div>

      {actionLabel && (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}

      {sortOptions.length > 0 && (
        <select
          className="toolbar__sort"
          value={sortValue}
          onChange={(event) => onSortChange(event.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default Toolbar;
