import { useState } from "react";
import Card from "../components/Card.jsx";
import MovieCarousel from "../components/MovieCarousel.jsx";
import SearchBar from "../components/SearchBar.jsx";
import MovieDetails from "../components/MovieDetails.jsx";
import ReviewModal from "../components/Review.jsx";

const TMDB_BASE = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";

export function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  function openMovie(movie) {
    setSelectedMovie(movie);
    setShowMovieModal(true);
  }

  async function handleSearch(query) {
    setSearchQuery(query);
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) return;

    try {
      const response = await fetch(
        `${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Haku epäonnistui TMDb:stä");

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error(error);
      setSearchResults([]);
    }
  }

  return (
    <>
      <section className="card home-hero">
        <h1>ABSOLUTE CINEMA</h1>
        <p className="hint">Tervetuloa etusivulle.</p>
      </section>

      <section className="view">


        <MovieCarousel onSelectMovie={openMovie} />


        <Card className="search-shell">
          <SearchBar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onSearch={handleSearch}
            onSelectMovie={openMovie}
          />


          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((movie) => (
                <div key={movie.id} className="search-result-item">
                  <div
                    onClick={() => openMovie(movie)}
                    style={{
                      cursor: "pointer",
                      fontWeight:
                        selectedMovie?.id === movie.id ? "bold" : "normal",
                    }}
                  >
                    {movie.title} ({movie.release_date?.slice(0, 4) || "n/a"})
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>



      </section>


      {showMovieModal && selectedMovie && (
        <div
          onClick={() => setShowMovieModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: showReviewModal ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.5)",
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
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 14px 30px rgba(15, 23, 42, 0.28)",
              width: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
              filter: showReviewModal ? "blur(2px)" : "none",
              transition: "filter 0.2s",
            }}
          >
            <MovieDetails
              movie={selectedMovie}
              onClose={() => setShowMovieModal(false)}
              showActions={true}
            />

            <div style={{ marginTop: "10px", textAlign: "center" }}>
              <button
                onClick={() => setShowReviewModal(true)}
                className="modal-cta"
              >
                Siirry arvosteluihin
              </button>
            </div>

            <button
              onClick={() => setShowMovieModal(false)}
              style={{ marginTop: "15px" }}
            >
              Sulje
            </button>
          </div>
        </div>
      )}


      {showReviewModal && selectedMovie && (
        <ReviewModal
          movie={selectedMovie}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </>
  );
}
