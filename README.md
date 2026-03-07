# Bucket Tracker

A basketball training mobile app built with React Native and Expo for tracking daily solo training sessions, shooting practice, and skill drills.

## Features

### Core Functionality
- **Shooting Tracking**: Log makes and attempts for different shooting spots (3-pointers, midrange, etc.)
- **Drill Completion**: Track completion of non-shooting drills (floaters, finishing, ball-handling)
- **XP & Leveling System**: Earn XP for practice and level up with Fortnite-style ranks
- **Daily Streaks**: Track consecutive practice days with rest day support
- **Practice Schedule**: Calendar view with school day vs holiday schedules
- **Drill Suggestions**: Get workout suggestions based on category and available time

### Screens

1. **Home**: Overview with stats, streak, level/rank, and quick actions
2. **Stats**: Shooting percentages per spot, XP history, time range filters
3. **Calendar**: Month view with practice indicators (morning/afternoon sessions, rest days)
4. **Drills**: Manage drills and get workout suggestions
5. **Log Workout**: Multi-step form for logging practice sessions

## Tech Stack

- **React Native** with **Expo**
- **TypeScript**
- **React Navigation** (Bottom Tabs + Stack Navigator)
- **AsyncStorage** for local data persistence
- **React Native Gesture Handler** for navigation

## Project Structure

```
bucket-tracker/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── SpotInputRow.tsx
│   │   ├── DrillChecklistItem.tsx
│   │   ├── ProgressCard.tsx
│   │   └── CalendarDay.tsx
│   ├── models/             # TypeScript type definitions
│   │   ├── types.ts
│   │   └── constants.ts
│   ├── screens/             # Main app screens
│   │   ├── HomeScreen.tsx
│   │   ├── LogWorkoutScreen.tsx
│   │   ├── StatsScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   └── DrillsScreen.tsx
│   ├── storage/            # Data persistence layer
│   │   └── storage.ts
│   ├── utils/              # Utility functions
│   │   ├── xp.ts
│   │   ├── streaks.ts
│   │   └── dates.ts
│   └── navigation/         # Navigation setup
│       └── AppNavigator.tsx
├── App.tsx                 # Main app entry point
└── package.json
```

## Data Models

### ShotSpot
- Tracks shooting locations (e.g., "Right Corner 3", "Top 3")
- Supports three-point, midrange, and other shot types
- Can be toggled active/inactive

### ShootingSet
- Records makes and attempts for a specific spot on a date/time
- Used for calculating shooting percentages and XP

### ChecklistDrill
- Non-shooting drills (floaters, finishing, ball-handling)
- Categories: finishing, floaters, ball_handling, other
- Optional default duration

### PracticeSession
- Groups shooting sets and drill completions for a time slot
- Links to schedule (morning/afternoon, school/holiday)

### GamificationState
- Total XP, current level, rank name
- Current and best streak days

## XP System

- **Shooting**: 1 XP per make, 0.1 XP per attempt
- **Drills**: 20 XP per completed drill
- **Daily Bonus**: 50 XP for completing at least one session
- **Levels**: 100 XP × level number required per level
- **Ranks**:
  - Level 1-9: Rookie
  - Level 10-19: JV Starter
  - Level 20-29: Varsity
  - Level 30-39: All-Star
  - Level 40-49: Pro
  - Level 50+: Legend

## Practice Schedule

### School Days
- Morning: 6:00 AM - 7:40 AM
- Afternoon: 4:00 PM - 6:30 PM

### Holidays
- Morning: 7:00 AM - 10:00 AM
- Afternoon: 2:00 PM - 5:00 PM

## Streak System

- Practice days count toward streak
- Rest days (explicitly marked) don't break streak
- Days with no activity and no rest break the streak
- Best streak is tracked separately

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (or Expo Go app on your phone)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npm start
```

3. Scan the QR code with Expo Go app (iOS) or Camera app (Android)

### Development

The app uses TypeScript for type safety. All data is stored locally using AsyncStorage, so no backend is required.

## Default Data

The app initializes with:
- 5 default 3-point shot spots
- 7 default drills across different categories
- Default user profile (can be customized)
- School day schedule by default

## Future Enhancements

- Custom shot spot creation/editing UI
- Drill creation/editing UI
- Schedule customization
- Data export/import
- Dark mode support
- Advanced statistics and charts
- Workout templates

## License

This project is created for personal use and learning purposes.
