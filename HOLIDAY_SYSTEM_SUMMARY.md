# Holiday System Update Summary

## Overview
The app now distinguishes between **School Holidays** and **Family Holidays** with different schedules and behaviors.

## School Holidays (Fixed Schedule)

### Date Ranges (Recurring Yearly)
- **December 6 – January 31**
- **April 4 – April 23**
- **June 27 – July 22**
- **September 19 – October 6**

### Schedule
- **Morning**: 7:00am – 10:00am
- **Afternoon**: 2:00pm – 5:00pm

### Behavior
- Automatically detected based on date
- Uses fixed workout schedule
- Displayed as "School holiday – 7–10am & 2–5pm sessions"
- Neutral for streak (doesn't break streak)

## Family Holidays (User-Configurable)

### Features
- User can mark any date as a Family Holiday
- Separate from school holidays
- Configurable schedule options:
  1. **No scheduled workouts** (default)
     - Display: "Family holiday – no scheduled sessions (optional light work)"
     - Still allows optional workouts to be logged
  2. **Custom time windows** (future feature)
     - User can set custom workout times
     - Display: "Family holiday – [custom times] sessions"

### Behavior
- User-marked dates (toggle on/off in calendar)
- Neutral for streak (doesn't break streak)
- Visual distinction in calendar (blue dot vs green for school holidays)

## Visual Indicators

### Calendar Colors
- **Green dot**: School Holiday
- **Blue dot**: Family Holiday
- **Orange dot**: Rest Day
- **Blue dot**: Morning session completed
- **Purple dot**: Afternoon session completed
- **Red dot**: Missed day (no practice, not a holiday/rest)

### Home Screen
- Shows day type badge (School Day / School Holiday / Family Holiday / Rest Day)
- Displays appropriate schedule label
- Shows correct time slots based on day type

## Streak Logic

### Neutral Days (Don't Break Streak)
- Rest days
- School holidays
- Family holidays

### Streak Breaking
A day breaks the streak only if:
- It's NOT a holiday
- It's NOT a rest day
- It has NO training logged

## Files Modified

### New Files
- `src/utils/holidays.ts` - Holiday detection and schedule utilities

### Updated Files
- `src/models/types.ts` - Added holiday flags to PracticeDay and UserProfile
- `src/models/constants.ts` - Added school holiday ranges and schedules
- `src/storage/storage.ts` - Added markFamilyHoliday function, updated savePracticeDay
- `src/utils/streaks.ts` - Updated to handle both holiday types as neutral
- `src/screens/HomeScreen.tsx` - Shows correct schedule based on day type
- `src/screens/CalendarScreen.tsx` - Visual distinction, toggle family holidays
- `src/screens/LogWorkoutScreen.tsx` - Uses correct schedule based on day type
- `src/components/CalendarDay.tsx` - Shows holiday indicators

## Usage

### Marking Family Holidays
1. Open Calendar screen
2. Tap on any date
3. Tap "Mark as Family Holiday" button
4. Date will show blue indicator

### Viewing Schedule
- Home screen automatically shows correct schedule based on today's date type
- Calendar shows visual indicators for all holiday types

## Future Enhancements
- Settings screen to configure family holiday custom schedule
- Ability to set custom time windows for family holidays
- Bulk marking of family holiday dates
