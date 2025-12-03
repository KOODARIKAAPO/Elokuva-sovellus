import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext.jsx";

export default function ReviewModal({ movie, onClose }) {
  const { currentUser, token } = useAuth();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [movieReviews, setMovieReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

  useEffect(() => {
    if (!movie) return;

    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE}/reviews?tmdb_id=${movie.id}`);
        const data = await res.json();
        setMovieReviews(data);

        if (data.length > 0) {
          const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
          setAverageRating(avg);
        } else {
          setAverageRating(0);
        }

      } catch (error) {
        console.error(error);
      }
    };

    fetchReviews();
  }, [movie]);

  async function handleSubmit() {
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tmdb_id: movie.id,
          rating,
          review_text: text,
        }),
      });

      if (!res.ok) throw new Error("Tallennus epäonnistui");

      const newReview = await res.json();

      setMovieReviews((prev) => {
        const updated = [...prev, newReview];
        const avg = updated.reduce((s, r) => s + r.rating, 0) / updated.length;
        setAverageRating(avg);
        return updated;
      });

      setRating(0);
      setText("");

    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div
      onClick={onClose}
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
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg, #0f172a, #1b2435)",
          color: "#e2e8f0",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 14px 30px rgba(15, 23, 42, 0.28)",
          padding: "20px",
          borderRadius: "12px",
          width: "600px",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h2>{movie.title}</h2>
        <p>Vuosi: {movie.release_date?.slice(0, 4) || "n/a"}</p>

        <p>
          Keskiarvo:{" "}
          {"★".repeat(Math.round(averageRating)) +
            "☆".repeat(5 - Math.round(averageRating))}{" "}
          ({averageRating.toFixed(1)})
        </p>

        {currentUser ? (
          <>
            <h3>Anna arvostelu</h3>
            <div>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: "1.5rem",
                    color: star <= rating ? "gold" : "gray",
                    background: "none",
                    border: "none",
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
              placeholder="Kirjoita arvostelu..."
              rows={4}
              style={{ width: "100%", marginTop: "5px" }}
            />

            <button 
              onClick={handleSubmit} 
              style={{ marginTop: "5px", padding: "8px 16px", fontSize: "1rem" }}
            >
              Lähetä arvostelu
            </button>
          </>
        ) : (
          <p>Kirjaudu sisään antaaksesi arvostelun.</p>
        )}

        <h3 style={{ marginTop: "20px" }}>Arvostelut</h3>
        {movieReviews.length === 0 ? (
          <p>Ei arvosteluja vielä.</p>
        ) : (
          movieReviews.map((r) => (
            <div key={r.id} style={{ borderBottom: "1px solid #ddd", padding: "4px 0" }}>
              <p>
                <strong>{r.username}</strong> –{" "}
                {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
              </p>
              {r.review_text && <p>{r.review_text}</p>}
            </div>
          ))
        )}

        <button onClick={onClose} style={{ marginTop: "15px" }}>
          Sulje
        </button>
      </div>
    </div>
  );
}
