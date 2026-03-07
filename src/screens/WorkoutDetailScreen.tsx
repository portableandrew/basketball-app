// Workout Detail Screen - Shows comprehensive workout information and step runner

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { WorkoutDetail, getWorkoutDetail } from "../models/workoutDetails";
import { StepRunner } from "../components/StepRunner";
import { WorkoutStackParamList } from "../navigation/types";
import {
  addDrillCompletion,
  addPracticeSession,
  savePracticeDay,
  getPracticeDay,
  getGamificationState,
  setGamificationState,
} from "../storage/storage";
import { getTodayDateString } from "../utils/dates";
import { calculateSessionXp, calculateLevel, getRankForLevel } from "../utils/xp";
import { awardWorkoutCurrency, checkLevelUpReward } from "../utils/currency";
import { useRankUpContext } from "../context/RankUpContext";

type WorkoutDetailRouteProp = RouteProp<WorkoutStackParamList, "WorkoutDetail">;
type WorkoutDetailNavigationProp = StackNavigationProp<WorkoutStackParamList, "WorkoutDetail">;

export const WorkoutDetailScreen: React.FC = () => {
  const navigation = useNavigation<WorkoutDetailNavigationProp>();
  const route = useRoute<WorkoutDetailRouteProp>();
  const { workoutId } = route.params;
  const { checkRankAndLevel } = useRankUpContext();

  const [showStepRunner, setShowStepRunner] = useState(false);

  const workoutDetail = getWorkoutDetail(workoutId);

  const handleMarkComplete = async () => {
    if (!workoutDetail) return;

    Alert.alert(
      "Complete Workout",
      `Mark "${workoutDetail.title}" as completed? You'll earn ${workoutDetail.estimatedTime * 2} XP.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            try {
              const today = getTodayDateString();
              const practiceDay = await getPracticeDay(today);
              const gamState = await getGamificationState();

              const completionId = `completion_${Date.now()}_${workoutId}`;
              await addDrillCompletion({
                id: completionId,
                date: today,
                drillId: workoutId,
                completed: true,
                timeOfDay: "afternoon",
              });

              const sessionId = `session_${Date.now()}`;
              const newSession = {
                id: sessionId,
                date: today,
                timeSlot: "evening" as const,
                timeSlotId: "afternoon",
                type: "drill" as const,
                shootingSets: [] as string[],
                drillCompletions: [completionId],
              };

              // Create or update practice session
              if (practiceDay) {
                practiceDay.sessions = practiceDay.sessions || [];
                practiceDay.sessions.push(newSession);
                await savePracticeDay(practiceDay);
              } else {
                await savePracticeDay({
                  date: today,
                  isRestDay: false,
                  isSchoolHoliday: false,
                  isFamilyHoliday: false,
                  sessions: [newSession],
                });
              }

              // Award XP (estimated time * 2, similar to workout xpReward)
              const xpEarned = workoutDetail.estimatedTime * 2;
              const newTotalXp = gamState.totalXp + xpEarned;
              const newLevel = calculateLevel(newTotalXp);
              const newRankDef = getRankForLevel(newLevel);
              const oldLevel = gamState.level;
              const levelUpCurrency = await checkLevelUpReward(oldLevel, newLevel);
              const currencyEarned = await awardWorkoutCurrency();

              await setGamificationState({
                ...gamState,
                totalXp: newTotalXp,
                level: newLevel,
                rank: newRankDef.name,
                currency: gamState.currency + currencyEarned + levelUpCurrency,
              });

              // Trigger rank/level up check
              setTimeout(() => {
                checkRankAndLevel();
              }, 300);

              Alert.alert(
                "Workout Completed!",
                `You earned ${xpEarned} XP!\n+${currencyEarned} VC${levelUpCurrency > 0 ? `\n+${levelUpCurrency} VC (Level Up!)` : ""}`,
                [{ text: "OK", onPress: () => navigation.goBack() }]
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

  if (!workoutDetail) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Workout not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{workoutDetail.title}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{workoutDetail.category.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.overviewCard}>
            <View style={styles.overviewRow}>
              <Ionicons name="flag" size={20} color="#39FF14" />
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Goal</Text>
                <Text style={styles.overviewValue}>{workoutDetail.goal}</Text>
              </View>
            </View>
            <View style={styles.overviewRow}>
              <Ionicons name="flash" size={20} color="#39FF14" />
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Skill Focus</Text>
                <Text style={styles.overviewValue}>{workoutDetail.skillFocus}</Text>
              </View>
            </View>
            <View style={styles.overviewRow}>
              <Ionicons name="time-outline" size={20} color="#39FF14" />
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Estimated Time</Text>
                <Text style={styles.overviewValue}>{workoutDetail.estimatedTime} minutes</Text>
              </View>
            </View>
            <View style={styles.overviewRow}>
              <Ionicons name="basketball-outline" size={20} color="#39FF14" />
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Equipment</Text>
                <Text style={styles.overviewValue}>{workoutDetail.equipment.join(", ")}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Step-by-Step Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step-by-Step Instructions</Text>
          {(workoutDetail.steps || []).map((step) => (
            <View key={step.stepNumber} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>
              <Text style={styles.stepDescription}>{step.description}</Text>
              <View style={styles.stepDetails}>
                {step.sets && step.reps && (
                  <View style={styles.stepDetailItem}>
                    <Ionicons name="repeat" size={16} color="#8E8E93" />
                    <Text style={styles.stepDetailText}>
                      {step.sets} sets × {step.reps} reps
                    </Text>
                  </View>
                )}
                {step.durationSeconds && (
                  <View style={styles.stepDetailItem}>
                    <Ionicons name="time-outline" size={16} color="#8E8E93" />
                    <Text style={styles.stepDetailText}>
                      {Math.floor(step.durationSeconds / 60)}:{(step.durationSeconds % 60).toString().padStart(2, "0")}
                    </Text>
                  </View>
                )}
                {step.restSeconds && step.restSeconds > 0 && (
                  <View style={styles.stepDetailItem}>
                    <Ionicons name="pause-circle-outline" size={16} color="#8E8E93" />
                    <Text style={styles.stepDetailText}>{step.restSeconds}s rest</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Coaching Cues */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coaching Cues</Text>
          <View style={styles.cuesCard}>
            {(workoutDetail.coachingCues || []).map((cue, index) => (
              <View key={index} style={styles.cueItem}>
                <Ionicons name="checkmark-circle" size={18} color="#39FF14" />
                <Text style={styles.cueText}>{cue}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Common Mistakes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Mistakes</Text>
          <View style={styles.mistakesCard}>
            {(workoutDetail.commonMistakes || []).map((mistake, index) => (
              <View key={index} style={styles.mistakeItem}>
                <Ionicons name="warning" size={18} color="#FF6B6B" />
                <Text style={styles.mistakeText}>{mistake}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* How to Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Log This</Text>
          <View style={styles.loggingCard}>
            <Ionicons name="information-circle" size={20} color="#39FF14" />
            <Text style={styles.loggingText}>{workoutDetail.loggingInstructions}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setShowStepRunner(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="play" size={24} color="#0A0A0A" />
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleMarkComplete}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="checkmark-circle" size={20} color="#0A0A0A" />
            <Text style={styles.completeButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Step Runner Modal */}
      <Modal
        visible={showStepRunner}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowStepRunner(false)}
      >
        <StepRunner
          workoutDetail={workoutDetail}
          onComplete={() => {
            setShowStepRunner(false);
            // Return to detail screen - user can then mark as complete
            // In future, we could auto-complete here
          }}
          onCancel={() => setShowStepRunner(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#39FF1420",
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#39FF1415",
    borderWidth: 1,
    borderColor: "#39FF1440",
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#39FF14",
    letterSpacing: 1,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  overviewCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    gap: 16,
  },
  overviewRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  overviewItem: {
    flex: 1,
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 15,
    color: "#FFFFFF",
    lineHeight: 22,
  },
  stepCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  stepNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#39FF14",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0A0A0A",
  },
  stepTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  stepDescription: {
    fontSize: 15,
    color: "#E0E0E0",
    lineHeight: 22,
    marginBottom: 12,
  },
  stepDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  stepDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stepDetailText: {
    fontSize: 13,
    color: "#8E8E93",
  },
  cuesCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    gap: 12,
  },
  cueItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  cueText: {
    flex: 1,
    fontSize: 15,
    color: "#E0E0E0",
    lineHeight: 22,
  },
  mistakesCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    gap: 12,
  },
  mistakeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  mistakeText: {
    flex: 1,
    fontSize: 15,
    color: "#E0E0E0",
    lineHeight: 22,
  },
  loggingCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#39FF1440",
    gap: 12,
  },
  loggingText: {
    flex: 1,
    fontSize: 15,
    color: "#E0E0E0",
    lineHeight: 22,
  },
  actionButtons: {
    padding: 20,
    paddingTop: 8,
    gap: 12,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#39FF14",
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0A0A0A",
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#39FF1440",
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#39FF14",
  },
  errorText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 50,
  },
});
