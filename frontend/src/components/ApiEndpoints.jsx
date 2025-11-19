import Card from "./Card.jsx";

export default function ApiEndpoints({ endpoints }) {
  if (!endpoints) return null;
  return (
    <Card title="Käytettävät API-päätepisteet" className="endpoints">
      <ul>
        {Object.entries(endpoints).map(([key, url]) => (
          <li key={key}>
            <code>POST {url}</code>
          </li>
        ))}
      </ul>
    </Card>
  );
}
