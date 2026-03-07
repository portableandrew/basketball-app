// Theme palette definitions - Full color schemes for cosmetic themes

export interface ThemePalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  tabBarActive: string;
  tabBarInactive: string;
  xpBar: string;
  rankBadge: string;
  border: string;
}

// Theme palette definitions mapped by theme cosmetic ID
export const THEME_PALETTES: Record<string, ThemePalette> = {
  theme_neon_green: {
    primary: "#39FF14",
    secondary: "#00FF00",
    accent: "#39FF14",
    background: "#0A0A0A",
    card: "#1A1A1A",
    text: "#FFFFFF",
    textSecondary: "#8E8E93",
    tabBarActive: "#39FF14",
    tabBarInactive: "#8E8E93",
    xpBar: "#39FF14",
    rankBadge: "#39FF14",
    border: "#39FF1420",
  },
  theme_lakers: {
    primary: "#FDB927", // Lakers Gold
    secondary: "#552583", // Lakers Purple
    accent: "#FDB927",
    background: "#1A0A2E", // Dark purple-blue
    card: "#2A1A3E",
    text: "#FFFFFF",
    textSecondary: "#B8A5C8",
    tabBarActive: "#FDB927",
    tabBarInactive: "#8E8E93",
    xpBar: "#FDB927",
    rankBadge: "#FDB927",
    border: "#FDB92720",
  },
  theme_miami_night: {
    primary: "#F9A01B", // Miami Orange
    secondary: "#98002E", // Miami Red
    accent: "#F9A01B",
    background: "#1A0A0A",
    card: "#2A1A1A",
    text: "#FFFFFF",
    textSecondary: "#B8A5A5",
    tabBarActive: "#F9A01B",
    tabBarInactive: "#8E8E93",
    xpBar: "#F9A01B",
    rankBadge: "#F9A01B",
    border: "#F9A01B20",
  },
  theme_classic_bw: {
    primary: "#FFFFFF",
    secondary: "#000000",
    accent: "#FFFFFF",
    background: "#000000",
    card: "#1A1A1A",
    text: "#FFFFFF",
    textSecondary: "#8E8E93",
    tabBarActive: "#FFFFFF",
    tabBarInactive: "#666666",
    xpBar: "#FFFFFF",
    rankBadge: "#FFFFFF",
    border: "#FFFFFF30",
  },
  theme_cyberpunk: {
    primary: "#FF00FF", // Magenta
    secondary: "#00FFFF", // Cyan
    accent: "#FF00FF",
    background: "#0A0A1A",
    card: "#1A1A2A",
    text: "#FFFFFF",
    textSecondary: "#B8A5FF",
    tabBarActive: "#FF00FF",
    tabBarInactive: "#8E8E93",
    xpBar: "#FF00FF",
    rankBadge: "#FF00FF",
    border: "#FF00FF20",
  },
};

// Get palette for a theme cosmetic ID
export function getThemePalette(themeId: string | null | undefined): ThemePalette {
  if (!themeId) {
    return THEME_PALETTES.theme_neon_green; // Default fallback
  }
  return THEME_PALETTES[themeId] || THEME_PALETTES.theme_neon_green;
}

// Default theme palette
export const DEFAULT_THEME_PALETTE = THEME_PALETTES.theme_neon_green;
