import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import "./singleGroup.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const TMDB_BASE = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";

export function SingleGroup() {
  const { id } = useParams();
  const { token, currentUser } = useAuth();

  const [group, setGroup] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Lataa ryhmä, suosikit ja viestit
  useEffect(() => {
  if (!token) {
    setLoading(false);
    return;
  }

  setLoading(true);

  Promise.all([
    fetch(`${API_BASE}/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch group");
        return res.json();
      })
      .then(data => setGroup(data)),

    fetch(`${API_BASE}/groups/${id}/favourites`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch favourites");
        return res.json();
      })
      .then(data => setFavourites(data || [])),
  ])
  .catch(err => console.error(err))
  .finally(() => setLoading(false));

  loadMessages();
}, [id, token]);

useEffect(() => {
  if (!token || !group) return;

  fetch(`${API_BASE}/groups/${id}/members`, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.json())
    .then(data => {
      const memberList = data || [];

      if (group.owner_id && !memberList.some(m => m.user_id === group.owner_id)) {
        memberList.push({
          user_id: group.owner_id,
          username: group.owner_name || "Omistaja",
          status: "owner",
          role: "owner",
        });
      }

      setMembers(memberList);
    })
    .catch(err => console.error("Failed to fetch members:", err));

}, [id, token, group]);

  // Hae viestit
  async function loadMessages() {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/groups/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }

  useEffect(() => {
    if (!token || !currentUser || !group) return;

    const fetchMembership = async () => {
      try {
        const res = await fetch(`${API_BASE}/groups/${id}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch members");
        const members = await res.json();

        const me = members.find(m => m.user_id === currentUser.id);
        setIsMember(me?.status === "approved");
        setIsPending(me?.status === "pending");

        if (group.owner_id === currentUser.id) {
          setPendingRequests(members.filter(m => m.status === "pending"));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchMembership(); 
    const interval = setInterval(fetchMembership, 3000);

    return () => clearInterval(interval);
  }, [id, token, currentUser, group]);

  // Poista jäsen
  async function removeMember(userId) {
  try {
    const res = await fetch(`${API_BASE}/groups/${id}/members/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      setMembers(members.filter(m => m.user_id !== userId));
    } else {
      const err = await res.json();
      console.error(err.error || "Failed to remove member");
    }
  } catch (err) {
    console.error(err);
  }
}

  // Poista elokuva ryhmästä
  async function removeMovieFromGroup(tmdbId) {
    if (!token) {
      setStatus("Kirjaudu sisään poistaaksesi elokuvan!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/groups/${id}/favourites/${tmdbId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        setStatus("Sinun täytyy olla ryhmän jäsen poistaaksesi elokuvan");
      } else {
        setFavourites(favourites.filter(fav => fav.tmdb_id !== tmdbId));
        setStatus("Elokuva poistettu ryhmästä");
      }
    } catch (err) {
      console.error(err);
      setStatus("Poisto epäonnistui");
    } finally {
      setTimeout(() => setStatus(null), 3000);
    }
  }

  // Hyväksy liittymispyyntö
  async function approve(userId) {
    try {
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
    } catch (err) {
      console.error(err);
      setStatus("Virhe hyväksyttäessä");
    } finally {
      setTimeout(() => setStatus(null), 3000);
    }
  }

  // Hylkää liittymispyyntö
  async function reject(userId) {
    try {
      const res = await fetch(`${API_BASE}/groups/${id}/reject/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setPendingRequests(pendingRequests.filter(r => r.user_id !== userId));
        setStatus(`Käyttäjä ${userId} hylätty!`);
      } else {
        const err = await res.json();
        setStatus(err.error || "Virhe hylättäessä");
      }
    } catch (err) {
      console.error(err);
      setStatus("Virhe hylättäessä käyttäjää");
    } finally {
      setTimeout(() => setStatus(null), 3000);
    }
  }

  // Lähetä viesti
  async function sendMessage(e) {
    e.preventDefault();
    if (!token || !newMessage.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/groups/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
      });

      if (res.ok) {
        const sentMessage = await res.json();
        setMessages([...messages, sentMessage]);
        setNewMessage("");
      } else {
        setStatus("Viestin lähetys epäonnistui");
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setStatus("Viestin lähetys epäonnistui");
      setTimeout(() => setStatus(null), 3000);
    }
  }

  // Poista viesti
  async function deleteMessage(messageId) {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/groups/${id}/messages/${messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) setMessages(messages.filter(msg => msg.id !== messageId));
      else setStatus("Viestin poisto epäonnistui");
    } catch (err) {
      console.error(err);
      setStatus("Viestin poisto epäonnistui");
    } finally {
      setTimeout(() => setStatus(null), 3000);
    }
  }

  if (loading) return <p>Ladataan...</p>;
  if (!group) return <p>Ryhmää ei löytynyt</p>;

  return (
    <div className="single-group">
      <h1>{group.name}</h1>
      {status && <p className="status-message">{status}</p>}

      {currentUser?.id === group.owner_id && pendingRequests.length > 0 && (
        <div className="pending-requests">
  <h3>Liittymispyynnöt:</h3>
  <ul>
    {pendingRequests.map(req => (
      <li key={req.user_id}>
        {req.username || `Käyttäjä ${req.user_id}`} 
        <button onClick={() => approve(req.user_id)}>Hyväksy</button>
        <button onClick={() => reject(req.user_id)} style={{ marginLeft: "5px" }}>
          Hylkää
        </button>
      </li>
    ))}
  </ul>
</div>
      )}

<div className="member-card">
  <h2>Ryhmän jäsenet</h2>

  {members.length === 0 ? (
    <p>Ei jäseniä</p>
  ) : (
    <ul className="member-list">
  {members
    .filter(m => m.status === "approved" || m.status === "owner")
    .map(member => (
      <li key={member.user_id} className="member-item">
        {member.username || `Käyttäjä ${member.user_id}`}
        {member.user_id === group?.owner_id && <span className="owner-tag"> (Omistaja) </span>}

        {currentUser?.id === group?.owner_id && member.user_id !== group?.owner_id && (
          <button
     onClick={() => {
    const confirmed = window.confirm(`Haluatko varmasti poistaa jäsenen ${member.username}?`);
    if (confirmed) {
      removeMember(member.user_id);
    }
  }}
>
  Poista jäsen
</button>
        )}
      </li>
    ))}
</ul>
  )}
</div>

      <div>
        <h2>Ryhmän suosikkielokuvat</h2>
        {favourites.length === 0 ? <p>Ei vielä elokuvia</p> : (
          <ul className="group-movie-list">
            {favourites.map(fav => (
              <GroupMovieItem key={fav.tmdb_id} tmdbId={fav.tmdb_id} onRemove={removeMovieFromGroup} />
            ))}
          </ul>
        )}
      </div>

      {token && (
        <div className="chat-section">
          <h2>Ryhmän chat</h2>
          <div className="chat-messages">
            {messages.length === 0 ? <p className="no-messages">Ei viestejä</p> : messages.map(msg => (
              <div key={msg.id} className="chat-message">
                <div className="message-header">
                  <strong>{msg.sender_name}</strong>
                  <span>{new Date(msg.sent_at).toLocaleString('fi-FI')}</span>
                </div>
                <p>{msg.message_text}</p>
                <button onClick={() => deleteMessage(msg.id)} title="Poista viesti">×</button>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="chat-input-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Kirjoita viesti..."
            />
            <button type="submit">Lähetä</button>
          </form>
        </div>
      )}
    </div>
  );
}

// Komponentti yksittäiselle elokuvalle
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
        {movie.poster_path && <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt={movie.title} />}
        <div>
          <strong>{movie.title}</strong>
          {movie.release_date && <p>{movie.release_date.slice(0, 4)}</p>}
        </div>
      </div>
      <button onClick={() => onRemove(tmdbId)}>Poista</button>
    </li>
  );
}