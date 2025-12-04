import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import "./Navbar.css";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Close dropdown after any navigation
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

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
          <Link to="/booking">Varaa paikat</Link><br/>
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
