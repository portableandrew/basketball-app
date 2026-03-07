// Streak calculation utilities - Fixed and reliable

import { PracticeDay, ShootingSet } from "../models/types";
import { isSchoolHoliday } from "./holidays";
import { getTodayDateString, safeFormatDateToYYYYMMDD } from "./dates";

/**
 * Get the local date string (YYYY-MM-DD) from an ISO timestamp in the device's local timezone
 */
function getLocalDateString(isoString: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    
    // Use Intl.DateTimeFormat to get local date in device timezone
    const formatter = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch {
    return "";
  }
}

/**
 * Get the number of calendar days between two dates (in local timezone)
 * Returns positive number if date2 is after date1
 */
function getDaysBetween(date1ISO: string, date2ISO: string): number {
  if (!date1ISO || !date2ISO) return 0;
  try {
    const d1 = new Date(date1ISO);
    const d2 = new Date(date2ISO);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    
    const date1Str = getLocalDateString(date1ISO);
    const date2Str = getLocalDateString(date2ISO);
    if (!date1Str || !date2Str) return 0;
    
    const d1Local = new Date(date1Str + "T00:00:00");
    const d2Local = new Date(date2Str + "T00:00:00");
    const diffTime = d2Local.getTime() - d1Local.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return 0;
  }
}

/**
 * Pure function to reconcile streak state based on completion timestamps
 * 
 * Rules:
 * - Streak increments if at least one bucket action is completed per calendar day
 * - Multiple actions in the same day must NOT increment more than once
 * - Missing a day resets the streak
 * - Uses device local timezone
 * 
 * @param streakCount - Current stored streak count
 * @param lastCompletionISO - ISO timestamp of last completion (or undefined if never completed)
 * @param nowISO - Current ISO timestamp
 * @param timezone - Timezone identifier (optional, defaults to device local timezone)
 * @returns Object with updated streakCount and lastCompletionISO
 */
export function reconcileStreak({
  streakCount,
  lastCompletionISO,
  nowISO,
  timezone,
}: {
  streakCount: number;
  lastCompletionISO?: string;
  nowISO: string;
  timezone?: string;
}): {
  streakCount: number;
  lastCompletionISO: string;
} {
  // If no previous completion, start fresh
  if (!lastCompletionISO) {
    return {
      streakCount: 1,
      lastCompletionISO: nowISO,
    };
  }

  // Get local date strings for both timestamps
  const lastCompletionDate = getLocalDateString(lastCompletionISO);
  const nowDate = getLocalDateString(nowISO);

  // Invalid dates - reset streak
  if (!lastCompletionDate || !nowDate) {
    return {
      streakCount: 1,
      lastCompletionISO: nowISO,
    };
  }

  // Same calendar day - don't increment streak, but update timestamp
  if (lastCompletionDate === nowDate) {
    return {
      streakCount: streakCount,
      lastCompletionISO: nowISO, // Update to latest completion time
    };
  }

  // Calculate days between last completion and now
  const daysBetween = getDaysBetween(lastCompletionISO, nowISO);

  // If lastCompletion is in the future (shouldn't happen, but handle gracefully)
  if (daysBetween < 0) {
    return {
      streakCount: 1,
      lastCompletionISO: nowISO,
    };
  }

  // Consecutive day (exactly 1 day difference) - increment streak
  if (daysBetween === 1) {
    return {
      streakCount: streakCount + 1,
      lastCompletionISO: nowISO,
    };
  }

  // More than 1 day gap - streak is broken, reset to 1
  if (daysBetween > 1) {
    return {
      streakCount: 1,
      lastCompletionISO: nowISO,
    };
  }

  // daysBetween === 0 but dates are different (shouldn't happen, but handle)
  // This could happen with timezone edge cases - treat as same day
  return {
    streakCount: streakCount,
    lastCompletionISO: nowISO,
  };
}

export interface DayStatus {
  date: string;
  isTraining: boolean;
  isNeutral: boolean;
  streakValue: number;
  reason?: string; // Debug reason for status
}

/**
 * Check if a date is a training day
 * Training day = at least one workout logged OR any shooting attempts logged (including free throws) OR training sessions completed
 */
function isTrainingDay(
  date: string,
  practiceDays: PracticeDay[],
  shootingSets: ShootingSet[]
): boolean {
  if (!date) return false;
  
  // Check for practice sessions
  const practiceDay = (practiceDays && Array.isArray(practiceDays))
    ? practiceDays.find((d) => d && d.date === date)
    : undefined;
  if (practiceDay && practiceDay.sessions && practiceDay.sessions.length > 0) {
    return true;
  }

  // Check for shooting attempts (any spot)
  const hasShooting = (shootingSets && Array.isArray(shootingSets))
    ? shootingSets.some((set) => set && set.date && set.date.startsWith(date) && set.attempts > 0)
    : false;
  if (hasShooting) {
    return true;
  }

  // Check for free throws
  if (practiceDay?.freeThrows && practiceDay.freeThrows.attempts > 0) {
    return true;
  }

  // Check for training sessions (gym or vertical jump)
  if (practiceDay?.trainingSessions && practiceDay.trainingSessions.length > 0) {
    const hasCompletedTraining = practiceDay.trainingSessions.some((ts) => ts.completed);
    if (hasCompletedTraining) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a date is a neutral day (doesn't break streak, streak stays the same)
 * Neutral days: school holidays, family holidays, or any rest day (unlimited)
 */
function isNeutralDay(
  date: string,
  practiceDays: PracticeDay[],
  userFamilyHolidayDates: string[]
): { isNeutral: boolean; reason?: string } {
  // School holidays are always neutral
  if (isSchoolHoliday(date)) {
    return { isNeutral: true, reason: "school_holiday" };
  }

  // Family holidays are always neutral
  if (userFamilyHolidayDates.includes(date)) {
    return { isNeutral: true, reason: "family_holiday" };
  }

  // Rest days are always neutral - never reset streak
  const practiceDay = (practiceDays && Array.isArray(practiceDays))
    ? practiceDays.find((d) => d && d.date === date)
    : undefined;
  if (practiceDay?.isRestDay) {
    return { isNeutral: true, reason: "rest_day" };
  }

  return { isNeutral: false };
}

/**
 * Calculate current and best streak from all stored data
 */
export function calculateStreak(
  practiceDays: PracticeDay[],
  currentDate: string = getTodayDateString(),
  shootingSets: ShootingSet[] = [],
  userFamilyHolidayDates: string[] = []
): { current: number; best: number } {
  if (practiceDays.length === 0 && shootingSets.length === 0) {
    return { current: 0, best: 0 };
  }

  // Build training days set
  const trainingDates = new Set<string>();
  const allDates = new Set<string>();

  // Add all practice day dates
  if (practiceDays && Array.isArray(practiceDays)) {
    practiceDays.forEach((day) => {
      if (day && day.date) {
        allDates.add(day.date);
        if (isTrainingDay(day.date, practiceDays, shootingSets)) {
          trainingDates.add(day.date);
        }
      }
    });
  }

  // Add all shooting set dates
  if (shootingSets && Array.isArray(shootingSets)) {
    shootingSets.forEach((set) => {
      if (set && set.date) {
        const date = set.date.split("T")[0];
        allDates.add(date);
        if (set.attempts > 0) {
          trainingDates.add(date);
        }
      }
    });
  }

  // Calculate current streak (working backwards from currentDate)
  // Training days add to streak; rest days and holidays are neutral (streak stays same)
  let currentStreak = 0;
  let checkDate = new Date(currentDate);

  while (true) {
    const dateStr = safeFormatDateToYYYYMMDD(checkDate);
    const isTraining = trainingDates.has(dateStr);
    const neutralCheck = isNeutralDay(dateStr, practiceDays, userFamilyHolidayDates);

    if (isTraining) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (neutralCheck.isNeutral) {
      // Rest day or holiday: don't break streak, don't add - just skip
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Missed day (no training, not rest, not holiday) - streak ends
      break;
    }

    if (currentStreak > 365) break;
  }

  // Calculate best streak (scan all dates chronologically, day by day)
  // Find the earliest and latest dates
  const allDateStrings = Array.from(allDates);
  if (allDateStrings.length === 0) {
    return { current: currentStreak, best: 0 };
  }

  const sortedDates = allDateStrings.sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );
  const earliestDate = new Date(sortedDates[0]);
  const latestDate = new Date(sortedDates[sortedDates.length - 1]);

  // Scan day by day from earliest to latest
  let bestStreak = 0;
  let tempStreak = 0;
  let scanDate = new Date(earliestDate);

  while (scanDate <= latestDate) {
    const dateStr = safeFormatDateToYYYYMMDD(scanDate);
    const isTraining = trainingDates.has(dateStr);
    const neutralCheck = isNeutralDay(dateStr, practiceDays, userFamilyHolidayDates);

    if (isTraining) {
      tempStreak++;
    } else if (neutralCheck.isNeutral) {
      // Rest day or holiday: streak continues unchanged
    } else {
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 0;
    }

    scanDate.setDate(scanDate.getDate() + 1);
  }

  bestStreak = Math.max(bestStreak, tempStreak);

  return { current: currentStreak, best: bestStreak };
}

/**
 * Get debug information for the last N days showing streak calculation
 */
export function getStreakDebugInfo(
  practiceDays: PracticeDay[],
  shootingSets: ShootingSet[],
  userFamilyHolidayDates: string[],
  days: number = 14,
  currentDate: string = getTodayDateString()
): DayStatus[] {
  const result: DayStatus[] = [];
  const trainingDates = new Set<string>();

  // Build training dates
  if (practiceDays && Array.isArray(practiceDays)) {
    practiceDays.forEach((day) => {
      if (day && day.date && isTrainingDay(day.date, practiceDays, shootingSets)) {
        trainingDates.add(day.date);
      }
    });
  }
  if (shootingSets && Array.isArray(shootingSets)) {
    shootingSets.forEach((set) => {
      if (set && set.date) {
        const date = set.date.split("T")[0];
        if (set.attempts > 0) {
          trainingDates.add(date);
        }
      }
    });
  }

  // Calculate streak for each day (rest days and holidays keep streak same)
  let runningStreak = 0;

  for (let i = 0; i < days; i++) {
    const checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = safeFormatDateToYYYYMMDD(checkDate);

    const isTraining = trainingDates.has(dateStr);
    const neutralCheck = isNeutralDay(dateStr, practiceDays, userFamilyHolidayDates);

    let streakValue = 0;
    let reason = "";

    if (isTraining) {
      runningStreak++;
      streakValue = runningStreak;
      reason = "training";
    } else if (neutralCheck.isNeutral) {
      streakValue = runningStreak;
      reason = neutralCheck.reason || "neutral";
    } else {
      runningStreak = 0;
      reason = "missed";
    }

    result.unshift({
      date: dateStr,
      isTraining,
      isNeutral: neutralCheck.isNeutral,
      streakValue,
      reason,
    });
  }

  return result;
}

/**
 * Check if a date is a rest day
 */
export function isRestDay(
  date: string,
  practiceDays: PracticeDay[]
): boolean {
  const day = practiceDays.find((d) => d.date === date);
  return day?.isRestDay ?? false;
}

/**
 * Check if a date has practice logged
 */
export function hasPractice(
  date: string,
  practiceDays: PracticeDay[]
): boolean {
  if (!date || !practiceDays || !Array.isArray(practiceDays)) return false;
  const day = practiceDays.find((d) => d && d.date === date);
  return day && day.sessions && day.sessions.length > 0;
}
