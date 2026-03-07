// Cosmetics hook - TEMPORARILY DISABLED for stability
// Returns static defaults without any AsyncStorage access

import { useCallback } from "react";
import { CosmeticsState, EquippedCosmetics } from "../models/cosmetics";

// Static safe defaults - no storage access
const DISABLED_COSMETICS_STATE: CosmeticsState = {
  ownedCosmetics: [],
  equippedCosmetics: {
    theme: null,
    jersey: null,
    hat: null,
    accessory: null,
    shoe: null,
    ball: null,
  },
};

export function useCosmetics() {
  // Return static defaults - NO storage access, NO loading, NO state updates
  const cosmeticsState = DISABLED_COSMETICS_STATE;
  const currency = 0; // Currency from gamification state, not cosmetics
  const loading = false;

  const isOwned = useCallback((cosmeticId: string): boolean => {
    return false; // Cosmetics disabled
  }, []);

  const isEquipped = useCallback((cosmeticId: string): boolean => {
    return false; // Cosmetics disabled
  }, []);

  const equipCosmetic = useCallback(async (cosmeticId: string): Promise<boolean> => {
    return false; // Cosmetics disabled
  }, []);

  const buyCosmetic = useCallback(async (cosmeticId: string): Promise<boolean> => {
    return false; // Cosmetics disabled
  }, []);

  const getEquippedCosmetic = useCallback((type: string) => {
    return null; // Cosmetics disabled
  }, []);

  const getThemeColors = useCallback(() => {
    return { primary: "#39FF14" }; // Default neon green
  }, []);

  const resetCosmetics = useCallback(async () => {
    return false; // Cosmetics disabled
  }, []);

  const loadCosmetics = useCallback(async () => {
    // No-op - cosmetics disabled
  }, []);

  return {
    cosmeticsState,
    currency,
    loading,
    isOwned,
    isEquipped,
    equipCosmetic,
    buyCosmetic,
    getEquippedCosmetic,
    getThemeColors,
    refresh: loadCosmetics,
    resetCosmetics,
  };
}
