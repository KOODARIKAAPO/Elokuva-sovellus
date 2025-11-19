import { useState } from "react";
import "./App.css";
import RegisterForm from "./components/RegisterForm.jsx";
import LoginForm from "./components/LoginForm.jsx";
import ApiEndpoints from "./components/ApiEndpoints.jsx";
import Card from "./components/Card.jsx";
import MovieCarousel from "./components/MovieCarousel.jsx";
import SearchBar from "./components/SearchBar.jsx";
import MovieDetails from "./components/MovieDetails.jsx";


const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

const emptyRegisterForm = {
  username: "",
  email: "",
  password: "",
};

const emptyLoginForm = {
  identifier: "",
  password: "",
};

function App() {
  const [registerForm, setRegisterForm] = useState({ ...emptyRegisterForm });
  const [loginForm, setLoginForm] = useState({ ...emptyLoginForm });
  const [registerStatus, setRegisterStatus] = useState(null);
  const [loginStatus, setLoginStatus] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const [authPanelOpen, setAuthPanelOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const apiDocs = {
    register: `${apiBaseUrl}/auth/register`,
    login: `${apiBaseUrl}/auth/login`,
  };

  async function sendRequest(endpoint, payload) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Tuntematon virhe");
    }
    return data;
  }

  async function handleRegister(event) {
    event.preventDefault();
    setBusyAction("register");
    setRegisterStatus(null);

    try {
      const result = await sendRequest(apiDocs.register, registerForm);
      setRegisterStatus({ type: "success", message: result.message || "Käyttäjä luotiin!" });
      setRegisterForm({ ...emptyRegisterForm });
    } catch (error) {
      setRegisterStatus({ type: "error", message: error.message });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setBusyAction("login");
    setLoginStatus(null);

    const payload = loginForm.identifier.includes("@")
      ? { email: loginForm.identifier, password: loginForm.password }
      : { username: loginForm.identifier, password: loginForm.password };

    try {
      const result = await sendRequest(apiDocs.login, payload);
      setLoginStatus({ type: "success", message: result.message || "Kirjauduttu sisään!" });
      setCurrentUser(result.user);
      setLoginForm({ ...emptyLoginForm });
    } catch (error) {
      setLoginStatus({ type: "error", message: error.message });
      setCurrentUser(null);
    } finally {
      setBusyAction(null);
    }
  }

  const isRegisterBusy = busyAction === "register";
  const isLoginBusy = busyAction === "login";
  const toggleAuthPanel = () => setAuthPanelOpen((open) => !open);

  async function handleSearch(query) {
  setSearchQuery(query);

  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const baseUrl = import.meta.env.VITE_TMDB_BASE_URL;

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
    <div className="app">
      <header className="app-header">
        <div className="header-copy">
          <h1>Elokuvasovelluksen hallintapaneeli</h1>
          <p>
            Etusivu tarjoaa yleiskatsauksen sovellukseen ja Autentikointi-osio sisältää
            kirjautumisen testilomakkeet.
          </p>
        </div>
        <button type="button" className="header-cta" onClick={toggleAuthPanel}>
          {authPanelOpen ? "Sulje autentikointi" : "Avaa autentikointi"}
        </button>
      </header>

      <main className="view">
        
        <MovieCarousel />
        
        
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
          <MovieDetails
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
          />
        )}


        <Card title="Tervetuloa Elokuvasovellukseen">
          <p>
            Tämä näkymä toimii sovelluksen etusivuna. Hallitse sovellusta ja tutki eri toimintoja
            oikean yläkulman painikkeen kautta avautuvista työkaluista sekä tulevista komponenteista.
          </p>
        </Card>
        <Card title="Ohjeita kehittäjälle">
          <p>
            Avaa autentikointi-lomakkeet yläreunan painikkeesta. Voit laajentaa kotinäkymää
            lisäämällä komponentteja, jotka kuvaavat esimerkiksi nykyisiä elokuvia,
            käyttöönotto-ohjeita tai muuta projektin kannalta oleellista sisältöä.
          </p>
        </Card>

        {authPanelOpen && (
          <section className="auth-panel">
            <div className="forms-grid">
              <RegisterForm
                formData={registerForm}
                disabled={isRegisterBusy}
                status={registerStatus}
                onChange={(field, value) =>
                  setRegisterForm((form) => ({ ...form, [field]: value }))
                }
                onSubmit={handleRegister}
              />
              <LoginForm
                formData={loginForm}
                disabled={isLoginBusy}
                status={loginStatus}
                currentUser={currentUser}
                onChange={(field, value) => setLoginForm((form) => ({ ...form, [field]: value }))}
                onSubmit={handleLogin}
              />
            </div>
            <ApiEndpoints endpoints={apiDocs} />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
