import { useState } from "react";
import "./App.css";

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

  return (
    <div className="app">
      <header>
        <h1>Create user ja login</h1>
        <p>Rekisteröi uusi käyttäjä ja kirjaudu sisään testataksesi APIa.</p>
      </header>

      <section className="card">
        <h2>Luo käyttäjä</h2>
        <form className="form" onSubmit={handleRegister}>
          <label>
            Käyttäjänimi
            <input
              type="text"
              name="username"
              minLength={3}
              value={registerForm.username}
              onChange={(e) => setRegisterForm((f) => ({ ...f, username: e.target.value }))}
              required
            />
          </label>
          <label>
            Sähköposti
            <input
              type="email"
              name="email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </label>
          <label>
            Salasana
            <input
              type="password"
              name="password"
              minLength={8}
              value={registerForm.password}
              onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </label>
          <button type="submit" disabled={busyAction === "register"}>
            {busyAction === "register" ? "Luodaan..." : "Luo käyttäjä"}
          </button>
        </form>
        {registerStatus && (
          <p className={`status ${registerStatus.type}`}>{registerStatus.message}</p>
        )}
      </section>

      <section className="card">
        <h2>Kirjaudu sisään</h2>
        <p className="hint">Voit käyttää käyttäjänimeä tai sähköpostia.</p>
        <form className="form" onSubmit={handleLogin}>
          <label>
            Käyttäjänimi tai sähköposti
            <input
              type="text"
              name="identifier"
              value={loginForm.identifier}
              onChange={(e) => setLoginForm((f) => ({ ...f, identifier: e.target.value }))}
              required
            />
          </label>
          <label>
            Salasana
            <input
              type="password"
              name="password"
              minLength={8}
              value={loginForm.password}
              onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </label>
          <button type="submit" disabled={busyAction === "login"}>
            {busyAction === "login" ? "Kirjaudutaan..." : "Kirjaudu"}
          </button>
        </form>
        {loginStatus && <p className={`status ${loginStatus.type}`}>{loginStatus.message}</p>}
        {currentUser && (
          <div className="current-user">
            <p>
              <strong>Kirjautunut käyttäjä:</strong>
            </p>
            <ul>
              <li>id: {currentUser.id}</li>
              <li>käyttäjänimi: {currentUser.username}</li>
              <li>sähköposti: {currentUser.email}</li>
            </ul>
          </div>
        )}
      </section>

      <section className="card endpoints">
        <h3>Käytettävät API-päätepisteet</h3>
        <ul>
          <li>
            <code>POST {apiDocs.register}</code>
          </li>
          <li>
            <code>POST {apiDocs.login}</code>
          </li>
        </ul>
      </section>
    </div>
  );
}

export default App;
