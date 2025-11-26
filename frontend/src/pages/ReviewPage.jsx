import React, { useState } from "react";
import { useAuth } from "../AuthContext.jsx";

export default function ReviewPage() {
  const { currentUser, token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";

  if (!currentUser) return <p>Kirjaudu sisään lisätäksesi arvostelun.</p>;

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=fi-FI`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      setError("Haku epäonnistui");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMovie) {
      alert("Valitse elokuva arvostelua varten.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tmdb_id: selectedMovie.id,
          rating,
          review_text: text,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Virhe arvostelun tallennuksessa");
      }

      alert("Arvostelu tallennettu!");
      setSelectedMovie(null);
      setRating(0);
      setText("");
      setQuery("");
      setResults([]);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Lisää arvostelu</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Hae elokuvaa..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "8px", width: "300px" }}
        />
        <button onClick={handleSearch} style={{ marginLeft: "10px" }}>
          Hae
        </button>
      </div>

      {loading && <p>Ladataan hakutuloksia...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {results.length > 0 && (
        <div>
          {results.map((movie) => (
            <div
              key={movie.id}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
                border: selectedMovie?.id === movie.id ? "2px solid blue" : "1px solid gray",
                padding: "5px",
              }}
            >
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                    : "https://via.placeholder.com/92x138?text=Ei+kuvaa"
                }
                alt={movie.title}
                style={{ marginRight: "10px" }}
              />
              <div>
                <p style={{ margin: 0 }}>
                  {movie.title} ({movie.release_date?.slice(0, 4) || "n/a"})
                </p>
                <label style={{ cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="selectedMovie"
                    checked={selectedMovie?.id === movie.id}
                    onChange={() => setSelectedMovie(movie)}
                  />{" "}
                  Valitse
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMovie && (
        <div style={{ marginTop: "20px" }}>
          <h2>Arvostele: {selectedMovie.title}</h2>
          <div>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                style={{
                  fontSize: "1.5rem",
                  color: star <= rating ? "gold" : "gray",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Kirjoita arviosi tähän..."
            rows={5}
            cols={50}
            style={{ marginTop: "10px" }}
          />
          <div style={{ marginTop: "10px" }}>
            <button onClick={handleSubmit}>Lähetä arvostelu</button>
          </div>
        </div>
      )}
    </div>
  );
}
