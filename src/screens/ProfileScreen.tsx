// Profile Screen with Achievements

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getUserProfile,
  getGamificationState,
  getShootingSets,
  getPracticeDays,
  getDrillCompletions,
  getAchievements,
  setAchievements,
  setUserProfile,
  createBackupSnapshot,
  restoreBackupSnapshot,
  getBackupSnapshotInfo,
} from "../storage/storage";
import { UserProfile, GamificationState } from "../models/types";
import { Achievement } from "../models/achievements";
import {
  checkAchievements,
  getNewlyUnlockedAchievements,
  awardAchievementXp,
} from "../utils/achievements";
import { getXpProgress, getXPForLevel } from "../utils/xp";
import { getRankForLevel, getNextRank } from "../models/ranks";
import { SimpleAvatar } from "../components/SimpleAvatar";
import { useTheme } from "../context/ThemeContext";
import { Alert } from "react-native";

export const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gamification, setGamification] = useState<GamificationState | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [autoSaveResults, setAutoSaveResults] = useState(true);
  const [lastBackupISO, setLastBackupISO] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userProfile, gamState, shootingSets, practiceDays, drillCompletions, storedAchievements, backupInfo] =
        await Promise.all([
          getUserProfile(),
          getGamificationState(),
          getShootingSets(),
          getPracticeDays(),
          getDrillCompletions(),
          getAchievements(),
          getBackupSnapshotInfo(),
        ]);

      setProfile(userProfile);
      setGamification(gamState);
      setAutoSaveResults(userProfile?.autoSaveResults !== false);
      setLastBackupISO(backupInfo?.createdAtISO || null);

      if (gamState) {
        // Check for new achievements
        const achievementData = {
          shootingSets: shootingSets || [],
          practiceDays: practiceDays || [],
          drillCompletions: drillCompletions || [],
          gamification: gamState,
        };

        const updatedAchievements = checkAchievements(
          achievementData,
          storedAchievements
        );

        // Check for newly unlocked achievements
        const newlyUnlocked = getNewlyUnlockedAchievements(
          updatedAchievements,
          storedAchievements
        );

        if (newlyUnlocked.length > 0) {
          // Award XP
          const xpEarned = await awardAchievementXp(newlyUnlocked);
          
          // Update gamification state
          const updatedGam = await getGamificationState();
          if (updatedGam) {
            setGamification(updatedGam);
          }

          // Show notification
          const achievementNames = newlyUnlocked.map((a) => a.name).join(", ");
          Alert.alert(
            "Achievement Unlocked!",
            `${achievementNames}\n\n+${xpEarned} XP`,
            [{ text: "Awesome!" }]
          );
        }

        // Save updated achievements
        await setAchievements(updatedAchievements);
        setAchievements(updatedAchievements);
      } else {
        setAchievements(storedAchievements);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSaveToggle = async (value: boolean) => {
    if (!profile) return;
    try {
      const updatedProfile: UserProfile = { ...profile, autoSaveResults: value };
      await setUserProfile(updatedProfile);
      setProfile(updatedProfile);
      setAutoSaveResults(value);
    } catch (error) {
      console.error("Error updating auto-save setting:", error);
      Alert.alert("Error", "Could not update auto-save setting.");
    }
  };

  const handleBackupNow = async () => {
    try {
      const snapshot = await createBackupSnapshot();
      setLastBackupISO(snapshot.createdAtISO);
      Alert.alert("Backup Saved", "Your results backup has been saved.");
    } catch (error) {
      console.error("Error creating backup:", error);
      Alert.alert("Error", "Could not create backup.");
    }
  };

  const handleRestoreBackup = async () => {
    Alert.alert(
      "Restore Backup",
      "This will replace your current local data with the last backup. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: async () => {
            try {
              const restored = await restoreBackupSnapshot();
              if (!restored) {
                Alert.alert("No Backup Found", "There is no backup to restore.");
                return;
              }
              await loadData();
              Alert.alert("Backup Restored", "Your saved results have been restored.");
            } catch (error) {
              console.error("Error restoring backup:", error);
              Alert.alert("Error", "Could not restore backup.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!profile || !gamification) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  const progress = getXpProgress(gamification.totalXp, gamification.level);
  const rankDef = getRankForLevel(gamification.level);
  const nextRankInfo = getNextRank(gamification.level);
  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);
  
  // Calculate XP needed for next level
  const xpForNextLevel = getXPForLevel(gamification.level + 1);
  const xpNeededForNextLevel = xpForNextLevel - gamification.totalXp;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Player Overview */}
      <View style={styles.section}>
        <View style={styles.playerHeader}>
          <SimpleAvatar size={80} borderColor={rankDef.primaryColor} showBall={false} />
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{profile.name}</Text>
            <View
              style={[
                styles.rankBadge,
                {
                  backgroundColor: rankDef.primaryColor + "20",
                  borderColor: rankDef.primaryColor,
                },
              ]}
            >
              <Ionicons
                name={rankDef.iconName as any}
                size={16}
                color={rankDef.primaryColor}
              />
              <Text style={[styles.rankText, { color: rankDef.primaryColor }]}>
                {rankDef.name}
              </Text>
            </View>
          </View>
          <View style={styles.levelContainer}>
            <Text style={styles.levelLabel}>LVL</Text>
            <Text style={styles.levelValue}>{gamification.level}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{gamification.totalXp.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{gamification.currentStreakDays}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{gamification.bestStreakDays}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>
        
        {/* Next Rank & Level Info */}
        <View style={styles.progressSection}>
          <View style={styles.xpBarContainer}>
            <View
              style={[
                styles.xpBarFill,
                {
                  width: `${progress.percentage}%`,
                  backgroundColor: rankDef.primaryColor,
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
      </View>

      {/* Data Safety */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
          <Text style={styles.sectionTitle}>Data Safety</Text>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingTextWrap}>
            <Text style={styles.settingTitle}>Auto-save Backup</Text>
            <Text style={styles.settingDescription}>
              Automatically save a backup snapshot when workouts are logged.
            </Text>
          </View>
          <Switch
            value={autoSaveResults}
            onValueChange={handleAutoSaveToggle}
            trackColor={{ false: "#444", true: theme.primary + "66" }}
            thumbColor={autoSaveResults ? theme.primary : "#999"}
          />
        </View>

        <Text style={styles.backupMeta}>
          Last backup: {lastBackupISO ? new Date(lastBackupISO).toLocaleString() : "Never"}
        </Text>

        <View style={styles.backupActions}>
          <TouchableOpacity
            style={[styles.backupButton, { borderColor: theme.primary + "55" }]}
            onPress={handleBackupNow}
          >
            <Ionicons name="cloud-upload-outline" size={16} color={theme.primary} />
            <Text style={[styles.backupButtonText, { color: theme.primary }]}>Backup Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.backupButton, { borderColor: "#8E8E93" }]}
            onPress={handleRestoreBackup}
          >
            <Ionicons name="refresh-circle-outline" size={16} color="#B8B8BD" />
            <Text style={[styles.backupButtonText, { color: "#B8B8BD" }]}>Restore Backup</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Achievements Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trophy" size={24} color={theme.primary} />
          <Text style={styles.sectionTitle}>Achievements</Text>
          <Text style={styles.achievementCount}>
            {unlockedAchievements.length} / {achievements.length}
          </Text>
        </View>

        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <View style={styles.achievementsList}>
            {unlockedAchievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  { borderColor: theme.primary + "40" },
                ]}
              >
                <View
                  style={[
                    styles.achievementIcon,
                    { backgroundColor: theme.primary + "20" },
                  ]}
                >
                  <Ionicons
                    name={achievement.icon as any}
                    size={32}
                    color={theme.primary}
                  />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                  <View style={styles.achievementReward}>
                    <Ionicons name="flash" size={14} color={theme.primary} />
                    <Text style={[styles.achievementXp, { color: theme.primary }]}>
                      +{achievement.xpReward} XP
                    </Text>
                    {achievement.unlockedAt && (
                      <Text style={styles.achievementDate}>
                        Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <View style={styles.lockedSection}>
            <Text style={styles.lockedTitle}>Locked Achievements</Text>
            <View style={styles.achievementsList}>
              {lockedAchievements.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[styles.achievementCard, styles.lockedCard]}
                >
                  <View style={[styles.achievementIcon, styles.lockedIcon]}>
                    <Ionicons name={achievement.icon as any} size={32} color="#666" />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementNameLocked}>
                      {achievement.name}
                    </Text>
                    <Text style={styles.achievementDescriptionLocked}>
                      {achievement.description}
                    </Text>
                    <View style={styles.achievementReward}>
                      <Ionicons name="flash" size={14} color="#666" />
                      <Text style={styles.achievementXpLocked}>
                        +{achievement.xpReward} XP
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
  errorText: {
    color: "#FF4444",
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
  section: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    margin: 16,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  playerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  playerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  rankBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  levelLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
  },
  levelValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 4,
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
  },
  achievementCount: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "600",
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: "row",
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  lockedCard: {
    opacity: 0.5,
    borderColor: "#2A2A2A",
  },
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  lockedIcon: {
    backgroundColor: "#1A1A1A",
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  achievementNameLocked: {
    fontSize: 18,
    fontWeight: "700",
    color: "#666",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 8,
  },
  achievementDescriptionLocked: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  achievementReward: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  achievementXp: {
    fontSize: 14,
    fontWeight: "600",
  },
  achievementXpLocked: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  achievementDate: {
    fontSize: 12,
    color: "#8E8E93",
    marginLeft: 8,
  },
  lockedSection: {
    marginTop: 24,
  },
  lockedTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  xpBarContainer: {
    height: 8,
    backgroundColor: "#2A2A2A",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  xpBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  nextRankText: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 4,
  },
  nextLevelText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  settingTextWrap: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  settingDescription: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 4,
    lineHeight: 18,
  },
  backupMeta: {
    marginTop: 12,
    color: "#8E8E93",
    fontSize: 13,
  },
  backupActions: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  backupButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  backupButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
