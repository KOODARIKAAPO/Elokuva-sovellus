import { useState } from "react";
import LoginForm from "../components/LoginForm.jsx";
import RegisterForm from "../components/RegisterForm.jsx";
import { useAuth } from "../AuthContext.jsx";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

const emptyLoginForm = {
  identifier: "",
  password: "",
};

const emptyRegisterForm = {
  username: "",
  email: "",
  password: "",
};

export function LogIn() {
  const [loginForm, setLoginForm] = useState({ ...emptyLoginForm });
  const [loginStatus, setLoginStatus] = useState(null);
  const [registerForm, setRegisterForm] = useState({ ...emptyRegisterForm });
  const [registerStatus, setRegisterStatus] = useState(null);
  const [busyAction, setBusyAction] = useState(null);

  const { login } = useAuth();  

  const apiDocs = {
    login: `${apiBaseUrl}/auth/login`,
    register: `${apiBaseUrl}/auth/register`,
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

  async function handleLogin(event) {
    event.preventDefault();
    setBusyAction("login");
    setLoginStatus(null);
    setRegisterStatus(null);

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

  async function handleRegister(event) {
    event.preventDefault();
    setBusyAction("register");
    setRegisterStatus(null);
    setLoginStatus(null);

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

  return (
    <section className="auth-panel">
      <div className="forms-grid">
        <RegisterForm
          formData={registerForm}
          disabled={busyAction === "register"}
          status={registerStatus}
          onChange={(field, value) =>
            setRegisterForm((form) => ({ ...form, [field]: value }))
          }
          onSubmit={handleRegister}
        />
        <LoginForm
          formData={loginForm}
          disabled={busyAction === "login"}
          status={loginStatus}
          currentUser={null}
          onChange={(field, value) => setLoginForm(f => ({ ...f, [field]: value }))}
          onSubmit={handleLogin}
        />
      </div>
    </section>
  );
}
