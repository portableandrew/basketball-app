// Component for displaying XP, level, rank, and streak

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GamificationState } from "../models/types";
import { getXpProgress } from "../utils/xp";
import { clamp } from "../utils/number";

interface ProgressCardProps {
  gamification: GamificationState;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ gamification }) => {
  const progress = getXpProgress(gamification.totalXp, gamification.level);
  // Clamp percentage to 0-100 to prevent "data value out of bounds" error
  const safePercentage = clamp(isFinite(progress.percentage) ? progress.percentage : 0, 0, 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.rank}>{gamification.rank}</Text>
          <Text style={styles.level}>Level {gamification.level}</Text>
        </View>
        <View style={styles.trophyIcon}>
          <Ionicons name="trophy" size={32} color="#FFD700" />
        </View>
      </View>
      <View style={styles.xpSection}>
        <View style={styles.xpBar}>
          <View
            style={[
              styles.xpBarFill,
              { width: `${safePercentage}%` },
            ]}
          />
        </View>
        <View style={styles.xpTextContainer}>
          <Ionicons name="flash" size={16} color="#FF6B35" />
          <Text style={styles.xpText}>
            {isFinite(progress.current) ? Math.max(0, progress.current) : 0} / {isFinite(progress.needed) ? progress.needed : 0} XP
          </Text>
        </View>
      </View>
      <View style={styles.streakSection}>
        <View style={styles.streakItem}>
          <Ionicons name="flame" size={20} color="#FF6B35" />
          <Text style={styles.streakLabel}>Current</Text>
          <Text style={styles.streakValue}>
            {gamification.currentStreakDays}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.streakItem}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.streakLabel}>Best</Text>
          <Text style={styles.streakValue}>
            {gamification.bestStreakDays}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 24,
    margin: 16,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  trophyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFD70015",
    justifyContent: "center",
    alignItems: "center",
  },
  rank: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  level: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
  },
  xpSection: {
    marginBottom: 20,
  },
  xpBar: {
    height: 12,
    backgroundColor: "#2A2A2A",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 12,
  },
  xpBarFill: {
    height: "100%",
    backgroundColor: "#FF6B35",
    borderRadius: 6,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  xpTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  xpText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  streakSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  streakItem: {
    alignItems: "center",
    gap: 6,
  },
  divider: {
    width: 1,
    backgroundColor: "#2A2A2A",
    marginHorizontal: 8,
  },
  streakLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
});
