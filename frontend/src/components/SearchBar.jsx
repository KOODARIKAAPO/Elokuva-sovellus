import React, { useState } from "react";
import "./SearchBar.css";

function SearchBar({ query, onQueryChange, onSearch }) {
  const [inputValue, setInputValue] = useState(query || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    onQueryChange(e.target.value);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Hae elokuvia..."
      />
      <button type="submit">Hae</button>
    </form>
  );
}

export default SearchBar;
