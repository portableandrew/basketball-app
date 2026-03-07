// Anime-style grind progression rank definitions

export interface RankDefinition {
  id: string;
  name: string;
  minLevel: number;
  maxLevel: number;
  iconName: string; // Ionicons name
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
}

export const RANK_DEFINITIONS: RankDefinition[] = [
  {
    id: "novice",
    name: "Novice",
    minLevel: 1,
    maxLevel: 4,
    iconName: "sparkles-outline",
    primaryColor: "#8E8E93",
    secondaryColor: "#B0B0B0",
    glowColor: "#8E8E9320",
  },
  {
    id: "disciple",
    name: "Disciple",
    minLevel: 5,
    maxLevel: 9,
    iconName: "flame-outline",
    primaryColor: "#FF6B35",
    secondaryColor: "#FF8C42",
    glowColor: "#FF6B3520",
  },
  {
    id: "vanguard",
    name: "Vanguard",
    minLevel: 10,
    maxLevel: 14,
    iconName: "shield-outline",
    primaryColor: "#4A90E2",
    secondaryColor: "#6BA3E8",
    glowColor: "#4A90E220",
  },
  {
    id: "apex",
    name: "Apex",
    minLevel: 15,
    maxLevel: 19,
    iconName: "flash-outline",
    primaryColor: "#39FF14",
    secondaryColor: "#4AFF2A",
    glowColor: "#39FF1420",
  },
  {
    id: "phantom",
    name: "Phantom",
    minLevel: 20,
    maxLevel: 24,
    iconName: "moon-outline",
    primaryColor: "#9C27B0",
    secondaryColor: "#BA68C8",
    glowColor: "#9C27B020",
  },
  {
    id: "ascendant",
    name: "Ascendant",
    minLevel: 25,
    maxLevel: 29,
    iconName: "rocket-outline",
    primaryColor: "#FFD700",
    secondaryColor: "#FFE44D",
    glowColor: "#FFD70020",
  },
  {
    id: "mythic",
    name: "Mythic",
    minLevel: 30,
    maxLevel: 39,
    iconName: "diamond-outline",
    primaryColor: "#E91E63",
    secondaryColor: "#F06292",
    glowColor: "#E91E6320",
  },
  {
    id: "eternal",
    name: "Eternal",
    minLevel: 40,
    maxLevel: Infinity,
    iconName: "infinite",
    primaryColor: "#00E5FF",
    secondaryColor: "#18FFFF",
    glowColor: "#00E5FF40",
  },
];

/**
 * Get rank definition for a given level
 * Single source of truth: level -> rank
 */
export function getRankForLevel(level: number): RankDefinition {
  const safeLevel = Math.max(1, Math.floor(level));
  
  for (const rank of RANK_DEFINITIONS) {
    if (safeLevel >= rank.minLevel && safeLevel <= rank.maxLevel) {
      return rank;
    }
  }
  
  // Fallback to highest rank
  return RANK_DEFINITIONS[RANK_DEFINITIONS.length - 1];
}

/**
 * Get next rank info (rank and levels needed)
 */
export function getNextRank(level: number): {
  rank: RankDefinition;
  levelsNeeded: number;
} | null {
  const currentRank = getRankForLevel(level);
  const currentIndex = RANK_DEFINITIONS.findIndex(
    (r) => r.id === currentRank.id
  );

  if (currentIndex === -1 || currentIndex === RANK_DEFINITIONS.length - 1) {
    return null; // Already at max rank
  }

  const nextRank = RANK_DEFINITIONS[currentIndex + 1];
  const levelsNeeded = nextRank.minLevel - level;

  return { rank: nextRank, levelsNeeded };
}
