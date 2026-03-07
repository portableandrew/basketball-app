// Context to share rank-up check function globally

import React, { createContext, useContext, useCallback } from "react";
import { useRankUp } from "../hooks/useRankUp";

interface RankUpContextType {
  checkRankAndLevel: () => Promise<void>;
}

const RankUpContext = createContext<RankUpContextType | null>(null);

export function RankUpProvider({ children }: { children: React.ReactNode }) {
  const { checkRankAndLevel } = useRankUp();

  return (
    <RankUpContext.Provider value={{ checkRankAndLevel }}>
      {children}
    </RankUpContext.Provider>
  );
}

export function useRankUpContext() {
  const context = useContext(RankUpContext);
  if (!context) {
    // Return a no-op if context not available (shouldn't happen)
    return { checkRankAndLevel: async () => {} };
  }
  return context;
}
