import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import "./singleGroup.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const TMDB_BASE = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";

export function SingleGroup() {
  const { id } = useParams();
  const { token } = useAuth();
  const [group, setGroup] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/groups/${id}`)
        .then(res => res.json())
        .then(data => setGroup(data)),
      fetch(`${API_BASE}/groups/${id}/favourites`)
        .then(res => res.json())
        .then(data => setFavourites(data || []))
    ])
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, [id]);

  async function removeMovieFromGroup(tmdbId) {
    if (!token) {
      setStatus("Kirjaudu sisään poistaaksesi elokuvan!");
      return;
    }

    const response = await fetch(`${API_BASE}/groups/${id}/favourites/${tmdbId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      setStatus("Poisto epäonnistui");
    } else {
      setStatus("Elokuva poistettu ryhmästä");
      setFavourites(favourites.filter(fav => fav.tmdb_id !== tmdbId));
    }
    
    setTimeout(() => setStatus(null), 3000);
  }

  if (loading) return <p>Ladataan...</p>;
  if (!group) return <p>Ryhmää ei löytynyt</p>;

  return (
    <div className="single-group">
      <h1>{group.name}</h1>

      {status && <p className="status-message">{status}</p>}

      <div>
        <h2>Ryhmän suosikkielokuvat</h2>
        {favourites.length === 0 ? (
          <p>Ei vielä elokuvia</p>
        ) : (
          <ul className="group-movie-list">
            {favourites.map((fav) => (
              <GroupMovieItem
                key={fav.tmdb_id}
                tmdbId={fav.tmdb_id}
                onRemove={removeMovieFromGroup}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function GroupMovieItem({ tmdbId, onRemove }) {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetch(`${TMDB_BASE}/movie/${tmdbId}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`)
      .then(res => res.json())
      .then(data => setMovie(data))
      .catch(err => console.error(err));
  }, [tmdbId]);

  if (!movie) return <li>Ladataan...</li>;

  return (
    <li className="group-movie-item">
      <div className="group-movie-left">
        {movie.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
            alt={movie.title}
            className="group-movie-poster"
          />
        )}
        <div>
          <strong>{movie.title}</strong>
          {movie.release_date && <p className="release-year">{movie.release_date.slice(0, 4)}</p>}
        </div>
      </div>
      <button onClick={() => onRemove(tmdbId)} className="remove-button">Poista</button>
    </li>
  );
}