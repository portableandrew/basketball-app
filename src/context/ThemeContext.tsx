// Theme Context - Hard-coded default theme for stability
// NO cosmetics theme access - uses static default theme only

import React, { createContext, useContext, useState, ReactNode } from "react";
import { DEFAULT_THEME_PALETTE, ThemePalette } from "../models/themes";

export interface AppTheme extends ThemePalette {
  accentGlow: string;
}

interface ThemeContextType {
  theme: AppTheme;
}

// Hard-coded default theme - NEVER reads from cosmetics
const HARD_CODED_THEME: AppTheme = {
  ...DEFAULT_THEME_PALETTE,
  accentGlow: DEFAULT_THEME_PALETTE.primary + "40",
};

const ThemeContext = createContext<ThemeContextType>({
  theme: HARD_CODED_THEME,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always use hard-coded theme - NO cosmetics access
  const [theme] = useState<AppTheme>(HARD_CODED_THEME);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: HARD_CODED_THEME,
    };
  }
  return context;
}
