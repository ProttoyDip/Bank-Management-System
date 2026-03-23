import React, { createContext, useContext, useReducer, useEffect, useMemo } from "react";
import { createTheme } from "@mui/material/styles";
import { lightThemeConfig } from "../theme/lightTheme";
import { darkThemeConfig } from "../theme/darkTheme";

interface ThemeState {
  isDarkMode: boolean;
}

type ThemeAction = { type: "SET"; payload: boolean } | { type: "TOGGLE" };

const initialState: ThemeState = { isDarkMode: false };

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case "SET":
      return { isDarkMode: action.payload };
    case "TOGGLE":
      return { isDarkMode: !state.isDarkMode };
    default:
      return state;
  }
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentTheme: ReturnType<typeof createTheme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem("theme:darkMode");
    if (saved !== null) {
      dispatch({ type: "SET", payload: saved === "true" });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme:darkMode", state.isDarkMode.toString());
  }, [state.isDarkMode]);

  const currentTheme = useMemo(
    () => createTheme(state.isDarkMode ? darkThemeConfig : lightThemeConfig),
    [state.isDarkMode]
  );

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode: state.isDarkMode,
        toggleDarkMode: () => dispatch({ type: "TOGGLE" }),
        currentTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("Wrap inside ThemeProvider");
  return ctx;
}