import { useState } from "react";
import LoginForm from "../components/LoginForm.jsx";
import ApiEndpoints from "../components/ApiEndpoints.jsx";
import { useAuth } from "../AuthContext.jsx";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

const emptyLoginForm = {
  identifier: "",
  password: "",
};

export function LogIn() {
  const [loginForm, setLoginForm] = useState({ ...emptyLoginForm });
  const [loginStatus, setLoginStatus] = useState(null);
  const [busyAction, setBusyAction] = useState(null);

  const { login } = useAuth();  

  const apiDocs = {
    login: `${apiBaseUrl}/auth/login`,
  };

  async function handleLogin(event) {
    event.preventDefault();
    setBusyAction("login");
    setLoginStatus(null);

    const payload = loginForm.identifier.includes("@")
      ? { email: loginForm.identifier, password: loginForm.password }
      : { username: loginForm.identifier, password: loginForm.password };

    try {
      const response = await fetch(apiDocs.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      login(data.user, data.token); // tallentaa tokenin ja currentUserin

      setLoginStatus({ type: "success", message: "Kirjauduttu sisään!" });
      setLoginForm({ ...emptyLoginForm });

    } catch (err) {
      setLoginStatus({ type: "error", message: err.message });
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section className="auth-panel">
      <div className="forms-grid">
        <LoginForm
          formData={loginForm}
          disabled={busyAction === "login"}
          status={loginStatus}
          currentUser={null}
          onChange={(field, value) => setLoginForm(f => ({ ...f, [field]: value }))}
          onSubmit={handleLogin}
        />
      </div>
      <ApiEndpoints endpoints={apiDocs} />
    </section>
  );
}
