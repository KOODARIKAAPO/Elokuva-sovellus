

// src/pages/UserPage.jsx
import { useAuth } from "../AuthContext.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function UserPage() {
  const { currentUser, token, login, logout } = useAuth();
  const navigate = useNavigate();
  const [favourites, setFavourites] = useState([]);
  const [favouriteMovies, setFavouriteMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileForm, setProfileForm] = useState({ username: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileStatus, setProfileStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [deleteArmed, setDeleteArmed] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        username: currentUser.username || "",
        email: currentUser.email || "",
      });
    }
  }, [currentUser]);

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

  async function handleProfileUpdate(event) {
    event.preventDefault();
    if (!token) return;
    setProfileStatus(null);
    setBusyAction("profile");

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Päivitys epäonnistui");

      // Päivitä AuthContext uuteen tokeniin, jos tuli mukana
      if (data.user && (data.token || token)) {
        login(data.user, data.token || token);
      }

      setProfileStatus({ type: "success", message: "Profiili päivitetty" });
    } catch (err) {
      setProfileStatus({ type: "error", message: err.message });
    } finally {
      setBusyAction(null);
    }
  }

  async function handlePasswordUpdate(event) {
    event.preventDefault();
    if (!token) return;
    setPasswordStatus(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: "error", message: "Uusi salasana ja varmistus eivät täsmää" });
      return;
    }

    setBusyAction("password");
    try {
      const res = await fetch(`${API_BASE}/auth/me/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Salasanan vaihto epäonnistui");

      if (data.user && (data.token || token)) {
        login(data.user, data.token || token);
      }

      setPasswordStatus({ type: "success", message: "Salasana vaihdettu" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordStatus({ type: "error", message: err.message });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDeleteAccount() {
    if (!token) return;

    if (!deleteArmed) {
      setDeleteArmed(true);
      return;
    }

    setBusyAction("delete");
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Tilin poisto epäonnistui");

      navigate("/");
      window.alert("Tili poistettu. Omistamasi ryhmät poistettiin.");
      logout();
    } catch (err) {
      setProfileStatus({ type: "error", message: err.message });
    } finally {
      setBusyAction(null);
      setAccountOpen(false);
      setDeleteArmed(false);
    }
  }

  if (!currentUser)
    return <p>Kirjaudu sisään nähdäksesi profiilin.</p>;

  return (
    <div>
      <div className="user-header">
        <div>
          <h1>Hei, {currentUser.username}!</h1>
        </div>
        <button type="button" className="ghost-btn" onClick={() => setAccountOpen(true)}>
          Hallinnoi tiliä
        </button>
      </div>

      {accountOpen && (
        <div className="modal-backdrop" onClick={() => setAccountOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Hallinnoi tiliä</h2>
              <button
                type="button"
                className="icon-button"
                onClick={() => setAccountOpen(false)}
                aria-label="Sulje"
              >
                ×
              </button>
            </div>
            <div className="account-grid">
              <form className="card" onSubmit={handleProfileUpdate}>
                <h3>Profiilin tiedot</h3>
                <label>
                  Käyttäjänimi
                  <input
                    type="text"
                    value={profileForm.username}
                    minLength={3}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, username: e.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Sähköposti
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                  />
                </label>
                <button type="submit" disabled={busyAction === "profile"}>
                  {busyAction === "profile" ? "Tallennetaan..." : "Tallenna muutokset"}
                </button>
                {profileStatus && (
                  <p className={`status ${profileStatus.type}`}>{profileStatus.message}</p>
                )}
              </form>

              <form className="card" onSubmit={handlePasswordUpdate}>
                <h3>Vaihda salasana</h3>
                <label>
                  Nykyinen salasana
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Uusi salasana
                  <input
                    type="password"
                    minLength={8}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Vahvista uusi salasana
                  <input
                    type="password"
                    minLength={8}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
                    }
                    required
                  />
                </label>
                <button type="submit" disabled={busyAction === "password"}>
                  {busyAction === "password" ? "Vaihdetaan..." : "Vaihda salasana"}
                </button>
                {passwordStatus && (
                  <p className={`status ${passwordStatus.type}`}>{passwordStatus.message}</p>
                )}
              </form>
            </div>

            <div className="card danger-zone">
              <h3>Tilin poisto</h3>
              <p className="hint">
                Tilin poistaminen poistaa myös omistamasi ryhmät. Aiemmat viestit ja arviot voivat
                säilyä.
              </p>
              {deleteArmed && (
                <p className="status error">
                  Varoitus: tämä poistaa tilisi pysyvästi ja omistamasi ryhmät.
                </p>
              )}
              <button
                type="button"
                className="danger-btn"
                disabled={busyAction === "delete"}
                onClick={handleDeleteAccount}
              >
                {busyAction === "delete"
                  ? "Poistetaan..."
                  : deleteArmed
                  ? "Vahvista tilin poisto"
                  : "Poista tili"}
              </button>
            </div>
          </div>
        </div>
      )}

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
