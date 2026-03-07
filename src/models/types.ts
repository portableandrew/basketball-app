// Core data models for Bucket Tracker

export type ShotType = "three" | "midrange" | "other";
export type TimeOfDay = "morning" | "afternoon" | "other";
export type DrillCategory = "finishing" | "floaters" | "ball_handling" | "other";
export type ScheduleType = "school" | "school_holiday" | "family_holiday" | "rest";
export type FamilyHolidaySchedule = "no_scheduled" | "custom";

export interface ShotSpot {
  id: string;
  name: string;
  type: ShotType;
  isActive: boolean;
}

export interface ShootingSet {
  id: string;
  date: string; // ISO string
  timeOfDay: TimeOfDay;
  spotId: string;
  makes: number;
  attempts: number;
}

export interface ChecklistDrill {
  id: string;
  category: DrillCategory;
  name: string;
  description: string;
  defaultDurationMinutes?: number;
  isActive: boolean;
}

export interface DrillCompletion {
  id: string;
  drillId: string;
  date: string; // ISO string
  timeOfDay: TimeOfDay;
  completed: boolean;
}

export type SessionTimeSlot = "morning" | "evening" | "custom";
export type SessionType = "shooting" | "gym" | "vertical" | "drill" | "mixed";

export interface PracticeSession {
  id: string;
  date: string; // ISO string (YYYY-MM-DD Victoria timezone)
  timeSlot: SessionTimeSlot; // "morning" | "evening" | "custom"
  timeSlotId: string; // e.g. "holiday_morning", "school_afternoon" (for backward compatibility)
  type: SessionType; // "shooting" | "gym" | "vertical" | "drill" | "mixed"
  shootingSets: string[]; // IDs of ShootingSet records
  drillCompletions: string[]; // IDs of DrillCompletion records
  trainingSessions?: string[]; // IDs of TrainingSession records (if any)
}

export type TrainingSessionType = "gym" | "vertical_jump";

export interface TrainingSession {
  id: string;
  date: string; // ISO string (date only, no time)
  type: TrainingSessionType;
  completed: boolean;
  notes?: string; // Optional notes
  durationMinutes: number; // Gym: 60, Vertical Jump: 10
}

export interface PracticeDay {
  date: string; // ISO string (date only, no time)
  isRestDay: boolean;
  isSchoolHoliday: boolean;
  isFamilyHoliday: boolean;
  sessions: PracticeSession[];
  freeThrows?: {
    makes: number;
    attempts: number;
  };
  trainingSessions?: TrainingSession[]; // Gym and Vertical Jump sessions
}

export interface UserProfile {
  id: string;
  name: string;
  isSchoolDaySchedule: boolean;
  restDays: string[]; // ISO date strings
  familyHolidaySchedule: FamilyHolidaySchedule; // "no_scheduled" or "custom"
  familyHolidayCustomSlots?: {
    startTime: string;
    endTime: string;
  }[];
  familyHolidayDates: string[]; // ISO date strings
}

export interface GamificationState {
  totalXp: number;
  level: number;
  rank: string;
  currentStreakDays: number;
  bestStreakDays: number;
  currency: number; // In-game currency (VC/Tokens)
  lastCompletionISO?: string; // ISO timestamp of last completion (for streak reconciliation)
}

export interface PracticeSchedule {
  type: ScheduleType;
  timeSlots: {
    id: string;
    name: string;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  }[];
}

// Computed stats (not stored, calculated on demand)
export interface ProgressStats {
  shootingStats: {
    spotId: string;
    spotName: string;
    makes: number;
    attempts: number;
    percentage: number;
  }[];
  xpHistory: {
    date: string;
    xp: number;
  }[];
  streakInfo: {
    current: number;
    best: number;
  };
}
