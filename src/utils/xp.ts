// XP calculation and level/rank utilities

import { XP_CONSTANTS, XP_PER_LEVEL } from "../models/constants";
import { ShootingSet, DrillCompletion, GamificationState } from "../models/types";
import { getRankForLevel as getRankDefinition } from "../models/ranks";
import { clamp, safeRatio } from "./number";

/**
 * Calculate XP earned from a shooting set
 */
export function calculateShootingXp(makes: number, attempts: number): number {
  return makes * XP_CONSTANTS.PER_MAKE + attempts * XP_CONSTANTS.PER_ATTEMPT;
}

/**
 * Calculate XP earned from drill completions
 */
export function calculateDrillXp(completedDrills: number): number {
  return completedDrills * XP_CONSTANTS.PER_DRILL_COMPLETION;
}

/**
 * Calculate total XP for a session
 */
export function calculateSessionXp(
  shootingSets: ShootingSet[],
  drillCompletions: DrillCompletion[]
): number {
  let xp = 0;

  // XP from shooting
  for (const set of shootingSets) {
    xp += calculateShootingXp(set.makes, set.attempts);
  }

  // XP from drills
  const completedCount = drillCompletions.filter((d) => d.completed).length;
  xp += calculateDrillXp(completedCount);

  // Daily session bonus (if at least one activity)
  if (shootingSets.length > 0 || completedCount > 0) {
    xp += XP_CONSTANTS.DAILY_SESSION_BONUS;
  }

  return xp;
}

/**
 * Calculate level from total XP
 * Formula: level = floor(total XP / 500) + 1
 * Single source of truth: totalXP -> level
 */
export function getLevelFromXP(totalXP: number): number {
  const safeXP = isFinite(totalXP) ? Math.max(0, totalXP) : 0;
  return Math.floor(safeXP / XP_PER_LEVEL) + 1;
}

/**
 * Alias for backward compatibility
 */
export function calculateLevel(totalXp: number): number {
  return getLevelFromXP(totalXp);
}

/**
 * Get total XP needed to reach a given level
 * Single source of truth: level -> XP
 */
export function getXPForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return (safeLevel - 1) * XP_PER_LEVEL;
}

/**
 * Calculate XP progress toward next level (0..1)
 * Single source of truth: totalXP -> progress ratio
 */
export function getProgressToNextLevel(totalXP: number): number {
  const safeXP = isFinite(totalXP) ? Math.max(0, totalXP) : 0;
  const currentLevel = getLevelFromXP(safeXP);
  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const xpInCurrentLevel = safeXP - xpForCurrentLevel;
  const xpNeededForNext = XP_PER_LEVEL;
  
  return safeRatio(xpInCurrentLevel, xpNeededForNext);
}

/**
 * Get rank definition for a given level
 */
export function getRankForLevel(level: number) {
  return getRankDefinition(level);
}

/**
 * Calculate XP needed for next level
 */
export function getXpForNextLevel(currentLevel: number): number {
  return XP_PER_LEVEL;
}

/**
 * Calculate XP progress toward next level (with percentage)
 */
export function getXpProgress(currentXp: number, currentLevel: number): {
  current: number;
  needed: number;
  percentage: number;
} {
  // Ensure inputs are valid
  const safeXp = isFinite(currentXp) ? Math.max(0, currentXp) : 0;
  const safeLevel = isFinite(currentLevel) ? Math.max(1, currentLevel) : 1;
  
  const xpForCurrentLevel = getXPForLevel(safeLevel);
  const xpInCurrentLevel = Math.max(0, safeXp - xpForCurrentLevel);
  const xpNeededForNext = XP_PER_LEVEL;

  // Calculate safe percentage (0-100)
  const ratio = safeRatio(xpInCurrentLevel, xpNeededForNext);
  const percentage = clamp(ratio * 100, 0, 100);

  return {
    current: xpInCurrentLevel,
    needed: xpNeededForNext,
    percentage,
  };
}
