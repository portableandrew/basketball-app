// Hook to track and trigger rank/level up animations

import { useState, useEffect, useCallback } from "react";
import { getGamificationState } from "../storage/storage";
import { getRankForLevel } from "../models/ranks";
import { getLevelFromXP } from "../utils/xp";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  LAST_SHOWN_LEVEL: "@bucket_tracker:last_shown_level",
  LAST_SHOWN_RANK_ID: "@bucket_tracker:last_shown_rank_id",
};

interface RankUpState {
  showRankUp: boolean;
  showLevelUp: boolean;
  rank?: ReturnType<typeof getRankForLevel>;
  level?: number;
}

export function useRankUp() {
  const [rankUpState, setRankUpState] = useState<RankUpState>({
    showRankUp: false,
    showLevelUp: false,
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkRankAndLevel = useCallback(async () => {
    if (isChecking) return;
    setIsChecking(true);

    try {
      const gamState = await getGamificationState();
      if (!gamState) {
        setIsChecking(false);
        return;
      }

      // Get current level and rank
      const currentLevel = getLevelFromXP(gamState.totalXp);
      const currentRank = getRankForLevel(currentLevel);

      // Load last shown values
      const lastShownLevelStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SHOWN_LEVEL);
      const lastShownRankId = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SHOWN_RANK_ID);

      // Initialize last shown level to current level if not set (first time)
      const lastShownLevel = lastShownLevelStr ? parseInt(lastShownLevelStr, 10) : (gamState.level || 1);
      const lastShownRank = lastShownRankId || "";

      // Check for rank up (priority - show first)
      // Rank changes when the rank ID changes AND level increased
      const rankChanged = currentRank.id !== lastShownRank && currentLevel > lastShownLevel;
      
      // Check for level up (only if no rank change)
      const levelChanged = currentLevel > lastShownLevel && !rankChanged;

      if (rankChanged) {
        // Rank up - save and show
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_SHOWN_RANK_ID, currentRank.id);
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_SHOWN_LEVEL, currentLevel.toString());
        
        setRankUpState({
          showRankUp: true,
          showLevelUp: false,
          rank: currentRank,
          level: currentLevel,
        });
      } else if (levelChanged) {
        // Level up only - save and show
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_SHOWN_LEVEL, currentLevel.toString());
        
        setRankUpState({
          showRankUp: false,
          showLevelUp: true,
          rank: undefined,
          level: currentLevel,
        });
      }
    } catch (error) {
      console.error("Error checking rank/level up:", error);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  const handleRankUpClose = useCallback(async () => {
    setRankUpState((prev) => ({ ...prev, showRankUp: false }));
    
    // After rank up closes, check for level up
    setTimeout(() => {
      checkRankAndLevel();
    }, 300);
  }, [checkRankAndLevel]);

  const handleLevelUpClose = useCallback(() => {
    setRankUpState((prev) => ({ ...prev, showLevelUp: false }));
  }, []);

  return {
    rankUpState,
    checkRankAndLevel,
    handleRankUpClose,
    handleLevelUpClose,
  };
}
