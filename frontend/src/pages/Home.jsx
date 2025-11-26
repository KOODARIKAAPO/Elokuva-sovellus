import { useState } from "react";
import Card from "../components/Card.jsx";
import MovieCarousel from "../components/MovieCarousel.jsx";
import SearchBar from "../components/SearchBar.jsx";
import MovieDetails from "../components/MovieDetails.jsx";

const TMDB_BASE = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";

export function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  async function handleSearch(query) {
    setSearchQuery(query);

    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    const baseUrl = TMDB_BASE;

    if (!apiKey) return;

    try {
      const response = await fetch(
        `${baseUrl}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`
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
              <div
                key={movie.id}
                className="search-result-item"
                onClick={() => setSelectedMovie(movie)}
              >
                {movie.title} ({movie.release_date?.slice(0, 4)})
              </div>
            ))}
          </div>
        )}

        {selectedMovie && (
          <MovieDetails movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
        )}

        <Card title="Tervetuloa Elokuvasovellukseen">
          <p>
            Täällä voit liittyä ryhmiin. Luoda suosikkilistoja ja vaihtaa ajatuksia muiden
            elokuvien ystävien kanssa!
          </p>
        </Card>
      </section>
    </>
  );
}
