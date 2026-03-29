import React, { createContext, useContext, useReducer, useEffect, useMemo } from "react";
import { createTheme } from "@mui/material/styles";
import { lightThemeConfig } from "../theme/lightTheme";
import { darkThemeConfig } from "../theme/darkTheme";

interface ThemeState {
  isDarkMode: boolean;
}

type ThemeAction = { type: "SET"; payload: boolean } | { type: "TOGGLE" };

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

const getInitialThemeState = (): ThemeState => {
  if (typeof window === 'undefined') return { isDarkMode: false };
  const saved = localStorage.getItem("theme:darkMode");
  return { isDarkMode: saved === "true" };
};

const initialState: ThemeState = getInitialThemeState();

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentTheme: ReturnType<typeof createTheme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Initial load now sync in initialState, effect only for SSR/client mismatch
  useEffect(() => {
    // Double-check sync (rare client-side hydration mismatch)
    const saved = localStorage.getItem("theme:darkMode");
    if (saved !== null && saved === "true" && !state.isDarkMode) {
      dispatch({ type: "SET", payload: true });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme:darkMode", state.isDarkMode.toString());
    if (typeof document !== 'undefined') {
      if (state.isDarkMode) {
        document.body.classList.add('dark');
        document.documentElement.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
        document.documentElement.classList.remove('dark');
      }
    }
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