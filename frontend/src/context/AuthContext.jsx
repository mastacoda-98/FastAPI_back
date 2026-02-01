"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  });

  const login = (token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("login_time", Date.now().toString());
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("login_time");
    setIsLoggedIn(false);
  };

  // Auto logout after 60 minutes
  useEffect(() => {
    if (!isLoggedIn) return;

    const checkTimeout = setInterval(() => {
      const loginTime = localStorage.getItem("login_time");
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        const sixtyMinutes = 60 * 60 * 1000; // 60 minutes in milliseconds

        if (elapsed > sixtyMinutes) {
          logout();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkTimeout);
  }, [isLoggedIn]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
