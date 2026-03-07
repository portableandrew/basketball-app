# Cosmetics System Implementation

## Overview
The cosmetics system has been fully implemented with visual avatar representation and global theme support. Cosmetics now visually change the player avatar and the entire app UI theme.

## Files Created

### 1. `/src/context/ThemeContext.tsx`
- **Purpose**: Global theme management based on equipped theme cosmetic
- **Exports**: 
  - `ThemeProvider`: Wraps the app and provides theme context
  - `useTheme()`: Hook to access current theme
  - `AppTheme`: Interface defining theme structure
- **Features**:
  - Automatically updates when theme cosmetic is equipped
  - Provides theme colors for: primary, secondary, background, text, tab bar, XP bar, rank badge
  - Listens to cosmetics state changes

### 2. `/src/components/PlayerAvatar.tsx`
- **Purpose**: Visual representation of player with equipped cosmetics
- **Props**:
  - `size?: number` - Avatar size (default: 64)
  - `showBall?: boolean` - Show ball preview (default: false)
  - `borderColor?: string` - Border color for avatar circle
  - `style?: ViewStyle` - Additional styles
- **Features**:
  - Displays jersey color as body
  - Shows headband/hat on head
  - Shows arm/shooting sleeves
  - Shows shoe color at bottom
  - Optional ball preview next to avatar
  - Reads equipped cosmetics from `useCosmetics` hook

## Files Modified

### 1. `/App.tsx`
- Wrapped app with `ThemeProvider` to enable global theming

### 2. `/src/navigation/AppNavigator.tsx`
- Integrated `useTheme()` hook
- Applied theme colors to:
  - Tab bar active/inactive colors
  - Tab bar border
  - Header styles
  - Navigation container theme

### 3. `/src/components/PlayerCard.tsx`
- Replaced simple icon with `<PlayerAvatar />` component
- Uses `useTheme()` for XP bar and accent colors
- Removed direct `useCosmetics` calls, uses theme context instead

### 4. `/src/screens/ProfileScreen.tsx`
- Replaced avatar placeholder with `<PlayerAvatar />` component
- Uses `useTheme()` for all theme-dependent colors
- Shows avatar with ball preview

### 5. `/src/screens/ShopScreen.tsx`
- Added avatar preview section at top
- Shows `<PlayerAvatar />` preview for jersey/accessory/shoe/ball cosmetics
- Uses `useTheme()` for button colors and accents
- Avatar updates live when equipping items

### 6. `/src/screens/HomeScreen.tsx`
- Uses `useTheme()` for all accent colors
- Theme colors applied to:
  - Currency badge
  - Schedule badges
  - Primary/secondary buttons
  - Status indicators

### 7. `/src/models/cosmetics.ts`
- Added `"hat"` to `CosmeticType`
- Added `hat: string | null` to `EquippedCosmetics` interface

### 8. `/src/hooks/useCosmetics.ts`
- Updated to support `"hat"` type
- `getEquippedCosmetic()` now accepts `"hat"` type
- `equipCosmetic()` handles hat equipping
- Auto-equip logic includes hat

### 9. `/src/storage/storage.ts`
- Updated default cosmetics state to include `hat: null`
- Migration logic ensures hat field exists

## Cosmetic Types

### Current Types:
1. **`jersey`** - Changes avatar body/jersey color
2. **`accessory`** - Headbands, arm sleeves, shooting sleeves
3. **`shoe`** - Changes shoe color at bottom of avatar
4. **`ball`** - Ball skin color (shown in preview)
5. **`theme`** - Changes entire app UI theme (primary/secondary colors)
6. **`hat`** - Headwear (shown above headband)

## How to Add New Cosmetics

### Step 1: Add to Catalog
In `/src/models/cosmetics.ts`, add to `COSMETICS_CATALOG`:

```typescript
{
  id: "jersey_custom_name",
  name: "Custom Jersey",
  type: "jersey",
  rarity: "rare",
  cost: 200,
  color: "#HEXCOLOR",
  secondaryColor: "#HEXCOLOR", // Optional
  description: "Description here",
}
```

### Step 2: Update Avatar (if needed)
If adding a new cosmetic type that affects avatar:
- Update `PlayerAvatar.tsx` to read and display the cosmetic
- Add visual layer in the component

### Step 3: Update Storage (if new type)
If adding a completely new cosmetic type:
- Add type to `CosmeticType` union
- Add field to `EquippedCosmetics` interface
- Update `useCosmetics.ts` to handle the type
- Update `storage.ts` default state

## Theme System

### How Themes Work:
1. User equips a theme cosmetic
2. `ThemeContext` detects change via `cosmeticsState`
3. Theme colors are calculated from theme cosmetic's `color` and `secondaryColor`
4. All components using `useTheme()` automatically re-render with new colors

### Theme Colors Available:
- `theme.primary` - Main accent color
- `theme.secondary` - Secondary accent (if theme has it)
- `theme.background` - App background
- `theme.cardBackground` - Card backgrounds
- `theme.text` - Primary text
- `theme.textSecondary` - Secondary text
- `theme.tabBarActive` - Active tab color
- `theme.tabBarInactive` - Inactive tab color
- `theme.xpBar` - XP progress bar color
- `theme.rankBadge` - Rank badge accent

## Avatar Layers (Z-Index Order)
1. **Hat** (z-index: 15) - Topmost
2. **Headband** (z-index: 10) - Below hat
3. **Face** - Base layer
4. **Body/Jersey** - Main body
5. **Arm Sleeves** (z-index: 5) - Over body
6. **Shoes** (z-index: 1) - Bottom
7. **Ball Preview** (z-index: 20) - Separate, next to avatar

## Testing Checklist

✅ Equipping a theme changes entire UI colors
✅ Equipping a jersey changes avatar body color
✅ Equipping an accessory (headband) shows on avatar
✅ Equipping shoes changes avatar shoe color
✅ Equipping a ball shows in preview
✅ Currency logic still works
✅ No screens break due to theme updates
✅ Avatar appears in Home, Profile, and Shop screens
✅ Shop shows live avatar preview

## Future Enhancements

To add more cosmetic types:
1. Add type to `CosmeticType`
2. Add to `EquippedCosmetics`
3. Update `PlayerAvatar` to render the cosmetic
4. Update `useCosmetics` to handle equipping
5. Add cosmetics to catalog

Example: Adding "glasses" type:
```typescript
// 1. Add to CosmeticType
export type CosmeticType = ... | "glasses";

// 2. Add to EquippedCosmetics
glasses: string | null;

// 3. Update PlayerAvatar to show glasses layer
// 4. Update useCosmetics switch statement
// 5. Add glasses items to catalog
```
