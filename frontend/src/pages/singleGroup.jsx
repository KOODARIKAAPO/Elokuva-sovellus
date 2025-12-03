import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export function SingleGroup() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/groups/${id}`)
      .then(res => res.json())
      .then(data => setGroup(data))
      .catch(err => console.error(err));
  }, [id]);

  if (!group) return <p>Loading...</p>;

  return (
    <div>
      <h1>{group.name}</h1>
      <p>Group ID: {id}</p>
    </div>
  );
}