

// src/pages/UserPage.jsx
import { useAuth } from "../AuthContext.jsx";
import { useEffect, useState } from "react";

export function UserPage() {
  const { currentUser, token } = useAuth();
  const [favourites, setFavourites] = useState([]);
  const [favouriteMovies, setFavouriteMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";

  useEffect(() => {
    if (!token) return;

    async function loadFavs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/favourites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Suosikkeja ei voitu ladata");

        setFavourites(data.favourites || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadFavs();
  }, [token]);

  // Hae TMDb-tiedot jokaiselle suosikille (julisteet ym.)
  useEffect(() => {
    async function loadMovieDetails() {
      if (!favourites.length) {
        setFavouriteMovies([]);
        return;
      }
      if (!TMDB_API_KEY) {
        setError("TMDb API -avain puuttuu");
        return;
      }

      try {
        const details = await Promise.all(
          favourites.map(async (fav) => {
            try {
              const res = await fetch(
                `${TMDB_BASE_URL}/movie/${fav.tmdb_id}?api_key=${TMDB_API_KEY}`
              );
              if (!res.ok) throw new Error("TMDb haku epäonnistui");
              const data = await res.json();
              return { tmdbId: fav.tmdb_id, data };
            } catch {
              return { tmdbId: fav.tmdb_id, data: null };
            }
          })
        );
        setFavouriteMovies(details);
      } catch (err) {
        setError(err.message);
      }
    }

    loadMovieDetails();
  }, [favourites, TMDB_API_KEY, TMDB_BASE_URL]);

  if (!currentUser)
    return <p>Kirjaudu sisään nähdäksesi profiilin.</p>;

  return (
    <div>
      <h1>Hei, {currentUser.username}!</h1>
      <h2>Suosikkielokuvasi</h2>

      {error && <p className="status error">{error}</p>}
      {loading && <p>Ladataan suosikkeja...</p>}
      {!loading && favourites.length === 0 && <p>Ei suosikkeja vielä.</p>}

      <div className="favourite-grid">
        {favouriteMovies.map(({ tmdbId, data }) => (
          <div key={tmdbId} className="favourite-card">
            {data?.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w185${data.poster_path}`}
                alt={data.title}
              />
            ) : (
              <div className="poster-placeholder">Ei julistetta</div>
            )}
            <div className="favourite-meta">
              <h3>{data?.title || `TMDb ID: ${tmdbId}`}</h3>
              {data?.release_date && <p>{data.release_date.slice(0, 4)}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
