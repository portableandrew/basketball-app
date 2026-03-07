// Cosmetics types and definitions

export type CosmeticType = "jersey" | "accessory" | "shoe" | "ball" | "theme" | "hat";
export type CosmeticRarity = "common" | "rare" | "epic" | "legendary";

export interface Cosmetic {
  id: string;
  name: string;
  type: CosmeticType;
  rarity: CosmeticRarity;
  cost: number;
  icon?: string; // Ionicons name
  color?: string; // Primary color for preview
  secondaryColor?: string; // Secondary color for preview
  description?: string;
}

export interface EquippedCosmetics {
  jersey: string | null;
  accessory: string | null;
  shoe: string | null;
  ball: string | null;
  theme: string | null;
  hat: string | null;
}

// Default equipped cosmetics structure - all fields must be present
export const DEFAULT_EQUIPPED: EquippedCosmetics = {
  theme: null,
  jersey: null,
  hat: null,
  accessory: null,
  shoe: null,
  ball: null,
};

export interface CosmeticsState {
  ownedCosmetics: string[]; // Array of cosmetic IDs
  equippedCosmetics: EquippedCosmetics;
}

// Default cosmetics state - used as fallback and initial state
// SAFETY: theme is ALWAYS null - themes not stored in cosmetics
export const DEFAULT_COSMETICS_STATE: CosmeticsState = {
  ownedCosmetics: [
    "jersey_classic_white",
    "accessory_headband_none",
    "shoe_classic_white",
    "ball_classic_orange",
    // theme_neon_green removed - themes not stored in cosmetics
  ],
  equippedCosmetics: {
    ...DEFAULT_EQUIPPED,
    jersey: "jersey_classic_white",
    accessory: "accessory_headband_none",
    shoe: "shoe_classic_white",
    ball: "ball_classic_orange",
    theme: null, // ALWAYS null - themes not stored in cosmetics
  },
};

// Default cosmetics catalog
export const COSMETICS_CATALOG: Cosmetic[] = [
  // Jerseys
  {
    id: "jersey_classic_white",
    name: "Classic White",
    type: "jersey",
    rarity: "common",
    cost: 0, // Free starter
    color: "#FFFFFF",
    description: "Clean white jersey",
  },
  {
    id: "jersey_neon_green",
    name: "Neon Green",
    type: "jersey",
    rarity: "rare",
    cost: 150,
    color: "#39FF14",
    description: "Electric green jersey",
  },
  {
    id: "jersey_lakers_purple",
    name: "Lakers Purple",
    type: "jersey",
    rarity: "epic",
    cost: 300,
    color: "#552583",
    secondaryColor: "#FDB927",
    description: "Lakers-inspired purple and gold",
  },
  {
    id: "jersey_miami_night",
    name: "Miami Night",
    type: "jersey",
    rarity: "epic",
    cost: 350,
    color: "#98002E",
    secondaryColor: "#F9A01B",
    description: "Miami Heat-inspired dark red",
  },
  {
    id: "jersey_blackout",
    name: "Blackout",
    type: "jersey",
    rarity: "legendary",
    cost: 500,
    color: "#000000",
    description: "Sleek all-black jersey",
  },

  // Accessories
  {
    id: "accessory_headband_none",
    name: "No Headband",
    type: "accessory",
    rarity: "common",
    cost: 0,
    description: "No headband",
  },
  {
    id: "accessory_headband_white",
    name: "White Headband",
    type: "accessory",
    rarity: "common",
    cost: 50,
    color: "#FFFFFF",
    description: "Classic white headband",
  },
  {
    id: "accessory_headband_neon",
    name: "Neon Headband",
    type: "accessory",
    rarity: "rare",
    cost: 100,
    color: "#39FF14",
    description: "Bright neon headband",
  },
  {
    id: "accessory_arm_sleeve",
    name: "Arm Sleeve",
    type: "accessory",
    rarity: "rare",
    cost: 120,
    color: "#000000",
    description: "Compression arm sleeve",
  },
  {
    id: "accessory_leg_sleeve",
    name: "Leg Sleeve",
    type: "accessory",
    rarity: "rare",
    cost: 120,
    color: "#000000",
    description: "Compression leg sleeve",
  },
  {
    id: "accessory_shooting_sleeve",
    name: "Shooting Sleeve",
    type: "accessory",
    rarity: "epic",
    cost: 200,
    color: "#000000",
    description: "Full shooting sleeve",
  },

  // Hats
  {
    id: "hat_cap",
    name: "Snapback Cap",
    type: "hat",
    rarity: "common",
    cost: 100,
    color: "#1A1A1A",
    description: "Classic snapback cap",
  },
  {
    id: "hat_headband",
    name: "Headband",
    type: "hat",
    rarity: "common",
    cost: 50,
    color: "#FFFFFF",
    description: "Simple headband",
  },
  {
    id: "hat_beanie",
    name: "Beanie",
    type: "hat",
    rarity: "rare",
    cost: 150,
    color: "#2A2A2A",
    description: "Warm beanie",
  },

  // Shoes
  {
    id: "shoe_classic_white",
    name: "Classic White",
    type: "shoe",
    rarity: "common",
    cost: 0,
    color: "#FFFFFF",
    description: "Classic white sneakers",
  },
  {
    id: "shoe_black_red",
    name: "Black & Red",
    type: "shoe",
    rarity: "rare",
    cost: 150,
    color: "#000000",
    secondaryColor: "#FF0000",
    description: "Black and red kicks",
  },
  {
    id: "shoe_neon_green",
    name: "Neon Green",
    type: "shoe",
    rarity: "rare",
    cost: 180,
    color: "#39FF14",
    description: "Electric green sneakers",
  },
  {
    id: "shoe_gold",
    name: "Gold",
    type: "shoe",
    rarity: "epic",
    cost: 300,
    color: "#FFD700",
    description: "Premium gold sneakers",
  },
  {
    id: "shoe_legendary",
    name: "Legendary",
    type: "shoe",
    rarity: "legendary",
    cost: 500,
    color: "#9D00FF",
    secondaryColor: "#FFD700",
    description: "Ultra-rare legendary kicks",
  },

  // Ball Skins
  {
    id: "ball_classic_orange",
    name: "Classic Orange",
    type: "ball",
    rarity: "common",
    cost: 0,
    color: "#FF8C00",
    description: "Classic orange basketball",
  },
  {
    id: "ball_midnight_black",
    name: "Midnight Black",
    type: "ball",
    rarity: "rare",
    cost: 100,
    color: "#000000",
    description: "Dark black basketball",
  },
  {
    id: "ball_glitch_neon",
    name: "Glitch Neon",
    type: "ball",
    rarity: "epic",
    cost: 250,
    color: "#39FF14",
    secondaryColor: "#FF00FF",
    description: "Neon glitch effect ball",
  },
  {
    id: "ball_gold",
    name: "Gold Ball",
    type: "ball",
    rarity: "legendary",
    cost: 400,
    color: "#FFD700",
    description: "Premium gold basketball",
  },

  // UI Themes
  {
    id: "theme_neon_green",
    name: "Neon Green",
    type: "theme",
    rarity: "common",
    cost: 0,
    color: "#39FF14",
    description: "Default neon green theme",
  },
  {
    id: "theme_lakers",
    name: "Lakers Purple & Gold",
    type: "theme",
    rarity: "rare",
    cost: 200,
    color: "#552583",
    secondaryColor: "#FDB927",
    description: "Lakers-inspired theme",
  },
  {
    id: "theme_miami_night",
    name: "Miami Night",
    type: "theme",
    rarity: "rare",
    cost: 200,
    color: "#98002E",
    secondaryColor: "#F9A01B",
    description: "Miami Heat dark theme",
  },
  {
    id: "theme_classic_bw",
    name: "Classic Black & White",
    type: "theme",
    rarity: "epic",
    cost: 300,
    color: "#FFFFFF",
    secondaryColor: "#000000",
    description: "Minimalist black and white",
  },
  {
    id: "theme_cyberpunk",
    name: "Cyberpunk",
    type: "theme",
    rarity: "legendary",
    cost: 500,
    color: "#FF00FF",
    secondaryColor: "#00FFFF",
    description: "Futuristic cyberpunk theme",
  },
];

// Get cosmetic by ID
export function getCosmeticById(id: string): Cosmetic | undefined {
  return COSMETICS_CATALOG.find((c) => c.id === id);
}

// Get cosmetics by type
export function getCosmeticsByType(type: CosmeticType): Cosmetic[] {
  return COSMETICS_CATALOG.filter((c) => c.type === type);
}

// Get rarity color
export function getRarityColor(rarity: CosmeticRarity): string {
  switch (rarity) {
    case "common":
      return "#8E8E93";
    case "rare":
      return "#4A90E2";
    case "epic":
      return "#9C27B0";
    case "legendary":
      return "#FFD700";
    default:
      return "#8E8E93";
  }
}
