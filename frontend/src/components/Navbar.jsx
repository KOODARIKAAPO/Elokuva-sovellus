import { Link } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    
    <div className="dropdown">
      <button onClick={() => setOpen((o) => !o)}>
        Menu ▼
      </button>
     {open && (
        <div className="dropdown-content">
          <Link to="/">Home</Link><br/>
          <Link to="/jgroup">Join Group</Link><br/>
          <Link to="/ngroup">New Group</Link><br/>
          <Link to="/user">User</Link><br/>
          <Link to="/signin">Sign In</Link><br/>
          <Link to="/login">Log In</Link>
        </div>
      )}
    </div>
  );
}