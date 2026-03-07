// Achievements and Milestones System

import { ShootingSet, PracticeDay, GamificationState, DrillCompletion } from "./types";
import { safePercent } from "../utils/number";
import { getDateDaysAgo } from "../utils/dates";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Ionicons name
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string; // ISO date string when unlocked
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  checkCondition: (data: AchievementCheckData) => boolean;
}

export interface AchievementCheckData {
  shootingSets: ShootingSet[];
  practiceDays: PracticeDay[];
  drillCompletions: DrillCompletion[];
  gamification: GamificationState;
}

/**
 * Get all achievement definitions
 */
export function getAchievementDefinitions(): AchievementDefinition[] {
  return [
    {
      id: "career_1000_shots",
      name: "1,000 Career Shots",
      description: "Log 1,000 total shooting attempts",
      icon: "basketball",
      xpReward: 100,
      checkCondition: (data) => {
        const totalAttempts = data.shootingSets.reduce(
          (sum, s) => sum + (s.attempts || 0),
          0
        );
        return totalAttempts >= 1000;
      },
    },
    {
      id: "streak_10_days",
      name: "10-Day Streak",
      description: "Maintain a 10-day training streak",
      icon: "flame",
      xpReward: 50,
      checkCondition: (data) => {
        return data.gamification.currentStreakDays >= 10;
      },
    },
    {
      id: "free_throw_80_percent",
      name: "Free Throw Master",
      description: "Shoot 80%+ from the free throw line over 5 sessions",
      icon: "target",
      xpReward: 75,
      checkCondition: (data) => {
        // Get last 5 practice days with free throw data
        const daysWithFT = data.practiceDays
          .filter((d) => d.freeThrows && d.freeThrows.attempts > 0)
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 5);

        if (daysWithFT.length < 5) return false;

        const totalMakes = daysWithFT.reduce(
          (sum, d) => sum + (d.freeThrows?.makes || 0),
          0
        );
        const totalAttempts = daysWithFT.reduce(
          (sum, d) => sum + (d.freeThrows?.attempts || 0),
          0
        );

        if (totalAttempts < 20) return false; // Need at least 20 attempts total

        const ftPercentage = safePercent(totalMakes, totalAttempts);
        return ftPercentage >= 80;
      },
    },
    {
      id: "first_elite_workout",
      name: "Elite Trainee",
      description: "Complete your first Elite workout",
      icon: "trophy",
      xpReward: 50,
      checkCondition: (data) => {
        // Check if any completed drill has "Elite" in its name
        // We'll need to check against workout/drill names
        // For now, check if any drill completion exists (will be enhanced with workout tracking)
        const eliteDrillIds = [
          "perimeter_1", // Ray Allen Corner 3 Series
          "finishing_1", // Elite Floater Package
          "handle_2", // Cone Series Elite
        ];
        return data.drillCompletions.some(
          (d) => d.completed && eliteDrillIds.includes(d.drillId)
        );
      },
    },
    {
      id: "career_5000_shots",
      name: "5,000 Career Shots",
      description: "Log 5,000 total shooting attempts",
      icon: "basketball-outline",
      xpReward: 250,
      checkCondition: (data) => {
        const totalAttempts = data.shootingSets.reduce(
          (sum, s) => sum + (s.attempts || 0),
          0
        );
        return totalAttempts >= 5000;
      },
    },
    {
      id: "streak_30_days",
      name: "30-Day Streak",
      description: "Maintain a 30-day training streak",
      icon: "flame-outline",
      xpReward: 200,
      checkCondition: (data) => {
        return data.gamification.currentStreakDays >= 30;
      },
    },
    {
      id: "perfect_free_throw_session",
      name: "Perfect Session",
      description: "Make 100% of free throws in a single session (min 10 attempts)",
      icon: "star",
      xpReward: 100,
      checkCondition: (data) => {
        return data.practiceDays.some(
          (d) =>
            d.freeThrows &&
            d.freeThrows.attempts >= 10 &&
            d.freeThrows.makes === d.freeThrows.attempts
        );
      },
    },
    {
      id: "workout_warrior_50",
      name: "Workout Warrior",
      description: "Complete 50 workouts",
      icon: "fitness",
      xpReward: 150,
      checkCondition: (data) => {
        return data.drillCompletions.filter((d) => d.completed).length >= 50;
      },
    },
  ];
}
