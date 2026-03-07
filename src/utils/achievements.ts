// Achievements utility functions

import {
  Achievement,
  AchievementDefinition,
  AchievementCheckData,
  getAchievementDefinitions,
} from "../models/achievements";
import { getTodayDateString } from "./dates";
import { getGamificationState, setGamificationState } from "../storage/storage";
import { calculateLevel } from "./xp";

/**
 * Check which achievements are unlocked based on current data
 */
export function checkAchievements(
  data: AchievementCheckData,
  previouslyUnlocked: Achievement[] = []
): Achievement[] {
  const definitions = getAchievementDefinitions();
  const unlockedSet = new Set(previouslyUnlocked.map((a) => a.id));

  return definitions.map((def) => {
    const wasUnlocked = unlockedSet.has(def.id);
    const isUnlocked = def.checkCondition(data);

    if (isUnlocked && !wasUnlocked) {
      // Newly unlocked
      return {
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        xpReward: def.xpReward,
        unlocked: true,
        unlockedAt: getTodayDateString(),
      };
    } else if (wasUnlocked) {
      // Already unlocked - preserve original unlock date
      const existing = previouslyUnlocked.find((a) => a.id === def.id);
      return {
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        xpReward: def.xpReward,
        unlocked: true,
        unlockedAt: existing?.unlockedAt,
      };
    } else {
      // Not unlocked
      return {
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        xpReward: def.xpReward,
        unlocked: false,
      };
    }
  });
}

/**
 * Get newly unlocked achievements (for showing notifications)
 */
export function getNewlyUnlockedAchievements(
  current: Achievement[],
  previous: Achievement[]
): Achievement[] {
  const previousIds = new Set(previous.map((a) => a.id).filter((id) => {
    const prev = previous.find((a) => a.id === id);
    return prev?.unlocked;
  }));

  return current.filter(
    (a) => a.unlocked && !previousIds.has(a.id)
  );
}

/**
 * Award XP for newly unlocked achievements
 */
export async function awardAchievementXp(
  newlyUnlocked: Achievement[]
): Promise<number> {
  if (newlyUnlocked.length === 0) return 0;

  const totalXp = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);
  
  if (totalXp > 0) {
    const gamState = await getGamificationState();
    if (gamState) {
      const newTotalXp = gamState.totalXp + totalXp;
      const newLevel = calculateLevel(newTotalXp);
      
      await setGamificationState({
        ...gamState,
        totalXp: newTotalXp,
        level: newLevel,
      });
    }
  }

  return totalXp;
}
