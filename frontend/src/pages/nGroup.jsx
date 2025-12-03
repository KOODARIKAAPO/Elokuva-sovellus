import { useState } from "react";
import Card from "../components/Card.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

function NGroup({ onBack }) {
  const navigate = useNavigate();
  const { currentUser, token } = useAuth();
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    setError(null);

    if (!name.trim()) return setError("Group name cannot be empty");
    if (!currentUser?.id) return setError("Please log in to create a group");
    if (!token) return setError("Missing token, please log in again");

    setIsCreating(true);

    try {
      const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");
      const response = await fetch(`${apiBaseUrl}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), owner_id: currentUser.id }),
      });

      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        data = { error: text || "Non-JSON response from server" };
      }

      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);

      setName("");
      if (typeof onBack === "function") onBack();
      else if (window.history.length > 1) navigate(-1);
      else navigate("/jgroup");
    } catch (err) {
      setError(err.message || "Error creating group");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="ngroup-container">
      <Card title="Create Group">
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            style={{ flex: 1 }}
          />
          <button type="button" onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </Card>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </div>
  );
}

export default NGroup;
