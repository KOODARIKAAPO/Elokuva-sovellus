/*import React, { useState, useEffect } from "react";
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
  const [movieReviews, setMovieReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";

  if (!currentUser) return <p>Kirjaudu sisään lisätäksesi arvostelun.</p>;

  // Haku päivittyy jokaisen kirjainmuutoksen jälkeen
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
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
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Kaikkien arvostelujen haku valitulle elokuvalle
  useEffect(() => {
    if (!selectedMovie) return;

    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE}/reviews?tmdb_id=${selectedMovie.id}`);
        if (!res.ok) throw new Error("Arvosteluiden haku epäonnistui");
        const data = await res.json();
        setMovieReviews(data);

        // Tähtikeskiarvon laskenta
        if (data.length > 0) {
          const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
          setAverageRating(avg);
        } else {
          setAverageRating(0);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchReviews();
  }, [selectedMovie]);

  const handleSubmit = async () => {
    if (!selectedMovie) return;

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

      const newReview = await res.json();

      // Lisää uusi arvostelu listaan ja laske keskiarvo uudelleen
      setMovieReviews((prev) => [...prev, newReview]);
      const allRatings = [...movieReviews.map((r) => r.rating), rating];
      const avg = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
      setAverageRating(avg);

      setText("");
      setRating(0);
      alert("Arvostelu tallennettu!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Lue tai anna arvosteluja</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Hae elokuvaa..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "8px", width: "300px" }}
        />
      </div>

      {loading && <p>Ladataan hakutuloksia...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      
      {results.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "15px",
          }}
        >
          {results.map((movie) => (
            <div
              key={movie.id}
              onClick={() => setSelectedMovie(movie)}
              style={{
                cursor: "pointer",
                border: "1px solid #ccc",
                padding: "5px",
                borderRadius: "6px",
                textAlign: "center",
              }}
            >
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                  alt={movie.title}
                  style={{ width: "100%", borderRadius: "4px" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "278px",
                    backgroundColor: "#eee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "4px",
                  }}
                >
                  Ei kuvaa
                </div>
              )}
              <p style={{ margin: "5px 0 0 0", fontWeight: "bold" }}>
                {movie.title} ({movie.release_date?.slice(0, 4) || "n/a"})
              </p>
            </div>
          ))}
        </div>
      )}

      
      {selectedMovie && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedMovie(null)}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{selectedMovie.title}</h2>
            <p>Julkaisuvuosi: {selectedMovie.release_date?.slice(0, 4) || "n/a"}</p>

            
            <p>
              Keskiarvo:{" "}
              {"★".repeat(Math.round(averageRating)) +
                "☆".repeat(5 - Math.round(averageRating))}{" "}
              ({averageRating.toFixed(1)})
            </p>

            
            <div style={{ marginTop: "10px" }}>
              <h3>Anna arvostelu</h3>
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
                placeholder="Kirjoita arviosi..."
                rows={4}
                style={{ width: "100%", marginTop: "5px" }}
              />
              <button onClick={handleSubmit} style={{ marginTop: "5px" }}>
                Lähetä arvostelu
              </button>
            </div>

            
            <div style={{ marginTop: "20px" }}>
              <h3>Arvostelut</h3>
              {movieReviews.length === 0 ? (
                <p>Ei arvosteluja vielä.</p>
              ) : (
                movieReviews.map((review) => (
                  <div
                    key={review.id}
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "5px 0",
                    }}
                  >
                    <p>
                      <strong>{review.username}</strong> –{" "}
                      {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                    </p>
                    {review.review_text && <p>{review.review_text}</p>}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setSelectedMovie(null)}
              style={{ marginTop: "15px" }}
            >
              Sulje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}*/
