import { useState } from "react";
import { useAuth } from "../AuthContext.jsx";

export default function MovieDetails({
  movie,
  onClose,
  isFavourite = false,
  review = null,
  onRemoveFavourite,
  showActions = true,
}) {
  if (!movie) return null;

  const { token } = useAuth();
  const [status, setStatus] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const rating = typeof movie.vote_average === "number" ? movie.vote_average : null;
  const tmdbId = movie.id ?? movie.tmdbId;

  async function addFavourite() {
    if (!tmdbId) {
      setStatus("Elokuvan tunnistetta ei löytynyt.");
      return;
    }
    if (!token) {
      setStatus("Kirjaudu sisään lisätäksesi suosikkeihin!");
      return;
    }

    setBusyAction("add");
    setStatus(null);

    const res = await fetch(`${API_BASE}/favourites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tmdbId }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(data.error || "Lisäys epäonnistui");
    } else {
      setStatus("Lisätty suosikkeihin!");
    }
    setBusyAction(null);
  }

  async function removeFavourite() {
    if (!tmdbId) {
      setStatus("Elokuvan tunnistetta ei löytynyt.");
      return;
    }
    if (!token) {
      setStatus("Kirjaudu sisään poistaaksesi suosikeista!");
      return;
    }

    setBusyAction("remove");
    setStatus(null);

    const res = await fetch(`${API_BASE}/favourites/${tmdbId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus(data.error || "Poisto epäonnistui");
    } else {
      setStatus("Poistettu suosikeista.");
      onRemoveFavourite?.(tmdbId);
    }
    setBusyAction(null);
  }

  return (
    <div className="movie-details">
      <button className="close" onClick={onClose} aria-label="Sulje tiedot">
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
          <h2>{movie.title || "Elokuvan tiedot"}</h2>
          {movie.release_date && <p>{movie.release_date.slice(0, 4)}</p>}
          {rating !== null && <p>Arvosana: {rating.toFixed(1)}/10</p>}
          {movie.overview && <p className="overview">{movie.overview}</p>}

          {review && (
            <div className="movie-review">
              <p>
                <strong>Oma arvosana:</strong> {"★".repeat(review.rating)}
                {"☆".repeat(Math.max(0, 5 - review.rating))}
              </p>
              {review.review_text && <p>{review.review_text}</p>}
            </div>
          )}

          {showActions && (
            <div className="movie-actions">
              {isFavourite && onRemoveFavourite ? (
                <button onClick={removeFavourite} disabled={busyAction === "remove"}>
                  {busyAction === "remove" ? "Poistetaan..." : "Poista suosikeista"}
                </button>
              ) : (
                <button onClick={addFavourite} disabled={busyAction === "add"}>
                  {busyAction === "add" ? "Lisätään..." : "⭐ Lisää suosikkeihin"}
                </button>
              )}
              {status && <p className="status">{status}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
