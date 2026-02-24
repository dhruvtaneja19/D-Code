import React from "react";
import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import NoPage from "./pages/NoPage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Editor from "./pages/Editor";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <ScrollToHash />
        <RouteHandler />
      </BrowserRouter>
    </>
  );
};

const ScrollToHash = () => {
  const location = useLocation();

  React.useEffect(() => {
    if (!location.hash) {
      return;
    }

    const id = location.hash.replace("#", "");
    const element = document.getElementById(id);

    if (element) {
      const navbarOffset = 96;
      const yPosition = element.getBoundingClientRect().top + window.scrollY;
      const targetPosition = Math.max(yPosition - navbarOffset, 0);
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
    }
  }, [location]);

  return null;
};

const RouteHandler = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<Navigate to="/#about" replace />} />
      <Route path="/features" element={<Navigate to="/#features" replace />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/editor/:id"
        element={isLoggedIn ? <Editor /> : <Navigate to={"/login"} />}
      />
      <Route path="*" element={<NoPage />} />
    </Routes>
  );
};

export default App;
