export default function CurrentUser({ user }) {
  if (!user) return null;
  return (
    <div className="current-user">
      <p>
        <strong>Kirjautunut käyttäjä:</strong>
      </p>
      <ul>
        <li>id: {user.id}</li>
        <li>käyttäjänimi: {user.username}</li>
        <li>sähköposti: {user.email}</li>
      </ul>
    </div>
  );
}
