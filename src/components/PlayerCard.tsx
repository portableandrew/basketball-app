// Player Card Component - Shows player profile, rank, level, XP, and streaks

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GamificationState, UserProfile } from "../models/types";
import { getXpProgress, getXPForLevel } from "../utils/xp";
import { getRankForLevel, getNextRank } from "../models/ranks";
import { useTheme } from "../context/ThemeContext";
import { SimpleAvatar } from "./SimpleAvatar";

interface PlayerCardProps {
  profile: UserProfile;
  gamification: GamificationState;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  profile,
  gamification,
}) => {
  const progress = getXpProgress(gamification.totalXp, gamification.level);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rankDef = getRankForLevel(gamification.level);
  const nextRankInfo = getNextRank(gamification.level);
  const { theme } = useTheme();
  
  // Calculate XP needed for next level
  const xpForCurrentLevel = getXPForLevel(gamification.level);
  const xpForNextLevel = getXPForLevel(gamification.level + 1);
  const xpNeededForNextLevel = xpForNextLevel - gamification.totalXp;

  useEffect(() => {
    // Clamp percentage to 0-100 to prevent "data value out of bounds" error
    const safePercentage = Math.max(0, Math.min(100, isFinite(progress.percentage) ? progress.percentage : 0));
    Animated.timing(progressAnim, {
      toValue: safePercentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress.percentage]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const accentColor = theme.primary;
  const rankColor = rankDef.primaryColor;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SimpleAvatar
          size={64}
          borderColor={rankColor}
          showBall={false}
        />
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{profile.name}</Text>
          <View
            style={[
              styles.rankBadge,
              {
                backgroundColor: rankColor + "20",
                borderColor: rankColor,
              },
            ]}
          >
            <Ionicons name={rankDef.iconName as any} size={14} color={rankColor} />
            <Text style={[styles.rankText, { color: rankColor }]}>
              {rankDef.name}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.levelContainer,
            {
              backgroundColor: rankColor + "20",
              borderColor: rankColor,
            },
          ]}
        >
          <Text style={[styles.levelLabel, { color: rankColor }]}>LVL</Text>
          <Text style={styles.levelValue}>{gamification.level}</Text>
        </View>
      </View>

      <View style={styles.xpSection}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpLabel}>XP Progress</Text>
          <Text style={[styles.xpValue, { color: theme.xpBar }]}>
            {isFinite(progress.current) ? Math.max(0, progress.current).toFixed(0) : "0"} / {isFinite(progress.needed) ? progress.needed : 0} XP
          </Text>
        </View>
        <View style={styles.xpBarContainer}>
          <Animated.View
            style={[
              styles.xpBarFill,
              {
                width: progressWidth,
                backgroundColor: rankDef.primaryColor,
                shadowColor: rankDef.glowColor,
              },
            ]}
          />
        </View>
        {nextRankInfo && (
          <Text style={styles.nextRankText}>
            Next rank: <Text style={{ color: nextRankInfo.rank.primaryColor, fontWeight: "700" }}>{nextRankInfo.rank.name}</Text> in {nextRankInfo.levelsNeeded} level{nextRankInfo.levelsNeeded !== 1 ? "s" : ""}
          </Text>
        )}
        <Text style={styles.nextLevelText}>
          Next level in {xpNeededForNextLevel > 0 ? xpNeededForNextLevel : 0} XP
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="flash" size={20} color={theme.primary} />
          <Text style={styles.statValue}>
            {gamification.totalXp.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="flame" size={20} color="#FF6B35" />
          <Text style={styles.statValue}>
            {gamification.currentStreakDays}
          </Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.statValue}>
            {gamification.bestStreakDays}
          </Text>
          <Text style={styles.statLabel}>Best</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    margin: 16,
    marginTop: 0,
    borderWidth: 1,
    borderColor: "#39FF1420",
    shadowColor: "#39FF14",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#39FF1415",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    marginRight: 16,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  rankBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#39FF1415",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  levelContainer: {
    alignItems: "center",
    backgroundColor: "#39FF1415",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  levelLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  levelValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 2,
  },
  xpSection: {
    marginBottom: 20,
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  xpLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  xpValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  xpBarContainer: {
    height: 8,
    backgroundColor: "#2A2A2A",
    borderRadius: 4,
    overflow: "hidden",
  },
  xpBarFill: {
    height: "100%",
    backgroundColor: "#39FF14",
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  nextRankText: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 8,
    textAlign: "center",
  },
  nextLevelText: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#2A2A2A",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
