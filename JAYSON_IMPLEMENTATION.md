# Jayson AI Coach Implementation

## Overview
Jayson is an AI assistant coach that analyzes your shooting stats and provides personalized feedback on why you're missing and how to fix it.

## Files Created

### 1. `src/utils/shootingDiagnostics.ts`
**Purpose**: Analyzes shooting data and provides diagnostic information
**Key Functions**:
- `getShootingDiagnostics()` - Returns comprehensive shooting analysis including:
  - Overall FG%
  - Best/worst spots
  - Low/high percentage spots
  - Side imbalance (left vs right)
  - Recent volume (last 7 days)
  - Time-of-day stats

### 2. `src/coach/jayson.ts`
**Purpose**: Core logic for Jayson's diagnosis and responses
**Key Functions**:
- `analyzeShooting()` - Rule-based analysis that detects:
  - One-sided weakness (left vs right)
  - Corner 3 issues
  - Fatigue/late session drop-off
  - Overall low percentage
  - Specific spot problems
  - Recent volume issues
- `formatJaysonResponse()` - Formats responses in Jayson's friendly voice

**Basketball Rules Encoded**:
1. **One-sided weakness**: Detects left/right imbalance, suggests alignment and guide hand fixes
2. **Corner 3s**: Identifies corner-specific issues, suggests base and catch-and-shoot work
3. **Fatigue**: Compares morning vs afternoon stats, suggests conditioning
4. **Overall low %**: Suggests fundamental form work
5. **Specific spots**: Provides targeted advice for mentioned spots
6. **Volume issues**: Encourages consistency

### 3. `src/hooks/useJaysonCoach.ts`
**Purpose**: React hook for managing Jayson chat functionality
**Returns**:
- `messages` - Array of chat messages
- `isLoading` - Loading state
- `askJayson()` - Function to send questions
- `getDiagnostics()` - Function to get current diagnostics

### 4. `src/screens/JaysonScreen.tsx`
**Purpose**: Main UI for Jayson interface
**Features**:
- Header with Jayson avatar and description
- Stats summary card (last 7 days)
- Chat message area
- Preset question buttons
- Text input with send button

## Integration

### Navigation
- Added "Jayson" tab to bottom navigation
- Icon: `chatbubbles-outline` / `chatbubbles`
- Tab label: "Jayson"
- Header title: "Jayson - AI Coach"

### Data Access
- Uses existing `getShootingSets()` and `getShotSpots()` from storage
- Analyzes all shooting data to provide insights
- No new data storage required - works with existing data

## Jayson's Personality

- **Voice**: Friendly older teammate/trainer
- **Tone**: Supportive, encouraging, never harsh
- **Style**: Direct ("you", "your shot")
- **Structure**: 
  1. Quick read (1-2 sentences)
  2. Why you might be missing (bullet points)
  3. What to work on (2-4 specific drills)

## Customization

To modify Jayson's responses or add new rules:

1. **Add new rules**: Edit `src/coach/jayson.ts` → `analyzeShooting()` function
2. **Change voice/tone**: Edit `src/coach/jayson.ts` → `formatJaysonResponse()` function
3. **Add new diagnostics**: Edit `src/utils/shootingDiagnostics.ts` → `getShootingDiagnostics()` function
4. **Modify UI**: Edit `src/screens/JaysonScreen.tsx`

## Future Enhancements

- **AI Integration**: Can be extended to use OpenAI/other APIs by wrapping the rule-based diagnosis in a prompt
- **More rules**: Add rules for specific shot types, game situations, etc.
- **Workout suggestions**: Link directly to workouts from the Workouts screen
- **Progress tracking**: Track improvements over time
- **Voice input**: Add voice-to-text for questions

## Example Questions

- "Why am I missing so much?"
- "Help my corner 3"
- "Why do I miss late in workouts?"
- "What's my weakest spot?"
- "Why am I missing from the left wing?"
- "How can I fix my corner 3s?"
