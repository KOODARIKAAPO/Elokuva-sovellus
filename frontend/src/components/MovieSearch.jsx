import { useState, useEffect } from "react";

const MovieSearch = () => {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiKey ="ab874b480abe75cd2a551c3474fc5a9b"; // vaihda omaan TMDb API-avaimeen

  // Debounce hook: odottaa 500ms ennen API-kutsua
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
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId); // tyhjennä edellinen timeout
  }, [query]);

  return (
    <div>
      <input
        type="text"
        placeholder="Etsi elokuvia..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
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
          />
          <h3>{movie.title}</h3>
          <p>{movie.release_date}</p>
        </div>
      );
    })}
</div>
    </div>
  );
};

export default MovieSearch;
