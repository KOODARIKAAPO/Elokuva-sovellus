import { useState } from "react";
import Card from "../components/Card.jsx";

function NGroup({ onBack }) {
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    // For now just log — creation persistence can be added later
    console.log("Create group:", name);
    setName("");
    if (onBack) onBack();
  };

  return (
    <div style={{ maxWidth: 720, margin: "2rem auto", padding: "1rem" }}>
      <div style={{ marginBottom: 12, display: "flex", gap: "0.5rem" }}>
        {onBack && (
          <button type="button" onClick={onBack}>← Back</button>
        )}
      </div>

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
          <button type="button" onClick={handleCreate}>Create</button>
        </div>
      </Card>
    </div>
  );
}

export default NGroup;