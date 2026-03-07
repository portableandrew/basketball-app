# Quick Start Guide

## Installation

1. **Install dependencies:**
   ```bash
   cd bucket-tracker
   npm install
   ```

   Note: If you encounter npm cache issues, you may need to clear the cache:
   ```bash
   npm cache clean --force
   ```

2. **Start the Expo development server:**
   ```bash
   npm start
   ```

3. **Run on your device:**
   - **iOS**: Install Expo Go from the App Store, then scan the QR code
   - **Android**: Install Expo Go from Google Play, then scan the QR code
   - **Web**: Press `w` in the terminal to open in browser

## First Use

1. **Home Screen**: View your current level, rank, streak, and today's schedule
2. **Log Workout**: Tap "Log Workout" to start logging practice
   - Select date (defaults to today)
   - Choose time slot (morning/afternoon based on schedule)
   - Enter makes/attempts for shooting spots
   - Check off completed drills
   - Save to earn XP!
3. **Stats**: View shooting percentages and XP history
4. **Calendar**: See your practice history with visual indicators
5. **Drills**: Get workout suggestions or manage your drills

## Default Data

The app comes pre-loaded with:
- **5 Shot Spots**: Right Corner 3, Right Wing 3, Top 3, Left Wing 3, Left Corner 3
- **7 Drills**: Various drills across finishing, floaters, and ball-handling categories
- **School Schedule**: Default schedule is set to school days

## Key Features

- **XP System**: Earn XP for makes, attempts, drills, and daily sessions
- **Streaks**: Track consecutive practice days (rest days don't break streaks)
- **Ranks**: Level up through Rookie → JV Starter → Varsity → All-Star → Pro → Legend
- **Schedule**: Automatically adjusts between school day and holiday schedules
- **Workout Suggestions**: Get drill suggestions based on category and time available

## Troubleshooting

- **npm install fails**: Try `npm install --force` or clear npm cache
- **App won't start**: Make sure you're in the bucket-tracker directory
- **Data not saving**: Check that AsyncStorage permissions are granted (should work automatically in Expo Go)

## Next Steps

- Customize shot spots in the settings (coming soon)
- Add custom drills
- Switch between school/holiday schedule in profile
- Mark rest days to maintain streaks
