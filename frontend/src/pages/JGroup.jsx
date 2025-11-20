import Card from "../components/Card.jsx";
import { useState } from "react";
//import "./jGroup.css";

function JGroup({ onBack, onNavigate }) {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");

  const handleAddGroup = () => {
    if (groupName.trim()) {
      setGroups([...groups, { id: Date.now(), name: groupName }]);
      setGroupName("");
    }
  };


  return (
    <div className="jgroup-container">
      <div style={{ marginBottom: 12, display: "flex", gap: "0.5rem" }}>
        {onBack && (
          <button type="button" onClick={onBack}>← Back</button>
        )}
        <button type="button" onClick={() => (onNavigate ? onNavigate('ngroup') : handleAddGroup())}>New Group</button>
      </div>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />

    <form className="example" action="/">
    <input type="text" placeholder="Search.." name="search" />
    <button type="submit"><i className="fa fa-search"></i></button>
    </form>


      <Card title="Groups">
        <div className="group-form">
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
          />
          <button onClick={handleAddGroup}>Create</button>
        </div>

        {groups.length === 0 ? (
          <p>No groups yet. Create one to get started!</p>
        ) : (
          <div className="groups-list">
            {groups.map((group) => (
              <div key={group.id} className="group-item">
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
