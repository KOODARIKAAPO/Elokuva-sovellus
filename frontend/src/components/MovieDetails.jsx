import { useState } from "react";
import { useAuth } from "../AuthContext.jsx";

export default function MovieDetails({ movie, onClose }) {
  if (!movie) return null;

  const { token } = useAuth();
  const [status, setStatus] = useState(null);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const rating = typeof movie.vote_average === "number" ? movie.vote_average : null;

  async function addFavourite() {
    if (!token) {
      setStatus("Kirjaudu sisään lisätäksesi suosikkeihin!");
      return;
    }

    const res = await fetch(`${API_BASE}/favourites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tmdbId: movie.id }),
    });

    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error);
    } else {
      setStatus("Lisätty suosikkeihin!");
    }
  }

  return (
    <div className="movie-details">
      <button className="close" onClick={onClose}>
        ×
      </button>

      <div className="movie-meta">
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
            alt={movie.title}
          />
        ) : (
          <div className="poster-placeholder">Ei kuvaa</div>
        )}

        <div className="movie-text">
          <h2>{movie.title}</h2>
          {movie.release_date && <p>{movie.release_date.slice(0, 4)}</p>}
          {rating !== null && <p>Arvosana: {rating.toFixed(1)}/10</p>}
          {movie.overview && <p className="overview">{movie.overview}</p>}

          <button onClick={addFavourite}>⭐ Lisää suosikkeihin</button>
          {status && <p className="status">{status}</p>}
        </div>
      </div>
    </div>
  );
}
