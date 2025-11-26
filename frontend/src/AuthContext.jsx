// src/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

// Base URL for API calls from the frontend
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Token persisted in localStorage so refreshes keep you logged in
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Whenever the token changes, try to hydrate the user via /auth/me
  useEffect(() => {
    async function fetchUser() {
      if (!token) {
        setCurrentUser(null);
        setLoadingUser(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error("Invalid token");
        setCurrentUser(data.user);
      } catch (err) {
        console.error("auth/me error:", err);
        localStorage.removeItem("token");
        setToken(null);
        setCurrentUser(null);
      } finally {
        setLoadingUser(false);
      }
    }

    fetchUser();
  }, [token]);

  // Save token + user to state/localStorage after a successful login/update
  function login(user, token) {
    setToken(token);
    localStorage.setItem("token", token);
    setCurrentUser(user);
  }

  // Clear token/user
  function logout() {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("token");
  }

  const value = { token, currentUser, loadingUser, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
