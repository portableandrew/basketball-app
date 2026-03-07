// XP calculation constants and rank definitions

import { ScheduleType } from "./types";

// XP Awards - Updated for NBA-level progression
export const XP_CONSTANTS = {
  PER_MAKE: 2,
  PER_ATTEMPT: 0.2,
  PER_DRILL_COMPLETION: 20,
  DAILY_SESSION_BONUS: 50,
  STREAK_BONUS_MULTIPLIER: 1.1, // 10% bonus when extending streak
  PER_GYM_SESSION: 100, // Higher XP for gym sessions (60 min)
  PER_VERTICAL_JUMP_SESSION: 30, // Moderate XP for vertical jump training (10 min)
} as const;

// Level calculation: level = floor(total XP / 500) + 1
export const XP_PER_LEVEL = 500;

// Note: Rank definitions moved to src/models/ranks.ts
// Use getRankForLevel(level) from that module

// School holiday date ranges (month/day format, recurring yearly)
export const SCHOOL_HOLIDAY_RANGES = [
  { start: { month: 12, day: 6 }, end: { month: 1, day: 31 } }, // Dec 6 - Jan 31
  { start: { month: 4, day: 4 }, end: { month: 4, day: 23 } }, // Apr 4 - Apr 23
  { start: { month: 6, day: 27 }, end: { month: 7, day: 22 } }, // Jun 27 - Jul 22
  { start: { month: 9, day: 19 }, end: { month: 10, day: 6 } }, // Sep 19 - Oct 6
] as const;

// Default practice schedules
export const DEFAULT_SCHEDULES: Record<ScheduleType, any> = {
  school: {
    type: "school" as const,
    timeSlots: [
      {
        id: "school_morning",
        name: "Morning",
        startTime: "06:00",
        endTime: "07:40",
      },
      {
        id: "school_afternoon",
        name: "Afternoon",
        startTime: "16:00",
        endTime: "18:30",
      },
    ],
  },
  school_holiday: {
    type: "school_holiday" as const,
    timeSlots: [
      {
        id: "school_holiday_morning",
        name: "Morning",
        startTime: "07:00",
        endTime: "10:00",
      },
      {
        id: "school_holiday_afternoon",
        name: "Afternoon",
        startTime: "14:00",
        endTime: "17:00",
      },
    ],
  },
  family_holiday: {
    type: "family_holiday" as const,
    timeSlots: [], // Will be populated based on user preference
  },
  rest: {
    type: "rest" as const,
    timeSlots: [],
  },
};

// Default shot spots
export const DEFAULT_SHOT_SPOTS = [
  { id: "spot_1", name: "Right Corner 3", type: "three" as const, isActive: true },
  { id: "spot_2", name: "Right Wing 3", type: "three" as const, isActive: true },
  { id: "spot_3", name: "Top 3", type: "three" as const, isActive: true },
  { id: "spot_4", name: "Left Wing 3", type: "three" as const, isActive: true },
  { id: "spot_5", name: "Left Corner 3", type: "three" as const, isActive: true },
];

// Default drills - NBA-level advanced workouts
export const DEFAULT_DRILLS = [
  {
    id: "drill_1",
    category: "floaters" as const,
    name: "Elite Floater Series",
    description: "Game-speed floaters off both feet, one foot, and off the dribble. Work from both sides of the key with defenders in mind",
    defaultDurationMinutes: 20,
    isActive: true,
  },
  {
    id: "drill_2",
    category: "floaters" as const,
    name: "Transition Floater Package",
    description: "Full-court sprints finishing with floaters at game speed. Practice from different angles and speeds",
    defaultDurationMinutes: 15,
    isActive: true,
  },
  {
    id: "drill_3",
    category: "finishing" as const,
    name: "NBA Finishing Package",
    description: "Advanced finishes: reverse layups, euro steps, spin moves, and-1 finishes, and contact finishes with both hands",
    defaultDurationMinutes: 25,
    isActive: true,
  },
  {
    id: "drill_4",
    category: "finishing" as const,
    name: "Contact Finishing Drill",
    description: "Finish through contact using pads or defenders. Work on body control, strength, and finishing with both hands",
    defaultDurationMinutes: 20,
    isActive: true,
  },
  {
    id: "drill_5",
    category: "ball_handling" as const,
    name: "Pro Handle Series",
    description: "Advanced ball handling: between-the-legs, behind-the-back, spin moves, and combo moves at game speed",
    defaultDurationMinutes: 25,
    isActive: true,
  },
  {
    id: "drill_6",
    category: "ball_handling" as const,
    name: "Two-Ball Advanced",
    description: "Elite two-ball dribbling: crossovers, between legs, behind back, and speed variations simultaneously",
    defaultDurationMinutes: 20,
    isActive: true,
  },
  {
    id: "drill_7",
    category: "ball_handling" as const,
    name: "Game-Speed Moves",
    description: "Full-court ball handling with game-speed moves, changes of direction, and finishing at the rim",
    defaultDurationMinutes: 20,
    isActive: true,
  },
  {
    id: "drill_8",
    category: "other" as const,
    name: "Pull-Up Jumper Series",
    description: "Game-speed pull-up jumpers from midrange and three-point range. Work off the dribble from both sides",
    defaultDurationMinutes: 20,
    isActive: true,
  },
  {
    id: "drill_9",
    category: "other" as const,
    name: "Step-Back Shooting",
    description: "Master the step-back three-pointer. Work on creating space and shooting off balance",
    defaultDurationMinutes: 15,
    isActive: true,
  },
  {
    id: "drill_10",
    category: "other" as const,
    name: "Fadeaway Jumper",
    description: "Post-up fadeaways and midrange fadeaways. Work on balance and shooting over defenders",
    defaultDurationMinutes: 15,
    isActive: true,
  },
  {
    id: "drill_11",
    category: "other" as const,
    name: "Form Shooting Fundamentals",
    description: "Master the fundamentals of shooting form. Work close to the rim focusing on perfect mechanics: balance, alignment, release, and follow-through. 100 makes from various close-range spots.",
    defaultDurationMinutes: 20,
    isActive: true,
  },
];
