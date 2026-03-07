# Cosmetics, Currency & Enhanced Ranks Summary

## Overview
Extended the Bucket Tracker app with:
1. **Cosmetics System** - Visual-only customization (jerseys, accessories, shoes, balls, themes)
2. **In-Game Currency** - VC (Virtual Currency) system with shop
3. **Enhanced Ranks** - Ranks with icons, colors, and visual themes

---

## Files Created

### 1. Cosmetics System
- **`src/models/cosmetics.ts`**
  - Cosmetic types, interfaces, and catalog
  - 30+ cosmetics across 5 categories
  - Rarity system (Common, Rare, Epic, Legendary)
  - Helper functions for getting cosmetics by type/ID

### 2. Enhanced Ranks
- **`src/models/ranks.ts`**
  - Rank definitions with icons, colors, and glow effects
  - 8 rank tiers (Rookie → Hall of Fame)
  - Functions to get rank for level and next rank info

### 3. Currency System
- **`src/utils/currency.ts`**
  - Currency reward constants
  - Functions to award currency for workouts, level ups, badges
  - Level up detection and rewards

### 4. Cosmetics Hook
- **`src/hooks/useCosmetics.ts`**
  - Manages owned/equipped cosmetics
  - Currency balance
  - Buy/equip functionality
  - Theme color getter

### 5. Shop Screen
- **`src/screens/ShopScreen.tsx`**
  - Browse cosmetics by category
  - Buy with VC
  - Equip owned cosmetics
  - Rarity indicators and previews

---

## Files Modified

### 1. Data Models
- **`src/models/types.ts`**
  - Added `currency: number` to `GamificationState`

### 2. Storage
- **`src/storage/storage.ts`**
  - Added `COSMETICS` storage key
  - Added `getCosmeticsState()` and `setCosmeticsState()`
  - Updated `getGamificationState()` to initialize/migrate currency (default: 100 VC)
  - Default cosmetics state with starter items

### 3. XP Utilities
- **`src/utils/xp.ts`**
  - Updated `getRankForLevel()` to use new rank system

### 4. Screens
- **`src/screens/ProfileScreen.tsx`**
  - Added currency display
  - Enhanced rank display with icon and colors
  - "Style & Identity" section showing equipped cosmetics
  - Shop button

- **`src/screens/HomeScreen.tsx`**
  - Added currency badge in header
  - Uses theme colors

- **`src/screens/LogWorkoutScreen.tsx`**
  - Awards currency on workout completion (+10 VC)
  - Awards currency on level up (+50 VC per level)

- **`src/screens/WorkoutsScreen.tsx`**
  - Awards currency on workout completion (+10 VC)
  - Awards currency on level up (+50 VC per level)

### 5. Components
- **`src/components/PlayerCard.tsx`**
  - Uses rank colors for badges and borders
  - Uses theme colors for XP bar
  - Shows equipped jersey color on avatar

### 6. Navigation
- **`src/navigation/AppNavigator.tsx`**
  - Added Shop tab
  - Shop icon: `storefront` / `storefront-outline`

- **`src/navigation/types.ts`**
  - Added `Shop: undefined` to `RootStackParamList`

---

## How to Tweak

### Currency Rewards
**File:** `src/utils/currency.ts`

Edit `CURRENCY_REWARDS` object:
```typescript
export const CURRENCY_REWARDS = {
  WORKOUT_COMPLETION: 10,  // Change this value
  LEVEL_UP: 50,            // Change this value
  BADGE_UNLOCK: 100,       // Change this value
  DAILY_STREAK_BONUS: 5,   // Change this value
} as const;
```

**To add currency rewards for other activities:**
1. Add new constant to `CURRENCY_REWARDS`
2. Create function like `awardXCurrency()`
3. Call it where the activity happens

### Rank Thresholds & Visuals
**File:** `src/models/ranks.ts`

Edit `RANK_DEFINITIONS` array:
```typescript
{
  name: "Rookie",
  minLevel: 1,        // Change threshold
  maxLevel: 4,       // Change threshold
  iconName: "walk-outline",  // Change icon (Ionicons name)
  primaryColor: "#8E8E93",    // Change color
  secondaryColor: "#B0B0B0", // Change color
  glowColor: "#8E8E9320",     // Change glow effect
}
```

**To add a new rank tier:**
1. Add new entry to `RANK_DEFINITIONS`
2. Ensure level ranges don't overlap
3. Choose icon and colors

### Cosmetics Catalog
**File:** `src/models/cosmetics.ts`

Edit `COSMETICS_CATALOG` array:
```typescript
{
  id: "jersey_new",
  name: "New Jersey",
  type: "jersey",
  rarity: "rare",
  cost: 200,              // Change cost
  color: "#FF0000",       // Primary color
  secondaryColor: "#0000FF", // Optional secondary
  description: "Description",
}
```

**To add a cosmetic:**
1. Add to `COSMETICS_CATALOG`
2. Set `id`, `name`, `type`, `rarity`, `cost`
3. Add `color` for preview
4. Optionally add `icon` (Ionicons name)

**Cosmetic Types:**
- `"jersey"` - Player jersey
- `"accessory"` - Headband, sleeves, etc.
- `"shoe"` - Footwear
- `"ball"` - Basketball skin
- `"theme"` - UI theme (affects accent colors)

**Rarity Levels:**
- `"common"` - Grey (#8E8E93)
- `"rare"` - Blue (#4A90E2)
- `"epic"` - Purple (#9C27B0)
- `"legendary"` - Gold (#FFD700)

### Theme Colors
**File:** `src/hooks/useCosmetics.ts`

The `getThemeColors()` function returns the equipped theme's colors. These are used throughout the app for:
- Accent colors (buttons, tabs, XP bars)
- Rank badge borders
- Currency badges

**To change how themes affect UI:**
- Modify `getThemeColors()` to return different color properties
- Update components to use theme colors (already done in PlayerCard, HomeScreen, ProfileScreen)

---

## Key Features

### 1. Cosmetics System
- ✅ 30+ cosmetics across 5 categories
- ✅ Rarity system with visual indicators
- ✅ Own/equip system
- ✅ Visual previews
- ✅ Starter cosmetics (free)

### 2. Currency System
- ✅ VC (Virtual Currency) - in-game currency
- ✅ Starting balance: 100 VC
- ✅ Earn from: workouts (+10), level ups (+50), badges (+100)
- ✅ Displayed on Home, Profile, Shop screens
- ✅ Prevents negative balance

### 3. Enhanced Ranks
- ✅ 8 rank tiers with unique icons and colors
- ✅ Visual rank badges with rank colors
- ✅ Rank colors used in PlayerCard
- ✅ Next rank info shown on Profile

### 4. Shop
- ✅ Browse by category (All, Jerseys, Accessories, Shoes, Balls, Themes)
- ✅ Buy with VC
- ✅ Equip owned items
- ✅ Rarity indicators
- ✅ Cost display

### 5. Profile Integration
- ✅ Shows equipped cosmetics
- ✅ "Style & Identity" section
- ✅ Customize button → Shop
- ✅ Enhanced rank display

---

## Currency Rewards Summary

| Activity | Reward | File |
|----------|--------|------|
| Workout Completion | +10 VC | `src/utils/currency.ts` |
| Level Up | +50 VC per level | `src/utils/currency.ts` |
| Badge Unlock | +100 VC | `src/utils/currency.ts` (not yet integrated) |
| Starting Balance | 100 VC | `src/storage/storage.ts` |

---

## Rank System

| Rank | Levels | Icon | Primary Color |
|------|--------|------|---------------|
| Rookie | 1-4 | walk-outline | Grey |
| Gym Rat | 5-9 | barbell-outline | Orange |
| Hooper | 10-14 | basketball-outline | Green |
| Shot Creator | 15-19 | flame-outline | Orange-Red |
| Team Captain | 20-24 | star-outline | Blue |
| Pro Level | 25-29 | trophy-outline | Gold |
| NBA Ready | 30-39 | diamond-outline | Purple |
| Hall of Fame | 40+ | sparkles | Gold/Purple |

---

## Testing Checklist

- [ ] Currency displays correctly on Home, Profile, Shop
- [ ] Can buy cosmetics in Shop
- [ ] Can equip owned cosmetics
- [ ] Rank colors appear correctly on PlayerCard
- [ ] Theme colors affect UI accents
- [ ] Currency rewards on workout completion
- [ ] Currency rewards on level up
- [ ] Starter cosmetics are owned by default
- [ ] Shop categories filter correctly
- [ ] Rarity colors display correctly

---

## Notes

- Currency is stored in `GamificationState` (persisted)
- Cosmetics state is separate (persisted)
- Theme colors are applied dynamically via `useCosmetics` hook
- Rank colors are computed from level using `getRankForLevel()`
- All cosmetics are visual-only (no gameplay impact)
- Badge currency rewards are defined but not yet integrated (can be added to badge unlock logic)
