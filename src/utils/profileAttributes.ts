// Profile Attributes - Calculate player attribute ratings from stats
// Scale 0-99; formulas are harsh so you won't hit 99 easily (always room to improve)

import {
  ShootingSet,
  DrillCompletion,
  PracticeDay,
  GamificationState,
} from "../models/types";
import { getDateDaysAgo } from "./dates";
import { safePercent, clamp } from "./number";

const MAX_ATTRIBUTE_RATING = 99;

export interface PlayerAttributes {
  threePointer: number; // 0-99
  midrange: number; // 0-99
  layup: number; // 0-99 (finishing at rim)
  ballHandling: number; // 0-99
  freeThrow: number; // 0-99
  conditioning: number; // 0-99
}

/**
 * Calculate all player attributes from stats (0-99 scale, harsh formulas)
 */
export function calculateAttributes(
  shootingSets: ShootingSet[],
  drillCompletions: DrillCompletion[],
  practiceDays: PracticeDay[],
  gamification: GamificationState
): PlayerAttributes {
  return {
    threePointer: calculateShooting3PT(shootingSets),
    midrange: calculateMidrange(shootingSets, drillCompletions),
    layup: calculateLayup(drillCompletions),
    ballHandling: calculateHandles(drillCompletions),
    freeThrow: calculateFreeThrow(practiceDays),
    conditioning: calculateConditioning(practiceDays, gamification),
  };
}

/**
 * Shooting (3PT) Rating
 * Based on 3-point FG% and total attempts
 * Formula: (FG% * 0.6) + (min(attempts/1000, 1) * 40)
 * Max attempts considered: 1000 for full volume bonus
 */
function calculateShooting3PT(shootingSets: ShootingSet[]): number {
  const threePointSets = shootingSets.filter((s) => {
    // Assume all default spots are 3-pointers
    return s.spotId.startsWith("spot_");
  });

  if (threePointSets.length === 0) {
    return 0;
  }

  const totalMakes = threePointSets.reduce((sum, s) => sum + s.makes, 0);
  const totalAttempts = threePointSets.reduce((sum, s) => sum + s.attempts, 0);

  if (totalAttempts === 0) {
    return 0;
  }

  const fgPercentage = safePercent(totalMakes, totalAttempts);
  
  // Harsh: need high volume + accuracy to approach 99. Volume cap at 2000 attempts.
  const volumeBonus = Math.min(totalAttempts / 2000, 1) * 44;
  const accuracyComponent = clamp(fgPercentage / 100, 0, 1) * 55;
  return Math.round(Math.min(accuracyComponent + volumeBonus, MAX_ATTRIBUTE_RATING));
}

/**
 * Midrange Rating
 * Based on shooting volume (all spots) and drill activity
 */
function calculateMidrange(
  shootingSets: ShootingSet[],
  drillCompletions: DrillCompletion[]
): number {
  const totalAttempts = shootingSets.reduce((sum, s) => sum + (isFinite(s.attempts) ? s.attempts : 0), 0);
  const totalMakes = shootingSets.reduce((sum, s) => sum + (isFinite(s.makes) ? s.makes : 0), 0);
  const fgPct = safePercent(totalMakes, totalAttempts);
  const volumeBonus = Math.min(totalAttempts / 1000, 1) * 49;
  const accuracyComponent = clamp(fgPct / 100, 0, 1) * 50;
  return Math.round(Math.min(accuracyComponent + volumeBonus, MAX_ATTRIBUTE_RATING));
}

/**
 * Layup / Finishing Rating
 * Based on finishing and floaters drill completions
 */
function calculateLayup(drillCompletions: DrillCompletion[]): number {
  const finishingDrills = drillCompletions.filter((d) => d.completed).length;
  const drillComponent = Math.min(finishingDrills * 3, 65);
  const recentDays = getDateDaysAgo(30);
  const recentCompletions = drillCompletions.filter(
    (d) => d.date >= recentDays && d.completed
  ).length;
  const consistencyBonus = Math.min(recentCompletions / 6, 1) * 34;
  return Math.round(Math.min(drillComponent + consistencyBonus, MAX_ATTRIBUTE_RATING));
}

/**
 * Free Throw Rating
 * Based on FT% and volume from practice days
 */
function calculateFreeThrow(practiceDays: PracticeDay[]): number {
  let totalMakes = 0;
  let totalAttempts = 0;
  for (const day of practiceDays) {
    if (day.freeThrows) {
      totalMakes += isFinite(day.freeThrows.makes) ? Math.max(0, day.freeThrows.makes) : 0;
      totalAttempts += isFinite(day.freeThrows.attempts) ? Math.max(0, day.freeThrows.attempts) : 0;
    }
  }
  totalMakes = Math.min(totalMakes, totalAttempts);
  if (totalAttempts === 0) return 0;
  const ftPct = safePercent(totalMakes, totalAttempts);
  const accuracyComponent = clamp(ftPct / 100, 0, 1) * 65;
  const volumeBonus = Math.min(totalAttempts / 300, 1) * 34;
  return Math.round(Math.min(accuracyComponent + volumeBonus, MAX_ATTRIBUTE_RATING));
}

/**
 * Handles Rating
 * Based on ball-handling workout completions
 * Formula: (ball-handling drills * 3) + (workout consistency bonus)
 */
function calculateHandles(drillCompletions: DrillCompletion[]): number {
  // Count ball-handling drills
  // In real implementation, check drill.category === "ball_handling"
  const handleDrills = drillCompletions.filter((d) => d.completed).length;

  const drillComponent = Math.min(handleDrills * 3, 65);
  const recentDays = getDateDaysAgo(30);
  const recentDrills = drillCompletions.filter(
    (d) => d.date >= recentDays && d.completed
  ).length;
  const consistencyBonus = Math.min(recentDrills / 8, 1) * 34;
  return Math.round(Math.min(drillComponent + consistencyBonus, MAX_ATTRIBUTE_RATING));
}

/**
 * Conditioning / Work Rate Rating
 * Based on streak length, recent activity, and workout volume
 * Formula: (streak bonus) + (recent days trained) + (volume bonus)
 */
function calculateConditioning(
  practiceDays: PracticeDay[],
  gamification: GamificationState
): number {
  const streakBonus = Math.min(gamification.currentStreakDays / 30, 1) * 35;
  const recentDays = getDateDaysAgo(30);
  const recentPracticeDays = practiceDays.filter(
    (d) => d.date >= recentDays && d.sessions.length > 0
  ).length;
  const activityBonus = Math.min(recentPracticeDays / 25, 1) * 32;
  const totalSessions = practiceDays.reduce(
    (sum, d) => sum + d.sessions.length,
    0
  );
  const volumeBonus = Math.min(totalSessions / 150, 1) * 32;
  return Math.round(Math.min(streakBonus + activityBonus + volumeBonus, MAX_ATTRIBUTE_RATING));
}
