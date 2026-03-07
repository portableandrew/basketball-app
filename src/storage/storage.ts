// Storage layer using AsyncStorage

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ShotSpot,
  ShootingSet,
  ChecklistDrill,
  DrillCompletion,
  PracticeDay,
  PracticeSession,
  UserProfile,
  GamificationState,
} from "../models/types";
import { getRankForLevel } from "../models/ranks";
import { getLevelFromXP } from "../utils/xp";
import { CosmeticsState, EquippedCosmetics } from "../models/cosmetics";
import { DEFAULT_SHOT_SPOTS, DEFAULT_DRILLS } from "../models/constants";
import { Achievement } from "../models/achievements";

// Storage keys
const KEYS = {
  SHOT_SPOTS: "@bucket_tracker:shot_spots",
  SHOOTING_SETS: "@bucket_tracker:shooting_sets",
  DRILLS: "@bucket_tracker:drills",
  DRILL_COMPLETIONS: "@bucket_tracker:drill_completions",
  PRACTICE_DAYS: "@bucket_tracker:practice_days",
  PRACTICE_SESSIONS: "@bucket_tracker:practice_sessions",
  USER_PROFILE: "@bucket_tracker:user_profile",
  GAMIFICATION: "@bucket_tracker:gamification",
  COSMETICS: "@bucket_tracker:cosmetics",
  ACHIEVEMENTS: "@bucket_tracker:achievements",
  DAILY_CHALLENGE_COMPLETIONS: "@bucket_tracker:daily_challenge_completions",
} as const;

// Generic storage helpers
async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    // Validate value before stringifying
    if (value === undefined) {
      throw new Error(`Cannot save undefined value for key ${key}`);
    }
    
    // Try to stringify first to catch serialization errors early
    let jsonString: string;
    try {
      jsonString = JSON.stringify(value);
    } catch (stringifyError) {
      console.error(`JSON.stringify failed for key ${key}:`, stringifyError);
      console.error(`Value type:`, typeof value);
      console.error(`Value:`, value);
      throw new Error(`Failed to serialize data for ${key}: ${stringifyError instanceof Error ? stringifyError.message : String(stringifyError)}`);
    }
    
    await AsyncStorage.setItem(key, jsonString);
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    throw error;
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    throw error;
  }
}

// Shot Spots
export async function getShotSpots(): Promise<ShotSpot[]> {
  const spots = await getItem<ShotSpot[]>(KEYS.SHOT_SPOTS);
  if (!spots || spots.length === 0) {
    // Initialize with defaults
    await setShotSpots(DEFAULT_SHOT_SPOTS);
    return DEFAULT_SHOT_SPOTS;
  }
  return spots;
}

export async function setShotSpots(spots: ShotSpot[]): Promise<void> {
  await setItem(KEYS.SHOT_SPOTS, spots);
}

export async function addShotSpot(spot: ShotSpot): Promise<void> {
  const spots = await getShotSpots();
  await setShotSpots([...spots, spot]);
}

export async function updateShotSpot(spotId: string, updates: Partial<ShotSpot>): Promise<void> {
  const spots = await getShotSpots();
  const index = spots.findIndex((s) => s.id === spotId);
  if (index >= 0) {
    spots[index] = { ...spots[index], ...updates };
    await setShotSpots(spots);
  }
}

export async function deleteShotSpot(spotId: string): Promise<void> {
  const spots = await getShotSpots();
  await setShotSpots(spots.filter((s) => s.id !== spotId));
}

// Shooting Sets
export async function getShootingSets(): Promise<ShootingSet[]> {
  return (await getItem<ShootingSet[]>(KEYS.SHOOTING_SETS)) || [];
}

export async function addShootingSet(set: ShootingSet): Promise<void> {
  const sets = await getShootingSets();
  await setItem(KEYS.SHOOTING_SETS, [...sets, set]);
}

export async function getShootingSetsByDate(date: string): Promise<ShootingSet[]> {
  const sets = await getShootingSets();
  return sets.filter((s) => s.date.startsWith(date));
}

// Drills
export async function getDrills(): Promise<ChecklistDrill[]> {
  const drills = await getItem<ChecklistDrill[]>(KEYS.DRILLS);
  if (!drills || drills.length === 0) {
    // Initialize with defaults
    await setDrills(DEFAULT_DRILLS);
    return DEFAULT_DRILLS;
  }
  return drills;
}

export async function setDrills(drills: ChecklistDrill[]): Promise<void> {
  await setItem(KEYS.DRILLS, drills);
}

export async function addDrill(drill: ChecklistDrill): Promise<void> {
  const drills = await getDrills();
  await setDrills([...drills, drill]);
}

export async function updateDrill(drillId: string, updates: Partial<ChecklistDrill>): Promise<void> {
  const drills = await getDrills();
  const index = drills.findIndex((d) => d.id === drillId);
  if (index >= 0) {
    drills[index] = { ...drills[index], ...updates };
    await setDrills(drills);
  }
}

export async function deleteDrill(drillId: string): Promise<void> {
  const drills = await getDrills();
  await setDrills(drills.filter((d) => d.id !== drillId));
}

// Drill Completions
export async function getDrillCompletions(): Promise<DrillCompletion[]> {
  return (await getItem<DrillCompletion[]>(KEYS.DRILL_COMPLETIONS)) || [];
}

export async function addDrillCompletion(completion: DrillCompletion): Promise<void> {
  const completions = await getDrillCompletions();
  await setItem(KEYS.DRILL_COMPLETIONS, [...completions, completion]);
}

export async function getDrillCompletionsByDate(date: string): Promise<DrillCompletion[]> {
  const completions = await getDrillCompletions();
  return completions.filter((c) => c.date.startsWith(date));
}

// Practice Sessions
export async function getPracticeSessions(): Promise<PracticeSession[]> {
  return (await getItem<PracticeSession[]>(KEYS.PRACTICE_SESSIONS)) || [];
}

export async function addPracticeSession(session: PracticeSession): Promise<void> {
  const sessions = await getPracticeSessions();
  await setItem(KEYS.PRACTICE_SESSIONS, [...sessions, session]);
}

// Practice Days
export async function getPracticeDays(): Promise<PracticeDay[]> {
  return (await getItem<PracticeDay[]>(KEYS.PRACTICE_DAYS)) || [];
}

export async function getPracticeDay(date: string): Promise<PracticeDay | null> {
  const days = await getPracticeDays();
  return days.find((d) => d.date === date) || null;
}

export async function savePracticeDay(day: PracticeDay): Promise<void> {
  try {
    // Validate day object
    if (!day || typeof day !== "object") {
      throw new Error(`Invalid practice day object: ${typeof day}`);
    }
    if (!day.date || typeof day.date !== "string") {
      throw new Error(`Invalid practice day date: ${day.date}`);
    }
    if (!Array.isArray(day.sessions)) {
      throw new Error(`practiceDay.sessions must be an array, got: ${typeof day.sessions}`);
    }
    
    // Validate each session in the array
    for (let i = 0; i < day.sessions.length; i++) {
      const session = day.sessions[i];
      if (!session || typeof session !== "object") {
        throw new Error(`Invalid session at index ${i}: ${typeof session}`);
      }
      if (!session.id || typeof session.id !== "string") {
        throw new Error(`Session at index ${i} missing or invalid id: ${session.id}`);
      }
      if (!session.date || typeof session.date !== "string") {
        throw new Error(`Session at index ${i} missing or invalid date: ${session.date}`);
      }
      if (!session.timeSlot || !["morning", "evening", "custom"].includes(session.timeSlot)) {
        throw new Error(`Session at index ${i} missing or invalid timeSlot: ${session.timeSlot}`);
      }
      if (!session.type || !["shooting", "gym", "vertical", "drill", "mixed"].includes(session.type)) {
        throw new Error(`Session at index ${i} missing or invalid type: ${session.type}`);
      }
      if (!Array.isArray(session.shootingSets)) {
        throw new Error(`Session at index ${i} shootingSets must be an array`);
      }
      if (!Array.isArray(session.drillCompletions)) {
        throw new Error(`Session at index ${i} drillCompletions must be an array`);
      }
    }
    
    const days = await getPracticeDays();
    const { isSchoolHoliday } = await import("../utils/holidays");
    
    // Ensure holiday flags are set
    if (day.isSchoolHoliday === undefined) {
      day.isSchoolHoliday = isSchoolHoliday(day.date);
    }
    if (day.isFamilyHoliday === undefined) {
      const profile = await getUserProfile();
      day.isFamilyHoliday = profile?.familyHolidayDates?.includes(day.date) || false;
    }
    
    const index = days.findIndex((d) => d.date === day.date);
    if (index >= 0) {
      days[index] = day;
    } else {
      days.push(day);
    }
    
    await setItem(KEYS.PRACTICE_DAYS, days);
  } catch (error) {
    console.error("Error in savePracticeDay:", error);
    throw error;
  }
}

export async function markRestDay(date: string, isRestDay: boolean): Promise<void> {
  const day = await getPracticeDay(date);
  const { isSchoolHoliday } = await import("../utils/holidays");
  const isSchoolHolidayDate = isSchoolHoliday(date);
  
  if (day) {
    day.isRestDay = isRestDay;
    day.isSchoolHoliday = isSchoolHolidayDate;
    await savePracticeDay(day);
  } else {
    await savePracticeDay({
      date,
      isRestDay,
      isSchoolHoliday: isSchoolHolidayDate,
      isFamilyHoliday: false,
      sessions: [],
    });
  }
}

export async function markFamilyHoliday(date: string, isFamilyHoliday: boolean): Promise<void> {
  const profile = await getUserProfile();
  if (!profile) return;

  if (isFamilyHoliday) {
    if (!profile.familyHolidayDates.includes(date)) {
      profile.familyHolidayDates.push(date);
    }
  } else {
    profile.familyHolidayDates = profile.familyHolidayDates.filter((d) => d !== date);
  }
  await setUserProfile(profile);

  // Update practice day
  const day = await getPracticeDay(date);
  const { isSchoolHoliday } = await import("../utils/holidays");
  const isSchoolHolidayDate = isSchoolHoliday(date);
  
  if (day) {
    day.isFamilyHoliday = isFamilyHoliday;
    day.isSchoolHoliday = isSchoolHolidayDate;
    await savePracticeDay(day);
  } else {
    await savePracticeDay({
      date,
      isRestDay: false,
      isSchoolHoliday: isSchoolHolidayDate,
      isFamilyHoliday,
      sessions: [],
    });
  }
}

// User Profile
export async function getUserProfile(): Promise<UserProfile | null> {
  const profile = await getItem<UserProfile>(KEYS.USER_PROFILE);
  if (!profile) {
    // Initialize default profile
    const defaultProfile: UserProfile = {
      id: "user_1",
      name: "Player",
      isSchoolDaySchedule: true,
      restDays: [],
      familyHolidaySchedule: "no_scheduled",
      familyHolidayDates: [],
    };
    await setUserProfile(defaultProfile);
    return defaultProfile;
  }
  // Migrate old profiles
  if (!profile.familyHolidaySchedule) {
    profile.familyHolidaySchedule = "no_scheduled";
  }
  if (!profile.familyHolidayDates) {
    profile.familyHolidayDates = [];
  }
  return profile;
}

export async function setUserProfile(profile: UserProfile): Promise<void> {
  await setItem(KEYS.USER_PROFILE, profile);
}

// Gamification State
export async function getGamificationState(): Promise<GamificationState> {
  const state = await getItem<GamificationState>(KEYS.GAMIFICATION);
  if (!state) {
    // Initialize default state - use rank system
    const defaultLevel = 1;
    const defaultRank = getRankForLevel(defaultLevel);
    const defaultState: GamificationState = {
      totalXp: 0,
      level: defaultLevel,
      rank: defaultRank.name,
      currentStreakDays: 0,
      bestStreakDays: 0,
      currency: 100, // Starting currency
    };
    await setGamificationState(defaultState);
    return defaultState;
  }
  // Migrate old state without currency
  if (state.currency === undefined) {
    state.currency = 100;
    await setGamificationState(state);
  }

  // Recalculate streak from practice data so rest days don't reset it
  const { calculateStreak } = await import("../utils/streaks");
  const { getTodayDateString } = await import("../utils/dates");
  const [practiceDays, shootingSets, profile] = await Promise.all([
    getPracticeDays(),
    getShootingSets(),
    getUserProfile(),
  ]);
  const streakInfo = calculateStreak(
    practiceDays,
    getTodayDateString(),
    shootingSets,
    profile?.familyHolidayDates || []
  );
  if (state.currentStreakDays !== streakInfo.current || state.bestStreakDays !== Math.max(state.bestStreakDays, streakInfo.best)) {
    state.currentStreakDays = streakInfo.current;
    state.bestStreakDays = Math.max(state.bestStreakDays, streakInfo.best);
    await setGamificationState(state);
  }
  return state;
}

export async function setGamificationState(state: GamificationState): Promise<void> {
  await setItem(KEYS.GAMIFICATION, state);
}

// Cosmetics State
export async function getCosmeticsState(): Promise<CosmeticsState> {
  const { DEFAULT_EQUIPPED, DEFAULT_COSMETICS_STATE } = await import("../models/cosmetics");
  
  // SAFETY: If cosmetics state is corrupted, wipe it and start fresh
  let state = await getItem<CosmeticsState>(KEYS.COSMETICS);
  
  // Force wipe if state exists but is malformed
  if (state) {
    try {
      // Validate state structure
      if (!state.ownedCosmetics || !Array.isArray(state.ownedCosmetics)) {
        console.warn("Corrupted cosmetics state detected - wiping");
        await wipeCosmeticsStorage();
        state = null;
      } else if (!state.equippedCosmetics || typeof state.equippedCosmetics !== 'object') {
        console.warn("Corrupted equippedCosmetics detected - wiping");
        await wipeCosmeticsStorage();
        state = null;
      }
    } catch (error) {
      console.error("Error validating cosmetics state - wiping:", error);
      await wipeCosmeticsStorage();
      state = null;
    }
  }
  
  if (!state) {
    // Initialize default state with starter cosmetics (NO theme in equipped)
    const cleanState: CosmeticsState = {
      ownedCosmetics: [
        "jersey_classic_white",
        "accessory_headband_none",
        "shoe_classic_white",
        "ball_classic_orange",
      ],
      equippedCosmetics: {
        ...DEFAULT_EQUIPPED,
        jersey: "jersey_classic_white",
        accessory: "accessory_headband_none",
        shoe: "shoe_classic_white",
        ball: "ball_classic_orange",
        // theme is explicitly null - NOT read from cosmetics
        theme: null,
      },
    };
    await setCosmeticsState(cleanState);
    return cleanState;
  }
  
  // Ensure ownedCosmetics exists
  if (!state.ownedCosmetics) {
    state.ownedCosmetics = [];
  }
  
  // CRITICAL: Normalize equippedCosmetics to DEFAULT_EQUIPPED structure
  // This ensures ALL fields exist, even if they're null
  // SAFETY: theme is ALWAYS null - never read from cosmetics
  if (!state.equippedCosmetics || typeof state.equippedCosmetics !== 'object') {
    // If equippedCosmetics is missing or invalid, use DEFAULT_EQUIPPED
    state.equippedCosmetics = { ...DEFAULT_EQUIPPED };
  } else {
    // SAFE ACCESS: Use optional chaining and nullish coalescing for EVERY field
    // Start with DEFAULT_EQUIPPED, then override with loaded values (or keep null)
    const loaded = state.equippedCosmetics;
    state.equippedCosmetics = {
      // ALWAYS start with DEFAULT_EQUIPPED to ensure all fields exist
      ...DEFAULT_EQUIPPED,
      // Then safely override with loaded values (if they exist and are valid)
      theme: null, // ALWAYS null - themes not read from cosmetics
      jersey: (loaded && typeof loaded === 'object' && 'jersey' in loaded) ? (loaded.jersey ?? null) : DEFAULT_EQUIPPED.jersey,
      hat: (loaded && typeof loaded === 'object' && 'hat' in loaded) ? (loaded.hat ?? null) : DEFAULT_EQUIPPED.hat,
      accessory: (loaded && typeof loaded === 'object' && 'accessory' in loaded) ? (loaded.accessory ?? null) : DEFAULT_EQUIPPED.accessory,
      shoe: (loaded && typeof loaded === 'object' && 'shoe' in loaded) ? (loaded.shoe ?? null) : DEFAULT_EQUIPPED.shoe,
      ball: (loaded && typeof loaded === 'object' && 'ball' in loaded) ? (loaded.ball ?? null) : DEFAULT_EQUIPPED.ball,
    };
  }
  
  // Final validation: ensure every field exists (not undefined)
  // If any field is undefined, replace it with null from DEFAULT_EQUIPPED
  const finalEquipped = state.equippedCosmetics;
  if (
    finalEquipped.theme === undefined ||
    finalEquipped.jersey === undefined ||
    finalEquipped.hat === undefined ||
    finalEquipped.accessory === undefined ||
    finalEquipped.shoe === undefined ||
    finalEquipped.ball === undefined
  ) {
    // Force normalize to DEFAULT_EQUIPPED structure
    state.equippedCosmetics = { ...DEFAULT_EQUIPPED };
    await setCosmeticsState(state);
  }
  
  return state;
}

export async function setCosmeticsState(state: CosmeticsState): Promise<void> {
  const { DEFAULT_EQUIPPED } = await import("../models/cosmetics");
  
  // SAFE ACCESS: Always normalize equippedCosmetics to DEFAULT_EQUIPPED structure
  // Never assume state.equippedCosmetics has all fields
  const loadedEquipped = state?.equippedCosmetics;
  const normalizedEquipped: EquippedCosmetics = {
    // Start with DEFAULT_EQUIPPED to ensure ALL fields exist
    ...DEFAULT_EQUIPPED,
    // Then safely override with loaded values (if they exist and are valid)
    theme: null, // ALWAYS null - themes not stored in cosmetics
    jersey: (loadedEquipped && typeof loadedEquipped === 'object' && 'jersey' in loadedEquipped) 
      ? (loadedEquipped.jersey ?? null) 
      : DEFAULT_EQUIPPED.jersey,
    hat: (loadedEquipped && typeof loadedEquipped === 'object' && 'hat' in loadedEquipped) 
      ? (loadedEquipped.hat ?? null) 
      : DEFAULT_EQUIPPED.hat,
    accessory: (loadedEquipped && typeof loadedEquipped === 'object' && 'accessory' in loadedEquipped) 
      ? (loadedEquipped.accessory ?? null) 
      : DEFAULT_EQUIPPED.accessory,
    shoe: (loadedEquipped && typeof loadedEquipped === 'object' && 'shoe' in loadedEquipped) 
      ? (loadedEquipped.shoe ?? null) 
      : DEFAULT_EQUIPPED.shoe,
    ball: (loadedEquipped && typeof loadedEquipped === 'object' && 'ball' in loadedEquipped) 
      ? (loadedEquipped.ball ?? null) 
      : DEFAULT_EQUIPPED.ball,
  };
  
  // Ensure we always save a complete state with ALL required fields
  const completeState: CosmeticsState = {
    ownedCosmetics: Array.isArray(state?.ownedCosmetics) ? state.ownedCosmetics : [],
    equippedCosmetics: normalizedEquipped,
  };
  
  await setItem(KEYS.COSMETICS, completeState);
}

// Clear all data (for testing/reset)
export async function clearAllData(): Promise<void> {
  await Promise.all(Object.values(KEYS).map((key) => removeItem(key)));
}

// Force wipe cosmetics storage - removes corrupted data
export async function wipeCosmeticsStorage(): Promise<void> {
  try {
    await removeItem(KEYS.COSMETICS);
    console.log("Cosmetics storage wiped - will reinitialize on next access");
  } catch (error) {
    console.error("Error wiping cosmetics storage:", error);
  }
}

// Achievements storage
export async function getAchievements(): Promise<Achievement[]> {
  return (await getItem<Achievement[]>(KEYS.ACHIEVEMENTS)) || [];
}

export async function setAchievements(achievements: Achievement[]): Promise<void> {
  await setItem(KEYS.ACHIEVEMENTS, achievements);
}

// Daily challenge completions (dates that have had their daily challenge completed)
export async function getDailyChallengeCompletions(): Promise<string[]> {
  return (await getItem<string[]>(KEYS.DAILY_CHALLENGE_COMPLETIONS)) || [];
}

export async function setDailyChallengeCompleted(date: string): Promise<void> {
  const completed = await getDailyChallengeCompletions();
  if (completed.includes(date)) return;
  await setItem(KEYS.DAILY_CHALLENGE_COMPLETIONS, [...completed, date]);
}
