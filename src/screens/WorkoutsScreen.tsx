// NBA Workouts Screen - Professional NBA-level training workouts

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  addDrillCompletion,
  addPracticeSession,
  savePracticeDay,
  getPracticeDay,
  getGamificationState,
  setGamificationState,
  getPracticeDays,
  getUserProfile,
  getShootingSets,
  getDrillCompletions,
  getAchievements,
  setAchievements,
} from "../storage/storage";
import { getTodayDateString } from "../utils/dates";
import { calculateSessionXp, calculateLevel, getRankForLevel } from "../utils/xp";
import { calculateStreak, reconcileStreak } from "../utils/streaks";
import { isSchoolHoliday } from "../utils/holidays";
import { awardWorkoutCurrency, checkLevelUpReward } from "../utils/currency";
import {
  checkAchievements,
  getNewlyUnlockedAchievements,
  awardAchievementXp,
} from "../utils/achievements";
import {
  getTodaysChallenge,
  checkDailyChallengeComplete,
  DailyChallengeCheckData,
} from "../utils/dailyChallenge";
import { getDailyChallengeCompletions, setDailyChallengeCompleted } from "../storage/storage";
import { XP_CONSTANTS } from "../models/constants";
import { useRankUpContext } from "../context/RankUpContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { WorkoutStackParamList } from "../navigation/types";

type WorkoutNavigationProp = StackNavigationProp<WorkoutStackParamList>;

interface NBAWorkout {
  id: string;
  category: "perimeter" | "finishing" | "handle";
  title: string;
  focus: string;
  description: string;
  duration: number;
  xpReward: number;
}

const NBA_WORKOUTS: NBAWorkout[] = [
  // Perimeter Shooting
  {
    id: "perimeter_1",
    category: "perimeter",
    title: "Ray Allen Corner 3 Series",
    focus: "Elite Corner Shooting",
    description:
      "Master the corner three like Ray Allen. 50 shots from each corner with game-speed catch-and-shoot mechanics. Focus on quick release and perfect form.",
    duration: 30,
    xpReward: 20,
  },
  {
    id: "perimeter_2",
    category: "perimeter",
    title: "Relocation Shooting Drill",
    focus: "Off-Ball Movement",
    description:
      "Shoot, relocate, catch, shoot. Work on moving without the ball and finding open spots. 10 makes from 5 different spots.",
    duration: 25,
    xpReward: 20,
  },
  {
    id: "perimeter_3",
    category: "perimeter",
    title: "1-Dribble Pull-Up Series",
    focus: "Creating Space",
    description:
      "Catch, one dribble, pull-up jumper. Work from wing and top of key. 20 makes from each spot with game-speed moves.",
    duration: 20,
    xpReward: 20,
  },
  {
    id: "perimeter_4",
    category: "perimeter",
    title: "Step-Back Three Mastery",
    focus: "Advanced Shot Creation",
    description:
      "Master the step-back three-pointer. Create space and shoot off balance. 30 step-back threes from various spots.",
    duration: 25,
    xpReward: 20,
  },
  {
    id: "perimeter_5",
    category: "perimeter",
    title: "Form Shooting Fundamentals",
    focus: "Perfect Shooting Mechanics",
    description:
      "Master the fundamentals of shooting form. Work close to the rim focusing on perfect mechanics: balance, alignment, release, and follow-through. 100 makes from various close-range spots.",
    duration: 20,
    xpReward: 20,
  },
  {
    id: "perimeter_6",
    category: "perimeter",
    title: "Swish Everything",
    focus: "Consecutive Swish Precision",
    description:
      "10-level challenge in 30 minutes. Advance by hitting consecutive clean swishes from harder spots and dribble entries. Log your highest level reached.",
    duration: 30,
    xpReward: 30,
  },
  // Finishing Craft
  {
    id: "finishing_1",
    category: "finishing",
    title: "Elite Floater Package",
    focus: "Mid-Range Finishing",
    description:
      "Game-speed floaters off both feet, one foot, and off the dribble. Work from both sides of the key with defenders in mind. 50 floaters total.",
    duration: 30,
    xpReward: 20,
  },
  {
    id: "finishing_2",
    category: "finishing",
    title: "Reverse Layup Mastery",
    focus: "Advanced Finishing",
    description:
      "Master reverse layups from both sides. Work on body control and finishing with both hands. 30 makes from each side.",
    duration: 25,
    xpReward: 20,
  },
  {
    id: "finishing_3",
    category: "finishing",
    title: "Euro Step & And-1 Finishes",
    focus: "Contact Finishing",
    description:
      "Euro steps, spin moves, and finishing through contact. Work on body control and strength. 40 finishes total.",
    duration: 30,
    xpReward: 20,
  },
  {
    id: "finishing_4",
    category: "finishing",
    title: "Inside-Hand Finishes",
    focus: "Advanced Technique",
    description:
      "Master inside-hand finishes around the rim. Work on both sides with game-speed moves. 30 makes from each side.",
    duration: 25,
    xpReward: 20,
  },
  // Handle & Creation
  {
    id: "handle_1",
    category: "handle",
    title: "Pro Combo Moves",
    focus: "Advanced Ball Handling",
    description:
      "Between-the-legs, behind-the-back, spin moves, and combo moves at game speed. Full-court ball handling with changes of direction.",
    duration: 30,
    xpReward: 20,
  },
  {
    id: "handle_2",
    category: "handle",
    title: "Cone Series Elite",
    focus: "Change of Direction",
    description:
      "Advanced cone drills with game-speed moves. Work on quick changes of direction and finishing at the rim.",
    duration: 25,
    xpReward: 20,
  },
  {
    id: "handle_3",
    category: "handle",
    title: "Two-Ball Advanced",
    focus: "Ball Control",
    description:
      "Elite two-ball dribbling: crossovers, between legs, behind back, and speed variations simultaneously.",
    duration: 25,
    xpReward: 20,
  },
  {
    id: "handle_4",
    category: "handle",
    title: "Game-Speed Creation",
    focus: "Shot Creation",
    description:
      "Full-court ball handling with game-speed moves, changes of direction, and finishing at the rim. Work on creating your own shot.",
    duration: 30,
    xpReward: 20,
  },
];

export const WorkoutsScreen: React.FC = () => {
  const navigation = useNavigation<WorkoutNavigationProp>();
  const { checkRankAndLevel } = useRankUpContext();
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "perimeter" | "finishing" | "handle"
  >("all");

  const filteredWorkouts =
    selectedCategory === "all"
      ? NBA_WORKOUTS
      : NBA_WORKOUTS.filter((w) => w.category === selectedCategory);

  const handleCompleteWorkout = async (workout: NBAWorkout) => {
    Alert.alert(
      "Complete Workout",
      `Mark "${workout.title}" as completed? You'll earn ${workout.xpReward} XP.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            try {
              const today = getTodayDateString();
              const completionId = `completion_${Date.now()}_${workout.id}`;

              await addDrillCompletion({
                id: completionId,
                drillId: workout.id,
                date: today,
                timeOfDay: "other",
                completed: true,
              });

              const sessionId = `session_${Date.now()}`;
              await addPracticeSession({
                id: sessionId,
                date: today,
                timeSlot: "custom",
                timeSlotId: "other",
                type: "drill",
                shootingSets: [],
                drillCompletions: [completionId],
              });

              const userProfile = await getUserProfile();
              let practiceDay = await getPracticeDay(today);
              if (!practiceDay) {
                practiceDay = {
                  date: today,
                  isRestDay: false,
                  isSchoolHoliday: isSchoolHoliday(today),
                  isFamilyHoliday: userProfile?.familyHolidayDates?.includes(today) || false,
                  sessions: [],
                };
              }
              practiceDay.sessions.push({
                id: sessionId,
                date: today,
                timeSlot: "custom",
                timeSlotId: "other",
                type: "drill",
                shootingSets: [],
                drillCompletions: [completionId],
              });
              await savePracticeDay(practiceDay);

              // Update XP (with optional streak multiplier)
              const gamState = await getGamificationState();
              const reconciled = reconcileStreak({
                streakCount: gamState.currentStreakDays,
                lastCompletionISO: gamState.lastCompletionISO,
                nowISO: new Date().toISOString(),
              });
              const streakBonusXp =
                reconciled.streakCount >= 3
                  ? Math.floor(workout.xpReward * (XP_CONSTANTS.STREAK_BONUS_MULTIPLIER - 1))
                  : 0;
              const newTotalXp = gamState.totalXp + workout.xpReward + streakBonusXp;
              const newLevel = calculateLevel(newTotalXp);
              const newRankDef = getRankForLevel(newLevel);
              const newRank = newRankDef.name;
              const oldLevel = gamState.level;

              // Award currency for workout completion
              const currencyEarned = await awardWorkoutCurrency();
              
              // Check for level up and award currency
              const levelUpCurrency = await checkLevelUpReward(oldLevel, newLevel);
              
              // Get updated currency after rewards
              const updatedGamState = await getGamificationState();

              // Update streaks using reconciliation (safe, atomic update)
              const nowISO = new Date().toISOString();

              // Also calculate from practice days for best streak (complex logic with rest days/holidays)
              const practiceDays = await getPracticeDays();
              const shootingSets = await getShootingSets();
              const profile = await getUserProfile();
              const streakInfo = calculateStreak(
                practiceDays,
                today,
                shootingSets,
                profile?.familyHolidayDates || []
              );

              // Use calculateStreak for current streak (rest days don't reset)
              await setGamificationState({
                totalXp: newTotalXp,
                level: newLevel,
                rank: newRank,
                currentStreakDays: streakInfo.current,
                bestStreakDays: Math.max(gamState.bestStreakDays, streakInfo.best),
                currency: updatedGamState.currency,
                lastCompletionISO: nowISO,
              });
              
              // Trigger rank/level up check after XP update
              setTimeout(() => {
                checkRankAndLevel();
              }, 300);

              // Check for achievements
              const allShootingSets = await getShootingSets();
              const allPracticeDays = await getPracticeDays();
              const allDrillCompletions = await getDrillCompletions();
              const storedAchievements = await getAchievements();

              const achievementData = {
                shootingSets: allShootingSets,
                practiceDays: allPracticeDays,
                drillCompletions: allDrillCompletions,
                gamification: {
                  ...updatedGamState,
                  totalXp: newTotalXp,
                  level: newLevel,
                  currentStreakDays: streakInfo.current,
                  bestStreakDays: Math.max(gamState.bestStreakDays, streakInfo.best),
                },
              };

              const updatedAchievements = checkAchievements(
                achievementData,
                storedAchievements
              );
              const newlyUnlocked = getNewlyUnlockedAchievements(
                updatedAchievements,
                storedAchievements
              );

              let achievementMessage = "";
              if (newlyUnlocked.length > 0) {
                const achievementXp = await awardAchievementXp(newlyUnlocked);
                // Update gamification state again after achievement XP
                const finalGamState = await getGamificationState();
                await setAchievements(updatedAchievements);

                const achievementNames = newlyUnlocked.map((a) => a.name).join(", ");
                achievementMessage = `\n\n🏆 Achievement Unlocked!\n${achievementNames}\n+${achievementXp} XP`;
              } else {
                await setAchievements(updatedAchievements);
              }

              // Daily challenge: check and award if just completed today
              let dailyChallengeMessage = "";
              const challenge = getTodaysChallenge(today);
              const completedDates = await getDailyChallengeCompletions();
              if (!completedDates.includes(today)) {
                const checkData: DailyChallengeCheckData = {
                  date: today,
                  practiceDays: allPracticeDays.map((d) => ({
                    date: d.date,
                    sessions: d.sessions || [],
                    freeThrows: d.freeThrows,
                  })),
                  drillCompletions: allDrillCompletions.map((dc) => ({
                    date: dc.date,
                    drillId: dc.drillId,
                    completed: dc.completed,
                  })),
                  shootingSets: allShootingSets.map((s) => ({
                    date: s.date,
                    makes: s.makes,
                    attempts: s.attempts,
                  })),
                };
                if (checkDailyChallengeComplete(challenge.id, checkData)) {
                  await setDailyChallengeCompleted(today);
                  const g = await getGamificationState();
                  await setGamificationState({
                    ...g,
                    totalXp: g.totalXp + challenge.xpBonus,
                    currency: g.currency + challenge.vcBonus,
                  });
                  dailyChallengeMessage = `\n\n⭐ Daily: ${challenge.name}! +${challenge.xpBonus} XP, +${challenge.vcBonus} VC`;
                }
              }

              const streakMsg = streakBonusXp > 0 ? `\n🔥 1.1x Streak bonus! +${streakBonusXp} XP` : "";
              Alert.alert(
                "Workout Completed!",
                `You earned ${workout.xpReward} XP!${streakMsg}\n+${currencyEarned} VC${levelUpCurrency > 0 ? `\n+${levelUpCurrency} VC (Level Up!)` : ""}${achievementMessage}${dailyChallengeMessage}`,
                [{ text: "OK" }]
              );
            } catch (error) {
              console.error("Error completing workout:", error);
              Alert.alert("Error", "Failed to log workout");
            }
          },
        },
      ]
    );
  };

  const categoryLabels = {
    all: "All Workouts",
    perimeter: "Perimeter Shooting",
    finishing: "Finishing Craft",
    handle: "Handle & Creation",
  };

  const categoryIcons = {
    all: "basketball",
    perimeter: "basketball-outline",
    finishing: "flash",
    handle: "fitness",
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.categorySelector}>
        {(["all", "perimeter", "finishing", "handle"] as const).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={categoryIcons[cat] as any}
              size={18}
              color={selectedCategory === cat ? "#0A0A0A" : "#8E8E93"}
            />
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === cat && styles.categoryButtonTextActive,
              ]}
            >
              {categoryLabels[cat]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.workoutsList}>
        {filteredWorkouts.map((workout) => (
          <View key={workout.id} style={styles.workoutCard}>
            <TouchableOpacity
              style={styles.workoutCardContent}
              onPress={() => navigation.navigate("WorkoutDetail", { workoutId: workout.id })}
              activeOpacity={0.85}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={styles.workoutHeader}>
                <View style={styles.workoutTitleSection}>
                  <Text style={styles.workoutTitle}>{workout.title}</Text>
                  <View style={styles.focusBadge}>
                    <Text style={styles.focusText}>{workout.focus}</Text>
                  </View>
                </View>
                <View style={styles.xpBadge}>
                  <Ionicons name="flash" size={16} color="#39FF14" />
                  <Text style={styles.xpText}>+{workout.xpReward}</Text>
                </View>
              </View>
              <Text style={styles.workoutDescription}>{workout.description}</Text>
            </TouchableOpacity>

            <View style={styles.workoutFooter}>
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={14} color="#8E8E93" />
                <Text style={styles.durationText}>{workout.duration} min</Text>
              </View>
              <View style={styles.footerActions}>
                {workout.id === "perimeter_5" && (
                  <TouchableOpacity
                    style={styles.logFormShootingButton}
                    onPress={() => handleCompleteWorkout(workout)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#39FF14" />
                    <Text style={styles.logFormShootingText}>Log</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.viewDetailsBadge}
                  onPress={() => navigation.navigate("WorkoutDetail", { workoutId: workout.id })}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={styles.viewDetailsText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={16} color="#39FF14" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  categorySelector: {
    flexDirection: "row",
    padding: 16,
    gap: 10,
    flexWrap: "wrap",
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: "#39FF14",
    borderColor: "#39FF14",
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
  },
  categoryButtonTextActive: {
    color: "#0A0A0A",
  },
  workoutsList: {
    padding: 16,
    gap: 16,
  },
  workoutCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  workoutCardContent: {
    flex: 1,
    marginBottom: 16,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  workoutTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  focusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#39FF1415",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  focusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#39FF14",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#39FF1415",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  xpText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#39FF14",
  },
  workoutDescription: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
    marginBottom: 16,
  },
  workoutFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logFormShootingButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#39FF1415",
    borderWidth: 1,
    borderColor: "#39FF1440",
    gap: 6,
  },
  logFormShootingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#39FF14",
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  durationText: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "600",
  },
  viewDetailsBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#39FF1440",
    gap: 6,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#39FF14",
  },
});
