// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { Layout } from "./Layout.jsx";
import { Home } from "./pages/Home.jsx";
import { UserPage } from "./pages/UserPage.jsx";
import { LogIn } from "./pages/LogIn.jsx";
import JGroup from "./pages/JGroup.jsx";
import NGroup from "./pages/nGroup.jsx";
import { AuthProvider } from "./AuthContext.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import { SingleGroup } from "./pages/singleGroup.jsx";
import { SharedFavourites } from "./pages/SharedFavourites.jsx";




function App() {
  /* Lisää tänne route ja ylemmäs import, jos haluat sivun näkyvän. Lisää link myös Navbar.jsx -tiedostoon, jos haluat sivun näkyvän dropdown -valikossa. */
  return (
    <AuthProvider>
      <div className="app">
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/user" element={<UserPage />} />
              <Route path="/login" element={<LogIn />} />
              <Route path="/jgroup" element={<JGroup />} />
              <Route path="/ngroup" element={<NGroup />} />
              <Route path="/reviews" element={<ReviewPage />} />
              <Route path="/singlegroup" element={<SingleGroup />} />
              <Route path="/shared/:token" element={<SharedFavourites />} />
            </Route>
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
