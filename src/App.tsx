import React, { useState, useEffect } from "react";
import { MindMapProvider } from "./context/MindMapContext";
import Cookies from "js-cookie";
import Login from "./components/Login";
import AppContent from "./components/AppContent";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = Cookies.get("loggedIn");

    fetch("http://localhost:3000/api/auth/tokenVerfication", {
      method: "POST",
      body: JSON.stringify({ token: loggedIn }),
    }).then((response)=>{
      if(response.ok) setIsLoggedIn(true);
      else setIsLoggedIn(false);
    });

    setIsLoggedIn(loggedIn ? true : false);
  }, []);

  return (
    <MindMapProvider>{isLoggedIn ? <Login /> : <AppContent />}</MindMapProvider>
  );
};

export default App;
