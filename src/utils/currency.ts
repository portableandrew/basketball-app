// Currency reward utilities

import { GamificationState } from "../models/types";
import { getGamificationState, setGamificationState } from "../storage/storage";

/**
 * Currency reward amounts
 */
export const CURRENCY_REWARDS = {
  WORKOUT_COMPLETION: 10, // Per completed workout session
  LEVEL_UP: 50, // Per level reached
  BADGE_UNLOCK: 100, // Per badge unlocked (for major badges)
  DAILY_STREAK_BONUS: 5, // Per day in streak (bonus)
} as const;

/**
 * Award currency for completing a workout
 */
export async function awardWorkoutCurrency(): Promise<number> {
  const gamState = await getGamificationState();
  const newCurrency = gamState.currency + CURRENCY_REWARDS.WORKOUT_COMPLETION;
  await setGamificationState({
    ...gamState,
    currency: newCurrency,
  });
  return CURRENCY_REWARDS.WORKOUT_COMPLETION;
}

/**
 * Award currency for leveling up
 */
export async function awardLevelUpCurrency(): Promise<number> {
  const gamState = await getGamificationState();
  const newCurrency = gamState.currency + CURRENCY_REWARDS.LEVEL_UP;
  await setGamificationState({
    ...gamState,
    currency: newCurrency,
  });
  return CURRENCY_REWARDS.LEVEL_UP;
}

/**
 * Award currency for unlocking a badge
 */
export async function awardBadgeCurrency(): Promise<number> {
  const gamState = await getGamificationState();
  const newCurrency = gamState.currency + CURRENCY_REWARDS.BADGE_UNLOCK;
  await setGamificationState({
    ...gamState,
    currency: newCurrency,
  });
  return CURRENCY_REWARDS.BADGE_UNLOCK;
}

/**
 * Check if user leveled up and award currency
 */
export async function checkLevelUpReward(
  oldLevel: number,
  newLevel: number
): Promise<number> {
  if (newLevel > oldLevel) {
    const levelsGained = newLevel - oldLevel;
    const totalReward = levelsGained * CURRENCY_REWARDS.LEVEL_UP;
    const gamState = await getGamificationState();
    await setGamificationState({
      ...gamState,
      currency: gamState.currency + totalReward,
    });
    return totalReward;
  }
  return 0;
}
