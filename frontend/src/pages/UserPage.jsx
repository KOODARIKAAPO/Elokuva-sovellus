// src/pages/UserPage.jsx
import { useAuth } from "../AuthContext.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieDetails from "../components/MovieDetails.jsx";

export function UserPage() {
  const { currentUser, token, login, logout } = useAuth();
  const navigate = useNavigate();
  const [favourites, setFavourites] = useState([]);
  const [favouriteMovies, setFavouriteMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
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
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const [shareStatus, setShareStatus] = useState(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [myGroups, setMyGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";
  const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
  const PASSWORD_PATTERN = PASSWORD_REGEX.source;
  const PASSWORD_REQUIREMENTS =
    "Salasanan tulee olla vähintään 8 merkkiä ja sisältää vähintään yhden ison kirjaimen sekä numeron.";

  // Alusta profiili
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        username: currentUser.username || "",
        email: currentUser.email || "",
      });
    }
  }, [currentUser]);

  // Hae suosikit
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

  // Hae käyttäjän arvostelut
  useEffect(() => {
    if (!token) return;

    async function loadReviews() {
      try {
        const res = await fetch(`${API_BASE}/reviews/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUserReviews(data || []);
      } catch (err) {
        console.error("Arvosteluiden haku epäonnistui", err);
      }
    }

    loadReviews();
  }, [token]);


  // Hae käyttäjän omistamat ryhmät
useEffect(() => {
  if (!currentUser) return;

  async function loadMyGroups() {
    try {
      const res = await fetch(`${API_BASE}/groups`);
      const data = await res.json();

      const mine = Array.isArray(data)
        ? data.filter(g => g.owner_id === currentUser.id)
        : [];

      setMyGroups(mine);
    } catch (err) {
      console.error("Ryhmien haku epäonnistui:", err);
    }
  }

  loadMyGroups();
}, [currentUser]);

// Hae käyttäjän liittymät ryhmät
useEffect(() => {
  if (!token) return;

  fetch(`${API_BASE}/groups/joined`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    })
    .then(data => setJoinedGroups(data))
    .catch(err => console.error(err));
}, [token]);


// Ryhmien poisto
async function handleDeleteGroup(groupId) {
  if (!confirm("Haluatko varmasti poistaa tämän ryhmän?")) return;

  try {
    const res = await fetch(`${API_BASE}/groups/${groupId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || "Ryhmän poisto epäonnistui");
    }

    setMyGroups((prev) => prev.filter((g) => g.id !== groupId));
  } catch (err) {
    alert(err.message);
  }
}

// Poistu ryhmästä
async function handleLeaveGroup(groupId) {
  if (!confirm("Haluatko varmasti poistua ryhmästä?")) return;

  try {
    const res = await fetch(`${API_BASE}/groups/${groupId}/leave`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Poistuminen epäonnistui");
    }

    setJoinedGroups((prev) => prev.filter((g) => g.id !== groupId));

  } catch (err) {
    alert(err.message);
  }
}

  // Hae TMDb-tiedot jokaiselle suosikille
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
              const review = userReviews.find((r) => r.tmdb_id === fav.tmdb_id);
              return { tmdbId: fav.tmdb_id, data, review };
            } catch {
              return { tmdbId: fav.tmdb_id, data: null, review: null };
            }
          })
        );
        setFavouriteMovies(details);
      } catch (err) {
        setError(err.message);
      }
    }

    loadMovieDetails();
  }, [favourites, userReviews, TMDB_API_KEY, TMDB_BASE_URL]);

  function handleOpenDetails(tmdbId) {
    const id = Number(tmdbId);
    const entry = favouriteMovies.find((m) => Number(m.tmdbId) === id);

    if (entry?.data) {
      // include tmdbId so removal works even if TMDb data uses a different key
      setSelectedMovie({ ...entry.data, tmdbId: entry.tmdbId });
      setSelectedReview(entry.review || null);
    } else {
      setSelectedMovie({
        id,
        tmdbId: id,
        title: `TMDb ID: ${id}`,
        overview: "Tietoja ei saatavilla.",
      });
      setSelectedReview(null);
    }
  }

  function handleCloseDetails() {
    setSelectedMovie(null);
    setSelectedReview(null);
  }

  function handleFavouriteRemoved(tmdbId) {
    const targetId = Number(tmdbId);
    setFavourites((prev) =>
      prev.filter((fav) => Number(fav.tmdb_id ?? fav.tmdbId ?? fav.id) !== targetId)
    );
    setFavouriteMovies((prev) => prev.filter((m) => Number(m.tmdbId) !== targetId));
    handleCloseDetails();
  }

  function buildShareUrl(tokenValue) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return tokenValue ? `${origin}/shared/${tokenValue}` : "";
  }

  async function handleShare(regenerate = false) {
    if (!token) return;
    setShareBusy(true);
    setShareStatus(null);

    try {
      const res = await fetch(`${API_BASE}/favourites/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ regenerate }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.token) {
        throw new Error(data.error || "Linkin luonti epäonnistui");
      }
      const url = buildShareUrl(data.token);
      setShareLink(url);
      setShareStatus({
        type: "success",
        message: regenerate ? "Uusi jakolinkki luotu" : "Jakolinkki luotu",
      });
    } catch (err) {
      setShareStatus({ type: "error", message: err.message });
    } finally {
      setShareBusy(false);
    }
  }

  async function handleCopyShare() {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setShareStatus({ type: "success", message: "Linkki kopioitu leikepöydälle" });
    } catch {
      setShareStatus({ type: "error", message: "Kopiointi epäonnistui" });
    }
  }

  // Profiilin päivitys
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

  // Salasanan vaihto
  async function handlePasswordUpdate(event) {
    event.preventDefault();
    if (!token) return;
    setPasswordStatus(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: "error", message: "Uusi salasana ja varmistus eivät täsmää" });
      return;
    }

    if (!PASSWORD_REGEX.test(passwordForm.newPassword)) {
      setPasswordStatus({ type: "error", message: PASSWORD_REQUIREMENTS });
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

  // Tilin poisto
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

  if (!currentUser) return <p>Kirjaudu sisään nähdäksesi profiilin.</p>;

  const stats = [
    { label: "Suosikit", value: favourites.length },
    { label: "Arviot", value: userReviews.length },
  ];

  return (
    <div className="user-page">
      <section className="card user-hero">
        <div className="user-hero__text">
          <p className="eyebrow">Profiili</p>
          <h1>Hei, {currentUser.username}!</h1>
          <p className="hint">
            Hallinnoi tiliäsi, selaa suosikkielokuviasi ja jaa lista helposti kavereille.
          </p>
          <div className="stat-pills">
            {stats.map((stat) => (
              <div key={stat.label} className="pill">
                <span className="pill__value">{stat.value}</span>
                <span className="pill__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="user-hero__actions">
          <button type="button" className="ghost-btn" onClick={() => setAccountOpen(true)}>
            Hallinnoi tiliä
          </button>
        </div>
      </section>

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
                    pattern={PASSWORD_PATTERN}
                    title={PASSWORD_REQUIREMENTS}
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
                    pattern={PASSWORD_PATTERN}
                    title={PASSWORD_REQUIREMENTS}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
                    }
                    required
                  />
                </label>
                <p className="hint">{PASSWORD_REQUIREMENTS}</p>
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

      <section className="card favourites-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Suosikit</p>
            <h2>Suosikkielokuvasi</h2>
            <p className="hint">Selaa suosikkejasi, avaa tiedot ja poista tarvittaessa.</p>
          </div>
        </div>

      {error && <p className="status error">{error}</p>}
      {loading && <p>Ladataan suosikkeja...</p>}
      {!loading && favourites.length === 0 && <p>Ei suosikkeja vielä.</p>}

      <div className="favourite-grid">
        {favouriteMovies.map(({ tmdbId, data, review }) => (
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

              {review ? (
                <div className="user-review">
                  <p>
                    Tähdet: {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </p>
                  {review.review_text && <p>{review.review_text}</p>}
                </div>
              ) : (
                <p>Et ole arvostellut tätä elokuvaa</p>
              )}
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
      </section>

      <section className="card share-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Jaa</p>
            <h2>Jaa suosikkilista</h2>
            <p className="hint">
              Luo linkki, jonka avulla muut voivat nähdä suosikkisi. Voit luoda uuden linkin ja
              mitätöidä vanhan.
            </p>
          </div>
        </div>
        <div className="share-actions">
          <button type="button" onClick={() => handleShare(false)} disabled={shareBusy}>
            {shareBusy ? "Luodaan..." : shareLink ? "Hae jakolinkki" : "Luo jakolinkki"}
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => handleShare(true)}
            disabled={shareBusy}
          >
            {shareBusy ? "Luodaan..." : "Luo uusi linkki"}
          </button>
        </div>
        {shareLink && (
          <div className="share-link-row">
            <input type="text" readOnly value={shareLink} />
            <button type="button" onClick={handleCopyShare}>
              Kopioi
            </button>
          </div>
        )}
        {shareStatus && <p className={`status ${shareStatus.type}`}>{shareStatus.message}</p>}
      </section>

 <section className="card">
  <p className="eyebrow">Ryhmät</p>
  <h2>Sinun luomasi ryhmät</h2>

  {myGroups.length === 0 ? (
    <p>Et ole vielä luonut ryhmiä.</p>
  ) : (
    <div className="groups-list">
      {myGroups.map((group) => (
        <div
          key={group.id}
          className="group-item"
          style={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            onClick={() => navigate(`/groups/${group.id}`)}
            style={{ cursor: "pointer", fontWeight: "bold" }}
          >
            {group.name}
          </span>

          <button
            type="button"
            onClick={() => handleDeleteGroup(group.id)}
            className="danger-btn"
            style={{ marginLeft: "1rem" }}
          >
            Poista
          </button>
        </div>
      ))}
    </div>
  )}
</section>

<section className="card">
  <p className="eyebrow">Ryhmät</p>
  <h2>Ryhmät, joihin olet liittynyt</h2>

  {Array.isArray(joinedGroups) && joinedGroups.length > 0 ? (
    joinedGroups.map(group => (
      <div key={group.id} className="group-item">
        <span
          onClick={() => navigate(`/groups/${group.id}`)}
          style={{ cursor: "pointer", fontWeight: "bold" }}
        >
          {group.name}
        </span>

        <button
          className="danger-btn"
          style={{ marginLeft: "1rem" }}
          onClick={() => handleLeaveGroup(group.id)}
        >
          Poistu
        </button>
      </div>
    ))
  ) : (
    <p>Et ole liittynyt vielä mihinkään ryhmään</p>
  )}
</section>

      {selectedMovie && (
        <div className="modal-backdrop" onClick={handleCloseDetails}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <MovieDetails
              movie={selectedMovie}
              review={selectedReview}
              isFavourite
              onRemoveFavourite={handleFavouriteRemoved}
              onClose={handleCloseDetails}
            />
          </div>
        </div>
      )}
    </div>
  );
}
