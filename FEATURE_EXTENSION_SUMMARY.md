# Feature Extension Summary

## Overview
Extended the Bucket Tracker app with two major features:
1. **Log workouts for previous days** - Date picker and edit functionality
2. **View Profile screen** - Player progression, attributes, and badges

---

## Files Created

### 1. Profile Utilities
- **`src/utils/profileAttributes.ts`**
  - Calculates 0-99 attribute ratings from stats
  - Attributes: Shooting (3PT), Midrange/Finishing, Handles, Conditioning
  - Formulas consider volume, accuracy, consistency, and recent activity

- **`src/utils/profileBadges.ts`**
  - Badge unlock logic and definitions
  - 10 badges: Corner Specialist, Volume Shooter, Gym Rat, Iron Man, Grind Don't Stop, Comeback, Sharp Shooter, Workout Warrior, Early Bird, Night Owl
  - Each badge has unlock conditions based on stats/streaks

### 2. Profile Screen
- **`src/screens/ProfileScreen.tsx`**
  - Player overview (avatar, name, rank, level, XP, streaks)
  - Progression stats (total makes/attempts, FG%, best/worst spots)
  - Attributes display (4 attributes with 0-99 ratings and progress bars)
  - Badges grid (unlocked vs locked badges)

---

## Files Modified

### 1. Log Workout Screen
- **`src/screens/LogWorkoutScreen.tsx`**
  - Added date picker (using `@react-native-community/datetimepicker`)
  - Loads existing data for selected date
  - Allows editing past dates
  - Recalculates XP and streaks when editing past dates
  - Shows day type label (School Day / School Holiday / Family Holiday)

### 2. Navigation
- **`src/navigation/AppNavigator.tsx`**
  - Added Profile tab to bottom navigation
  - Profile icon: `person` / `person-outline`

- **`src/navigation/types.ts`**
  - Added `Profile: undefined` to `RootStackParamList`

### 3. Package Dependencies
- **`package.json`**
  - Added `@react-native-community/datetimepicker` package

---

## How to Tweak

### Attribute Formulas
**File:** `src/utils/profileAttributes.ts`

Each attribute has its own calculation function:
- `calculateShooting3PT()` - Based on 3PT FG% and volume
- `calculateMidrangeFinishing()` - Based on finishing drills and shooting volume
- `calculateHandles()` - Based on ball-handling drill completions
- `calculateConditioning()` - Based on streak, recent activity, and total sessions

**To modify:** Edit the formulas in each function. The functions return 0-99 values.

**Example:** To make shooting more volume-focused:
```typescript
// Increase volume bonus weight
const volumeBonus = Math.min(totalAttempts / 500, 1) * 50; // Was 40
```

### Badge Unlock Conditions
**File:** `src/utils/profileBadges.ts`

Each badge has a check function:
- `checkCornerSpecialist()` - 40%+ FG from corners with 100+ attempts
- `checkVolumeShooter()` - 500+ total 3-point attempts
- `checkGymRat()` - 14+ day streak
- `checkIronMan()` - 30+ day streak
- `checkGrindDontStop()` - 5+ days in a single week
- `checkComeback()` - Raise FG% by 10%+ over last 14 days
- `checkSharpShooter()` - 45%+ FG over 100+ attempts
- `checkEarlyBird()` / `checkNightOwl()` - 20+ sessions at specific times

**To modify:** Edit the threshold values in each check function.

**Example:** To make Gym Rat easier:
```typescript
case "gym_rat":
  return gamification.currentStreakDays >= 7; // Was 14
```

**To add a new badge:**
1. Add badge definition to `getBadgeDefinitions()`
2. Add case to `checkBadgeUnlock()` switch statement
3. Create a new check function (e.g., `checkNewBadge()`)

### Log Screen Date Handling
**File:** `src/screens/LogWorkoutScreen.tsx`

**Date Selection:**
- Uses `DateTimePicker` component
- Maximum date is today (can't log future dates)
- When date changes, `loadData()` is called automatically

**Loading Existing Data:**
- `loadData()` function loads:
  - Existing shooting sets for selected date (`getShootingSetsByDate()`)
  - Existing drill completions (`getDrillCompletionsByDate()`)
  - Existing practice day sessions
- Pre-fills form with existing data

**Saving/Editing:**
- When saving, deletes all existing sets/completions for that date
- Creates new sets/completions with updated data
- Recalculates total XP from ALL sets (not just incremental)
- Recalculates streaks from ALL practice days

**To modify date range:** Change `maximumDate` prop in `DateTimePicker`:
```typescript
maximumDate={new Date()} // Currently only allows past dates
```

**To allow future dates:**
```typescript
maximumDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} // 7 days ahead
```

---

## Key Features

### 1. Past Date Logging
- ✅ Date picker in Step 1
- ✅ Loads existing data for selected date
- ✅ Can edit/update past workouts
- ✅ Shows day type (School Day / Holiday)
- ✅ Recalculates XP and streaks correctly

### 2. Profile Screen
- ✅ Player overview (avatar, name, rank, level, XP, streaks)
- ✅ Progression stats (makes, attempts, FG%, best/worst spots)
- ✅ 4 attributes with 0-99 ratings
- ✅ 10 badges (unlocked vs locked)
- ✅ Auto-refreshes when screen comes into focus

### 3. XP & Streak Recalculation
- ✅ When editing past dates, total XP is recalculated from all data
- ✅ Streaks are recalculated from all practice days
- ✅ Ensures consistency when editing historical data

---

## Testing Checklist

- [ ] Date picker opens and allows selecting past dates
- [ ] Existing data loads correctly for selected date
- [ ] Can edit and save changes to past dates
- [ ] XP updates correctly when editing past dates
- [ ] Streaks recalculate correctly
- [ ] Profile screen displays all data correctly
- [ ] Attributes show correct ratings
- [ ] Badges unlock when conditions are met
- [ ] Navigation includes Profile tab

---

## Notes

- The date picker uses `@react-native-community/datetimepicker` which requires native code linking (handled by Expo)
- XP recalculation happens on every save to ensure accuracy when editing past dates
- Badge checks run on every Profile screen load (could be optimized with caching if needed)
- Attribute calculations are simple formulas - can be made more sophisticated if needed
