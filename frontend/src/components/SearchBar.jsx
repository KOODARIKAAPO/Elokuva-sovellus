import { useState, useEffect } from "react";

const MovieSearch = ({ query: propQuery = "", onQueryChange, onSelectMovie }) => {
  const [query, setQuery] = useState(propQuery || "");
  const [filter, setFilter] = useState("movie");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiKey = import.meta.env.VITE_TMDB_API_KEY || "";

  
  useEffect(() => {
    if (typeof propQuery === "string" && propQuery !== query) setQuery(propQuery);
    
  }, [propQuery]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchTMDB();
    }, 500);

    return () => clearTimeout(timeoutId);
    
  }, [query, filter]);

  const searchTMDB = async () => {
    if (!apiKey) return;
    setLoading(true);
    let url = "";

    if (filter === "movie") {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=fi-FI`;
    } else if (filter === "tv") {
      url = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=fi-FI`;
    } else if (filter === "person") {
      url = `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=fi-FI`;
    } else if (filter === "director") {
    
      url = `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=fi-FI`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (filter === "director" || filter === "person") {
        
        const people = data.results || [];
        const toEnrich = people.slice(0, 5);

        const enriched = await Promise.all(
          toEnrich.map(async (p) => {
            try {
              const creditsRes = await fetch(
                `https://api.themoviedb.org/3/person/${p.id}/movie_credits?api_key=${apiKey}&language=fi-FI`
              );
              const credits = await creditsRes.json();
              const movies = (credits && credits.cast) || [];
              const directed = (credits && credits.crew) || [];
              const directedMovies = directed.filter((c) => c.job === "Director");
              return { ...p, movies: movies, directed: directedMovies };
            } catch (err) {
              return { ...p, movies: [], directed: [] };
            }
          })
        );

       
        const rest = people.slice(5);
        const final = enriched.concat(rest);

        if (filter === "director") {
         
          setResults(final.filter((p) => (p.directed || []).length > 0));
        } else {
          setResults(final);
        }
      } else {
        setResults(data.results || []);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = (item) => {
    if (filter === "movie" || filter === "tv") {
      const poster = item.poster_path
        ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
        : "https://via.placeholder.com/300x450?text=Ei+kuvaa";

      return (
        <div key={item.id} style={{ width: "200px", textAlign: "center" }}>
          <img
            src={poster}
            style={{ width: "100%", borderRadius: "8px", cursor: onSelectMovie ? "pointer" : "default" }}
            onClick={() => typeof onSelectMovie === "function" && onSelectMovie(item)}
          />
          <h3>{item.title || item.name}</h3>
          <p onClick={() => typeof onSelectMovie === "function" && onSelectMovie(item)} style={{ cursor: onSelectMovie ? "pointer" : "default" }}>
            {item.release_date || item.first_air_date}
          </p>
        </div>
      );
    }

   
    const photo = item.profile_path
      ? `https://image.tmdb.org/t/p/w300${item.profile_path}`
      : "https://via.placeholder.com/300x450?text=Ei+kuvaa";

    const personMovies = (item.movies && item.movies.length) ? item.movies : [];
    const directedMovies = (item.directed && item.directed.length) ? item.directed : [];

    return (
      <div key={item.id} style={{ width: "100%", maxWidth: "600px", textAlign: "left", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
          <img
            src={photo}
            style={{ width: "120px", borderRadius: "8px", cursor: onSelectMovie ? "pointer" : "default" }}
            onClick={() => typeof onSelectMovie === "function" && onSelectMovie(item)}
          />
          <div>
            <h3 style={{ margin: 0 }}>{item.name}</h3>
            <p style={{ margin: "4px 0" }}>{item.known_for_department}</p>
            {item.biography && <p style={{ marginTop: 8 }}>{item.biography}</p>}
          </div>
        </div>

        { }
        {(personMovies.length > 0 || directedMovies.length > 0) && (
          <div style={{ marginTop: 12 }}>
            <h4 style={{ margin: "8px 0" }}>Elokuvat</h4>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
              {(personMovies.length > 0 ? personMovies : directedMovies)
                .slice(0, 12)
                .map((m) => {
                  const poster = m.poster_path
                    ? `https://image.tmdb.org/t/p/w200${m.poster_path}`
                    : "https://via.placeholder.com/200x300?text=Ei+kuvaa";
                  return (
                    <div
                      key={m.id}
                      style={{
                        width: 120,
                        textAlign: "center",
                        cursor: onSelectMovie ? "pointer" : "default",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                      onClick={() => typeof onSelectMovie === "function" && onSelectMovie(m)}
                    >
                      <img
                        src={poster}
                        alt={m.title || m.name}
                        style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 6 }}
                      />
                      <div
                        style={{
                          fontSize: 12,
                          marginTop: 6,
                          width: "100%",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={m.title || m.name}
                      >
                        {m.title || m.name}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2>Hae TMDb:stä</h2>

      <input
        type="text"
        value={query}
        placeholder="Etsi..."
        onChange={(e) => {
          const v = e.target.value;
          setQuery(v);
          if (typeof onQueryChange === "function") onQueryChange(v);
        }}
        style={{ padding: "8px", width: "300px", marginRight: "10px" }}
      />

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ padding: "8px" }}
      >
        <option value="movie">Elokuvat</option>
        <option value="tv">Sarjat</option>
        <option value="person">Näyttelijät</option>
        <option value="director">Ohjaajat</option>
      </select>

      {loading && <p>Haetaan...</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "20px" }}>
        {Array.isArray(results) && results.map(renderItem)}
      </div>
    </div>
  );
};

export default MovieSearch;
