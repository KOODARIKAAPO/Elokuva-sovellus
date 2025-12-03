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
  const [showReviewModal, setShowReviewModal] = useState(false);

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
      <header className="app-header">
        <div className="header-copy">
          <h1>ABSOLUTE CINEMA</h1>
          <p>Tervetuloa etusivulle.</p>
        </div>
      </header>

      <section className="view">
        <MovieCarousel onSelectMovie={setSelectedMovie} />

        <SearchBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onSearch={handleSearch}
          onSelectMovie={setSelectedMovie}
        />

        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((movie) => (
              <div key={movie.id} className="search-result-item">
                <div
                  onClick={() => setSelectedMovie(movie)}
                  style={{ cursor: "pointer", fontWeight: selectedMovie?.id === movie.id ? "bold" : "normal" }}
                >
                  {movie.title} ({movie.release_date?.slice(0, 4) || "n/a"})
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedMovie && (
          <div>
            <MovieDetails movie={selectedMovie} onClose={() => setSelectedMovie(null)} />

            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <button
                onClick={() => setShowReviewModal(true)}
                style={{ padding: "8px 16px", fontSize: "1rem" }}
              >
                Siirry arvosteluihin
              </button>
            </div>
          </div>
        )}
        
      </section>

      {showReviewModal && selectedMovie && (
        <ReviewModal
          movie={selectedMovie}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </>
  );
}
