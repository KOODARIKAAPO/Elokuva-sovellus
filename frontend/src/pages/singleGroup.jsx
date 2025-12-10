import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import "./singleGroup.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const TMDB_BASE = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";

export function SingleGroup() {
  const { id } = useParams();
  const { token, currentUser, loadingUser } = useAuth();

  const [group, setGroup] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Lataa ryhmän tiedot ja suosikit
  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch(`${API_BASE}/groups/${id}`)
        .then(res => res.json())
        .then(data => setGroup(data)),
      fetch(`${API_BASE}/groups/${id}/favourites`)
        .then(res => res.json())
        .then(data => setFavourites(data || [])),
    ])
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    if (token) {
      loadMessages();
    }
  }, [id, token]);

  async function loadMessages() {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE}/groups/${id}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }

  // Tarkista jäsenyys
  useEffect(() => {
    if (!currentUser || !token) return;

    fetch(`${API_BASE}/groups/${id}/members`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(members => {
        const me = members.find(m => m.user_id === currentUser.id);
        if (me?.status === "approved") setIsMember(true);
        if (me?.status === "pending") setIsPending(true);

        if (group?.owner_id === currentUser.id) {
        setPendingRequests(members.filter(m => m.status === "pending"));
      }
    })
    .catch(err => console.error(err));
  }, [id, token, currentUser, group]);

  // Lähetä liittymispyyntö
  async function requestJoin() {
    if (!token) {
      setStatus("Kirjaudu sisään liittyäksesi ryhmään");
      return;
    }

    const res = await fetch(`${API_BASE}/groups/${id}/join`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const err = await res.json();
      setStatus(err.error || "Virhe liittymispyynnössä");
      return;
    }

    setStatus("Liittymispyyntö lähetetty!");
    setIsPending(true);
    setTimeout(() => setStatus(null), 3000);
  }

  // Poista elokuva ryhmästä
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
      setStatus("Sinun täytyy olla ryhmän jäsen poistaaksesi elokuvan");
    } else {
      setStatus("Elokuva poistettu ryhmästä");
      setFavourites(favourites.filter(fav => fav.tmdb_id !== tmdbId));
    }

    setTimeout(() => setStatus(null), 3000);
  }

  async function approve(userId) {
    const res = await fetch(`${API_BASE}/groups/${id}/approve/${userId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      setPendingRequests(pendingRequests.filter(r => r.user_id !== userId));
      setStatus(`Käyttäjä ${userId} hyväksytty!`);
    } else {
      const err = await res.json();
      setStatus(err.error || "Virhe hyväksyttäessä");
    }

    setTimeout(() => setStatus(null), 3000);
  }

  async function sendMessage(e) {
    e.preventDefault();
    
    if (!token) {
      setStatus("Kirjaudu sisään lähettääksesi viestejä!");
      return;
    }

    if (!newMessage.trim()) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/groups/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages([...messages, sentMessage]);
        setNewMessage("");
      } else {
        setStatus("Viestin lähetys epäonnistui");
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setStatus("Viestin lähetys epäonnistui");
      setTimeout(() => setStatus(null), 3000);
    }
  }

  async function deleteMessage(messageId) {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/groups/${id}/messages/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages(messages.filter(msg => msg.id !== messageId));
      } else {
        setStatus("Viestin poisto epäonnistui");
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  }

  if (loading) return <p>Ladataan...</p>;
  if (!group) return <p>Ryhmää ei löytynyt</p>;

  return (
    <div className="single-group">
      <h1>{group.name}</h1>

      {!isMember && currentUser && currentUser.id !== group.owner_id && (
        <button 
          onClick={requestJoin} 
          className="join-button"
          disabled={isPending}
        >
          {isPending ? "Liittymispyyntö lähetetty" : "Liity ryhmään"}
        </button>
      )}

      {status && <p className="status-message">{status}</p>}

      {currentUser?.id === group.owner_id && pendingRequests.length > 0 && ( 
        <div className="pending-requests"> <h3>Liittymispyynnöt:</h3>
         <ul>
           {pendingRequests.map(req => (
            <li key={req.user_id}>
               Käyttäjä {req.user_id}
                <button onClick={() => approve(req.user_id)}>Hyväksy</button>
              </li> ))}
            </ul>
            </div> )}

      <div>
        <h2>Ryhmän suosikkielokuvat</h2>
        {favourites.length === 0 ? (
          <p>Ei vielä elokuvia</p>
        ) : (
          <ul className="group-movie-list">
            {favourites.map(fav => (
              <GroupMovieItem
                key={fav.tmdb_id}
                tmdbId={fav.tmdb_id}
                onRemove={removeMovieFromGroup}
              />
            ))}
          </ul>
        )}
      </div>

      {token && (
        <div className="chat-section">
          <h2>Ryhmän chat</h2>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <p className="no-messages">Ei viestejä</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="chat-message">
                  <div className="message-header">
                    <strong className="message-sender">{msg.sender_name}</strong>
                    <span className="message-time">
                      {new Date(msg.sent_at).toLocaleString('fi-FI')}
                    </span>
                  </div>
                  <p className="message-text">{msg.message_text}</p>
                  <button 
                    onClick={() => deleteMessage(msg.id)} 
                    className="delete-message-btn"
                    title="Poista viesti"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
          <form onSubmit={sendMessage} className="chat-input-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Kirjoita viesti..."
              className="chat-input"
            />
            <button type="submit" className="send-button">Lähetä</button>
          </form>
        </div>
      )}
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
