"use client";

import React, { createContext, useState, useEffect } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  role: string;
  setAuthState: React.Dispatch<React.SetStateAction<{ isLoggedIn: boolean; role: string }>>;
};

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  role: "",
  setAuthState: () => {}, // Default empty function
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState({ isLoggedIn: false, role: "" });

  useEffect(() => {
    fetch("http://localhost:3001/api/validate-token", {
      method: "POST",
      credentials: "include", // Ensure cookies are sent with the request
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setAuthState({ isLoggedIn: true, role: data.role });
        } else {
          setAuthState({ isLoggedIn: false, role: "" });
        }
      })
      .catch(() => {
        setAuthState({ isLoggedIn: false, role: "" });
      });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, setAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};