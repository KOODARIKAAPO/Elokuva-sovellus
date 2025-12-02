import { useState } from "react";
import RegisterForm from "../components/RegisterForm.jsx";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

const emptyRegisterForm = {
  username: "",
  email: "",
  password: "",
};

export function SignIn() {
  const [registerForm, setRegisterForm] = useState({ ...emptyRegisterForm });
  const [registerStatus, setRegisterStatus] = useState(null);
  const [busyAction, setBusyAction] = useState(null);

  const apiDocs = {
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

  const isRegisterBusy = busyAction === "register";

  return (
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
      </div>
    </section>
  );
}
