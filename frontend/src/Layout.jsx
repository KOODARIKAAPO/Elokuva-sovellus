import { Navbar }   from "./components/Navbar.jsx";
import { Outlet }   from "react-router-dom";

export function Layout () {
    return (
        <>
            <div className="nav-wrapper">
                <Navbar />
            </div>
            <main>
                <Outlet />
            </main>
        </>
    )
}
