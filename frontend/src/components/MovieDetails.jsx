import React from "react";
import "./MovieDetails.css";

function MovieDetails({ movie, onClose }) {
  if (!movie) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{movie.title}</h2>
        <p>{movie.overview}</p>
        <p>Julkaisuvuosi: {movie.release_date?.slice(0, 4)}</p>
        <p>Arvosana: {movie.vote_average}</p>
        <button onClick={onClose}>Sulje</button>
      </div>
    </div>
  );
}

export default MovieDetails;
