"use client";

export default function SearchBar({ query, onQueryChange, onSearch, nearby, onNearbyChange }) {
  function handleSubmit(event) {
    event.preventDefault();
    onSearch();
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search product name"
      />
      <label className="nearby-option">
        <input type="checkbox" checked={nearby} onChange={(event) => onNearbyChange(event.target.checked)} />
        Nearby items
      </label>
      <button type="submit">Search</button>
    </form>
  );
}
