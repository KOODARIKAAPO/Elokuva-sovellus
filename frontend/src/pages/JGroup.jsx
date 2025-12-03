import Card from "../components/Card.jsx";
import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function JGroup({ onBack, onNavigate }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);

  const handleSearch = () => {
  const filtered = groups.filter(group =>
    group.name.toLowerCase().includes(searchText.toLowerCase())
  );
  setFilteredGroups(filtered);
};

const groupsToShow = filteredGroups.length > 0 ? filteredGroups : groups;

  async function fetchGroups() {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/groups`);
      if (!res.ok) throw new Error("Failed to load groups");
      const data = await res.json();
      setGroups(data || []);
    } catch (err) {
      console.error("fetch groups error", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="jgroup-container">
      <div style={{ marginBottom: 12, display: "flex", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={() => {
            if (typeof onBack === "function") return onBack();
            if (window.history.length > 1) return navigate(-1);
            return navigate("/");
          }}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => {
            if (onNavigate) return onNavigate("ngroup");
            return navigate("/ngroup");
          }}
        >
          New Group
        </button>
      </div>

      <Card title="Groups">
  <div className="group-form">
    <input
      type="text"
      placeholder="Search groups..."
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
    />
    <button onClick={handleSearch}>Search</button>
  </div>

  {(filteredGroups.length > 0 ? filteredGroups : groups).length === 0 ? (
    <p>No groups found.</p>
  ) : (
    <div className="groups-list">
      {(filteredGroups.length > 0 ? filteredGroups : groups).map((group) => (
        <div
         key={group.id}
         className="group-item"
         onClick={() => {
       if (!currentUser) {
        alert("Sinun täytyy kirjautua sisään nähdäksesi ryhmän.");
        return;
    }
        navigate(`/groups/${group.id}`);
  }}
      style={{ cursor: "pointer" }}
  >
     <span>{group.name}</span>
</div>
      ))}
    </div>
  )}
</Card>
    </div>
  );
}

export default JGroup;