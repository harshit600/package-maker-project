import React, { createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const navigate = useNavigate();

  const checkSession = () => {
    const session = getSession();
    if (!session) return false;

    const currentTime = new Date().getTime();
    const timeDifference = currentTime - session.lastActivity;

    if (timeDifference > session.expiresIn) {
      logout();
      return false;
    }

    updateLastActivity();
    return true;
  };

  const login = (userData) => {
    const session = {
      user: userData,
      lastActivity: new Date().getTime(),
      expiresIn: 60 * 60 * 1000, // 1 hour
    };
    localStorage.setItem("userSession", JSON.stringify(session));
  };

  const logout = () => {
    localStorage.removeItem("userSession");
    navigate("/signin");
  };

  const getSession = () => {
    const session = localStorage.getItem("userSession");
    return session ? JSON.parse(session) : null;
  };

  const updateLastActivity = () => {
    const session = getSession();
    if (session) {
      session.lastActivity = new Date().getTime();
      localStorage.setItem("userSession", JSON.stringify(session));
    }
  };

  useEffect(() => {
    // Check session every minute
    const interval = setInterval(checkSession, 60 * 1000);

    // Update activity on user interaction
    const handleActivity = () => {
      if (getSession()) {
        updateLastActivity();
      }
    };

    window.addEventListener("click", handleActivity);
    window.addEventListener("keypress", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("mousemove", handleActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keypress", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("mousemove", handleActivity);
    };
  }, []);

  return (
    <SessionContext.Provider
      value={{ login, logout, checkSession, getSession }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
