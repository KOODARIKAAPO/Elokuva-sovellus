import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MovieDetails from "../components/MovieDetails.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";

export function SharedFavourites() {
  const { token } = useParams();
  const [owner, setOwner] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [favouriteMovies, setFavouriteMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Linkki puuttuu");
      setLoading(false);
      return;
    }

    async function loadShared() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/favourites/shared/${token}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Jakolistan haku epäonnistui");
        setOwner(data.owner || null);
        setFavourites(data.favourites || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadShared();
  }, [token]);

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
            const tmdbId = Number(fav.tmdb_id ?? fav.tmdbId ?? fav.id);
            try {
              const res = await fetch(
                `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`
              );
              if (!res.ok) throw new Error("TMDb haku epäonnistui");
              const data = await res.json();
              return { tmdbId, data };
            } catch {
              return { tmdbId, data: null };
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

  function handleOpenDetails(tmdbId) {
    const id = Number(tmdbId);
    const entry = favouriteMovies.find((m) => Number(m.tmdbId) === id);
    if (entry?.data) {
      setSelectedMovie({ ...entry.data, tmdbId: entry.tmdbId });
    } else {
      setSelectedMovie({
        id,
        tmdbId: id,
        title: `TMDb ID: ${id}`,
        overview: "Tietoja ei saatavilla.",
      });
    }
  }

  function handleCloseDetails() {
    setSelectedMovie(null);
  }

  const heading = owner ? `${owner.username}:n suosikit` : "Jaettu suosikkilista";

  return (
    <section className="card">
      <h1>{heading}</h1>
      {error && <p className="status error">{error}</p>}
      {loading && <p>Ladataan...</p>}
      {!loading && !error && favourites.length === 0 && <p>Ei suosikkeja.</p>}

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
              <button
                type="button"
                className="ghost-btn"
                onClick={() => handleOpenDetails(tmdbId)}
              >
                Näytä tiedot
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedMovie && (
        <div className="modal-backdrop" onClick={handleCloseDetails}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <MovieDetails
              movie={selectedMovie}
              showActions={false}
              onClose={handleCloseDetails}
            />
          </div>
        </div>
      )}
    </section>
  );
}
