import { useState, useEffect } from "react";

const MovieSearch = ({ query: propQuery, onQueryChange, onSearch, onSelectMovie }) => {
  const [query, setQuery] = useState(propQuery || "");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiKey ="ab874b480abe75cd2a551c3474fc5a9b"; 
  
  useEffect(() => {
    if (typeof propQuery === "string" && propQuery !== query) {
      setQuery(propQuery);
    }
  }, [propQuery]);

  useEffect(() => {
    if (!query) {
      setMovies([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=fi-FI`
        );
        const data = await res.json();
        setMovies(data.results);
      } catch (err) {
        console.error(err);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    }, 500); 

    return () => clearTimeout(timeoutId); 
  }, [query, onSearch]);

  return (
    <div>
      <input
        type="text"
        placeholder="Etsi elokuvia..."
        value={query}
        onChange={(e) => {
          const v = e.target.value;
          setQuery(v);
          if (typeof onQueryChange === "function") onQueryChange(v);
        }}
        style={{ padding: "8px", width: "300px", marginBottom: "20px" }}
      />

      {loading && <p>Haetaan...</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
  {Array.isArray(movies) && movies.length === 0 && query && !loading && (
    <p>Elokuvia ei löytynyt.</p>
  )}
  {Array.isArray(movies) &&
    movies.map((movie) => {
      const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
        : "https://via.placeholder.com/300x450?text=Ei+kuvaa";

      return (
        <div key={movie.id} style={{ width: "200px", textAlign: "center" }}>
          <img
            src={posterUrl}
            alt={movie.title}
            style={{ width: "100%", borderRadius: "8px" }}
            onClick={() => typeof onSelectMovie === "function" && onSelectMovie(movie)}
          />
          <h3>{movie.title}</h3>
          <p style={{ cursor: onSelectMovie ? "pointer" : "default" }} onClick={() => typeof onSelectMovie === "function" && onSelectMovie(movie)}>{movie.release_date}</p>
        </div>
      );
    })}
</div>
    </div>
  );
};

export default MovieSearch;