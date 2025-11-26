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
      <button onClick={() => setOpen((o) => !o)}>
        Menu ▼
      </button>
     {open && (
      /* Lisää tänne linkki, jos haluat sivun näkyvän dropdown-valikossa. Lisää route myös App.jsx -tiedostoon. */
        <div className="dropdown-content">
          <Link to="/">Home</Link><br/>
          <Link to="/jgroup">Groups</Link><br/>
          <Link to="/user">User</Link><br/>
          <Link to="/reviews">Arvostelut</Link><br/>
          <Link to="/signin">Sign Up</Link><br/>
          <Link to="/login">Log In</Link><br/>
          {currentUser && (
            <>
              <button className="menu-button" onClick={handleLogout}>Log Out</button><br/>
            </>
          )}
        </div>
      )}
    </div>
  );
}
