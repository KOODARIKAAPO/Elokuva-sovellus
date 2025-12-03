import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import "./Navbar.css";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
    setOpen(false);
  }

  return (
    
    <div className="dropdown">
      <button className="dropbtn" onClick={() => setOpen((o) => !o)}>
        Menu ▼
      </button>
     {open && (
      /* Lisää tänne linkki, jos haluat sivun näkyvän dropdown-valikossa. Lisää route myös App.jsx -tiedostoon. */
        <div className="dropdown-content open">
          <Link to="/">Etusivu</Link><br/>
          <Link to="/jgroup">Ryhmä</Link><br/>
          <Link to="/user">Käyttäjä</Link><br/>
          {!currentUser && (
            <>
              <Link to="/login">Kirjaudu</Link><br/>
            </>
          )}
          {currentUser && (
            <>
              <button className="menu-button" onClick={handleLogout}>Kirjaudu Ulos</button><br/>
            </>
          )}
        </div>
      )}
    </div>
  );
}
