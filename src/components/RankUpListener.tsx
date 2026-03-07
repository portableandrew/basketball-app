// Global Rank Up Listener Component - Wraps app to detect rank/level ups

import React, { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { RankUpModal } from "./RankUpModal";
import { useRankUp } from "../hooks/useRankUp";
import { RankUpProvider } from "../context/RankUpContext";

function RankUpListenerInner({ children }: { children: React.ReactNode }) {
  const { rankUpState, checkRankAndLevel, handleRankUpClose, handleLevelUpClose } =
    useRankUp();

  // Check on mount
  useEffect(() => {
    checkRankAndLevel();
  }, []);

  // Check when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        checkRankAndLevel();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkRankAndLevel]);

  return (
    <>
      {children}
      {/* Rank Up Modal */}
      <RankUpModal
        visible={rankUpState.showRankUp}
        type="rank"
        rank={rankUpState.rank}
        level={rankUpState.level}
        onClose={handleRankUpClose}
      />
      {/* Level Up Modal */}
      <RankUpModal
        visible={rankUpState.showLevelUp}
        type="level"
        level={rankUpState.level}
        onClose={handleLevelUpClose}
      />
    </>
  );
}

export const RankUpListener: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <RankUpProvider>
      <RankUpListenerInner>{children}</RankUpListenerInner>
    </RankUpProvider>
  );
};
