import Card from "../components/Card.jsx"; 
import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function JGroup({ onBack, onNavigate }) {
  const { currentUser, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);

  // Hae kaikki ryhmät
  async function fetchGroups() {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/groups`);
      const data = await res.json();
      setGroups(data || []);
    } catch (err) {
      console.error("fetch groups error", err);
    } finally {
      setLoading(false);
    }
  }

  // Hae käyttäjän liittymät ryhmät 
  async function fetchJoinedGroups() {
    if (!token) return;

    try {
      const res = await fetch(`${apiBaseUrl}/groups/joined`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setJoinedGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetching joined groups failed:", err);
    }
  }

  // Liity ryhmään
  async function requestJoin(groupId) {
    if (!currentUser) {
      alert("Sinun täytyy kirjautua sisään liittyäksesi ryhmään.");
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/groups/${groupId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Liittymispyyntö epäonnistui.");
        return;
      }

      alert("Liittymispyyntö lähetetty!");
      fetchJoinedGroups(); 
    } catch (err) {
      console.error("Join error:", err);
    }
  }

  const handleSearch = () => {
    const filtered = groups.filter(group =>
      group.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredGroups(filtered);
  };

  function isOwner(group) {
    return currentUser && group.owner_id === currentUser.id;
  }

  function isMember(group) {
    return joinedGroups.some(
      g => g.id === group.id && g.status === "approved"
    ) || isOwner(group);
  }

  function isPending(group) {
    return joinedGroups.some(
      g => g.id === group.id && g.status === "pending"
    );
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchJoinedGroups();
  }, [token]);

  const groupsToShow = filteredGroups.length > 0 ? filteredGroups : groups;

  return (
    <div className="jgroup-container">
      <div>
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

        {groupsToShow.length === 0 ? (
          <p>No groups found.</p>
        ) : (
          <div className="groups-list">
            {groupsToShow.map((group) => (
              <div
                key={group.id}
                className="group-item"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 0"
                }}
              >
                <div
                  className="group-name-section"
                  onClick={() => {
                    if (!isMember(group)) {
                      alert("Sinun täytyy olla ryhmän jäsen päästäksesi sisään.");
                      return;
                    }
                    navigate(`/groups/${group.id}`);
                  }}
                >
                  <span>{group.name}</span>
                  {isMember(group) && (
                    <span className="joined-icon" title="Olet jäsen">✔</span>
                  )}
                </div>

                {!isMember(group) && (
                  isPending(group) ? (
                    <button disabled className="join-button-small">
                      Liittymispyyntö lähetetty
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        requestJoin(group.id);
                      }}
                      className="join-button-small"
                    >
                      Liity
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default JGroup;