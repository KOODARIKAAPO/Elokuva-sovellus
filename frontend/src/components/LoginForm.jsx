import Card from "./Card.jsx";
import StatusMessage from "./StatusMessage.jsx";
import CurrentUser from "./CurrentUser.jsx";

export default function LoginForm({
  formData,
  disabled,
  status,
  currentUser,
  onChange,
  onSubmit,
}) {
  return (
    <Card title="Kirjaudu sisään" description="Voit käyttää käyttäjänimeä tai sähköpostia.">
      <form className="form" onSubmit={onSubmit}>
        <label>
          Käyttäjänimi tai sähköposti
          <input
            type="text"
            name="identifier"
            value={formData.identifier}
            onChange={(e) => onChange("identifier", e.target.value)}
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
          {disabled ? "Kirjaudutaan..." : "Kirjaudu"}
        </button>
      </form>
      <StatusMessage status={status} />
      <CurrentUser user={currentUser} />
    </Card>
  );
}
