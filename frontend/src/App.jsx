// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { Layout } from "./Layout.jsx";
import { Home } from "./pages/Home.jsx";
import { UserPage } from "./pages/UserPage.jsx";
import { SignIn } from "./pages/SignIn.jsx";
import { LogIn } from "./pages/LogIn.jsx";
import JGroup from "./pages/JGroup.jsx";
import NGroup from "./pages/nGroup.jsx";
import { AuthProvider } from "./AuthContext.jsx";

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/user" element={<UserPage />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/login" element={<LogIn />} />
              <Route path="/jgroup" element={<JGroup />} />
              <Route path="/ngroup" element={<NGroup />} />
            </Route>
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
