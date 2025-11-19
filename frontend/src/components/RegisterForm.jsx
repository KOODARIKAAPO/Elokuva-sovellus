import Card from "./Card.jsx";
import StatusMessage from "./StatusMessage.jsx";

export default function RegisterForm({
  formData,
  disabled,
  status,
  onChange,
  onSubmit,
}) {
  return (
    <Card title="Luo käyttäjä">
      <form className="form" onSubmit={onSubmit}>
        <label>
          Käyttäjänimi
          <input
            type="text"
            name="username"
            minLength={3}
            value={formData.username}
            onChange={(e) => onChange("username", e.target.value)}
            required
          />
        </label>
        <label>
          Sähköposti
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            required
          />
        </label>
        <label>
          Salasana
          <input
            type="password"
            name="password"
            minLength={8}
            value={formData.password}
            onChange={(e) => onChange("password", e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={disabled}>
          {disabled ? "Luodaan..." : "Luo käyttäjä"}
        </button>
      </form>
      <StatusMessage status={status} />
    </Card>
  );
}
