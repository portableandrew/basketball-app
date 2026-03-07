// Profile Badges - Badge unlock logic and definitions

import {
  ShootingSet,
  DrillCompletion,
  PracticeDay,
  GamificationState,
} from "../models/types";
import { getDateDaysAgo, safeFormatDateToYYYYMMDD } from "./dates";
import { safePercent } from "./number";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Ionicons name
  unlocked: boolean;
}

/**
 * Calculate which badges are unlocked
 */
export function calculateBadges(
  shootingSets: ShootingSet[],
  drillCompletions: DrillCompletion[],
  practiceDays: PracticeDay[],
  gamification: GamificationState
): Badge[] {
  const allBadges = getBadgeDefinitions();

  return allBadges.map((badge) => {
    const unlocked = checkBadgeUnlock(
      badge.id,
      shootingSets,
      drillCompletions,
      practiceDays,
      gamification
    );
    return { ...badge, unlocked };
  });
}

/**
 * Get all badge definitions
 */
function getBadgeDefinitions(): Omit<Badge, "unlocked">[] {
  return [
    {
      id: "corner_specialist",
      name: "Corner Specialist",
      description: "Reach 40%+ FG from corners with 100+ attempts",
      icon: "location",
    },
    {
      id: "volume_shooter",
      name: "Volume Shooter",
      description: "Log 500+ total 3-point attempts",
      icon: "basketball",
    },
    {
      id: "gym_rat",
      name: "Gym Rat",
      description: "Reach a streak of 14+ days",
      icon: "flame",
    },
    {
      id: "iron_man",
      name: "Iron Man",
      description: "Reach a streak of 30+ days",
      icon: "shield",
    },
    {
      id: "grind_dont_stop",
      name: "Grind Don't Stop",
      description: "Log workouts on 5+ days in a single week",
      icon: "trophy",
    },
    {
      id: "comeback",
      name: "Comeback",
      description: "Raise FG% by 10%+ over last 14 days",
      icon: "trending-up",
    },
    {
      id: "sharp_shooter",
      name: "Sharp Shooter",
      description: "Maintain 45%+ FG over 100+ attempts",
      icon: "target",
    },
    {
      id: "workout_warrior",
      name: "Workout Warrior",
      description: "Complete 50+ workouts",
      icon: "fitness",
    },
    {
      id: "early_bird",
      name: "Early Bird",
      description: "Log 20+ morning sessions",
      icon: "sunny",
    },
    {
      id: "night_owl",
      name: "Night Owl",
      description: "Log 20+ afternoon/evening sessions",
      icon: "moon",
    },
  ];
}

/**
 * Check if a specific badge is unlocked
 */
function checkBadgeUnlock(
  badgeId: string,
  shootingSets: ShootingSet[],
  drillCompletions: DrillCompletion[],
  practiceDays: PracticeDay[],
  gamification: GamificationState
): boolean {
  switch (badgeId) {
    case "corner_specialist":
      return checkCornerSpecialist(shootingSets);

    case "volume_shooter":
      return checkVolumeShooter(shootingSets);

    case "gym_rat":
      return gamification.currentStreakDays >= 14;

    case "iron_man":
      return gamification.currentStreakDays >= 30;

    case "grind_dont_stop":
      return checkGrindDontStop(practiceDays);

    case "comeback":
      return checkComeback(shootingSets);

    case "sharp_shooter":
      return checkSharpShooter(shootingSets);

    case "workout_warrior":
      return drillCompletions.filter((d) => d.completed).length >= 50;

    case "early_bird":
      return checkEarlyBird(shootingSets, drillCompletions);

    case "night_owl":
      return checkNightOwl(shootingSets, drillCompletions);

    default:
      return false;
  }
}

/**
 * Corner Specialist: 40%+ FG from corners with 100+ attempts
 */
function checkCornerSpecialist(shootingSets: ShootingSet[]): boolean {
  const cornerSpots = ["spot_1", "spot_5"]; // Right Corner, Left Corner
  const cornerSets = shootingSets.filter((s) =>
    cornerSpots.includes(s.spotId)
  );

  const totalMakes = cornerSets.reduce((sum, s) => sum + s.makes, 0);
  const totalAttempts = cornerSets.reduce((sum, s) => sum + s.attempts, 0);

  if (totalAttempts < 100) return false;

  const fgPercentage = safePercent(totalMakes, totalAttempts);
  return fgPercentage >= 40;
}

/**
 * Volume Shooter: 500+ total 3-point attempts
 */
function checkVolumeShooter(shootingSets: ShootingSet[]): boolean {
  const totalAttempts = shootingSets.reduce((sum, s) => sum + s.attempts, 0);
  return totalAttempts >= 500;
}

/**
 * Grind Don't Stop: 5+ days in a single week
 */
function checkGrindDontStop(practiceDays: PracticeDay[]): boolean {
  // Group practice days by week
  const weeks = new Map<string, number>();

  practiceDays.forEach((day) => {
    if (day.sessions.length === 0) return;

    const date = new Date(day.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Sunday
    const weekKey = safeFormatDateToYYYYMMDD(weekStart);

    weeks.set(weekKey, (weeks.get(weekKey) || 0) + 1);
  });

  // Check if any week has 5+ days
  for (const count of weeks.values()) {
    if (count >= 5) return true;
  }

  return false;
}

/**
 * Comeback: Raise FG% by 10%+ over last 14 days
 */
function checkComeback(shootingSets: ShootingSet[]): boolean {
  const cutoff14Days = getDateDaysAgo(14);
  const cutoff28Days = getDateDaysAgo(28);

  // Last 14 days
  const recentSets = shootingSets.filter((s) => s.date >= cutoff14Days);
  const recentMakes = recentSets.reduce((sum, s) => sum + s.makes, 0);
  const recentAttempts = recentSets.reduce((sum, s) => sum + s.attempts, 0);

  // Previous 14 days (14-28 days ago)
  const previousSets = shootingSets.filter(
    (s) => s.date >= cutoff28Days && s.date < cutoff14Days
  );
  const previousMakes = previousSets.reduce((sum, s) => sum + s.makes, 0);
  const previousAttempts = previousSets.reduce((sum, s) => sum + s.attempts, 0);

  if (recentAttempts < 50 || previousAttempts < 50) return false;

  const recentFG = (recentMakes / recentAttempts) * 100;
  const previousFG = (previousMakes / previousAttempts) * 100;

  return recentFG >= previousFG + 10;
}

/**
 * Sharp Shooter: 45%+ FG over 100+ attempts
 */
function checkSharpShooter(shootingSets: ShootingSet[]): boolean {
  const totalMakes = shootingSets.reduce((sum, s) => sum + s.makes, 0);
  const totalAttempts = shootingSets.reduce((sum, s) => sum + s.attempts, 0);

  if (totalAttempts < 100) return false;

  const fgPercentage = safePercent(totalMakes, totalAttempts);
  return fgPercentage >= 45;
}

/**
 * Early Bird: 20+ morning sessions
 */
function checkEarlyBird(
  shootingSets: ShootingSet[],
  drillCompletions: DrillCompletion[]
): boolean {
  const morningSets = shootingSets.filter((s) => s.timeOfDay === "morning");
  const morningDrills = drillCompletions.filter(
    (d) => d.timeOfDay === "morning" && d.completed
  );

  return morningSets.length + morningDrills.length >= 20;
}

/**
 * Night Owl: 20+ afternoon/evening sessions
 */
function checkNightOwl(
  shootingSets: ShootingSet[],
  drillCompletions: DrillCompletion[]
): boolean {
  const afternoonSets = shootingSets.filter(
    (s) => s.timeOfDay === "afternoon" || s.timeOfDay === "other"
  );
  const afternoonDrills = drillCompletions.filter(
    (d) => (d.timeOfDay === "afternoon" || d.timeOfDay === "other") && d.completed
  );

  return afternoonSets.length + afternoonDrills.length >= 20;
}
