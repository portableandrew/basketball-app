// Home screen with overview, stats, and quick actions

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { HomeStackParamList } from "../navigation/types";
import { PlayerCard } from "../components/PlayerCard";

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList>;
import {
  getUserProfile,
  getGamificationState,
  setGamificationState,
  getPracticeDays,
  markRestDay,
  getPracticeDay,
  getShootingSets,
  getDrillCompletions,
  getDailyChallengeCompletions,
} from "../storage/storage";
import { UserProfile, GamificationState, PracticeDay } from "../models/types";
import { DEFAULT_SCHEDULES } from "../models/constants";
import { getTodayDateString, formatDate } from "../utils/dates";
import { calculateStreak } from "../utils/streaks";
import { calculateLevel, getRankForLevel, getLevelFromXP } from "../utils/xp";
import { getDayType, getScheduleLabel } from "../utils/holidays";
import { useTheme } from "../context/ThemeContext";
import { useRankUpContext } from "../context/RankUpContext";
import {
  getTodaysChallenge,
  checkDailyChallengeComplete,
  DailyChallengeCheckData,
} from "../utils/dailyChallenge";

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gamification, setGamification] = useState<GamificationState | null>(
    null
  );
  const [practiceDays, setPracticeDays] = useState<PracticeDay[]>([]);
  const [todayPractice, setTodayPractice] = useState<PracticeDay | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<{
    challenge: { id: string; name: string; description: string; icon: string; xpBonus: number; vcBonus: number };
    completed: boolean;
    isCompleteToday: boolean;
  } | null>(null);
  const { theme } = useTheme();
  const { checkRankAndLevel } = useRankUpContext();
  const [showDevButton, setShowDevButton] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const [userProfile, gamState, days] = await Promise.all([
      getUserProfile(),
      getGamificationState(),
      getPracticeDays(),
    ]);

    setProfile(userProfile);
    setGamification(gamState);
    setPracticeDays(days);

    const today = getTodayDateString();
    const todayDay = await getPracticeDay(today);
    setTodayPractice(todayDay || null);

    // Today's daily challenge
    const [drillCompletions, shootingSets, completedDates] = await Promise.all([
      getDrillCompletions(),
      getShootingSets(),
      getDailyChallengeCompletions(),
    ]);
    const challenge = getTodaysChallenge(today);
    const checkData: DailyChallengeCheckData = {
      date: today,
      practiceDays: days.map((d) => ({
        date: d.date,
        sessions: d.sessions || [],
        freeThrows: d.freeThrows,
      })),
      drillCompletions: drillCompletions.map((dc) => ({
        date: dc.date,
        drillId: dc.drillId,
        completed: dc.completed,
      })),
      shootingSets: shootingSets.map((s) => ({
        date: s.date,
        makes: s.makes,
        attempts: s.attempts,
      })),
    };
    const isCompleteToday = checkDailyChallengeComplete(challenge.id, checkData);
    const alreadyClaimed = completedDates.includes(today);
    setDailyChallenge({
      challenge,
      completed: alreadyClaimed,
      isCompleteToday,
    });

    // Update streaks
    if (gamState) {
      const shootingSets = await getShootingSets();
      const profile = await getUserProfile();
      const streakInfo = calculateStreak(
        days,
        getTodayDateString(),
        shootingSets,
        profile?.familyHolidayDates || []
      );
      const updatedGam = {
        ...gamState,
        currentStreakDays: streakInfo.current,
        bestStreakDays: Math.max(gamState.bestStreakDays, streakInfo.best),
      };
      setGamification(updatedGam);
      
      // Check for rank/level up after data load
      // This ensures animations trigger when returning to Home screen
      setTimeout(() => {
        checkRankAndLevel();
      }, 500);
    }
  };
  
  // Dev test function - add 500 XP
  const handleDevAddXP = async () => {
    try {
      const gamState = await getGamificationState();
      if (!gamState) return;
      
      const newTotalXp = gamState.totalXp + 500;
      const newLevel = getLevelFromXP(newTotalXp);
      const newRankDef = getRankForLevel(newLevel);
      
      await setGamificationState({
        ...gamState,
        totalXp: newTotalXp,
        level: newLevel,
        rank: newRankDef.name,
      });
      
      // Reload data and check for rank/level up
      await loadData();
      checkRankAndLevel();
    } catch (error) {
      console.error("Error adding dev XP:", error);
    }
  };
  
  // Toggle dev button - triple tap on title
  const [tapCount, setTapCount] = useState(0);
  const handleTitlePress = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 3) {
      setShowDevButton(true);
      setTapCount(0);
    }
    setTimeout(() => setTapCount(0), 1000);
  };

  const handleMarkRestDay = async () => {
    Alert.alert(
      "Mark Rest Day",
      "Mark today as a rest day? Rest days don't break your streak.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Rest Day",
          onPress: async () => {
            await markRestDay(getTodayDateString(), true);
            await loadData();
          },
        },
      ]
    );
  };

  if (!profile || !gamification) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const today = getTodayDateString();
  const todayPracticeDay = todayPractice || {
    date: today,
    isRestDay: false,
    isSchoolHoliday: false,
    isFamilyHoliday: false,
    sessions: [],
  };

  // Determine day type and schedule
  const dayType = getDayType(
    today,
    todayPracticeDay.isFamilyHoliday,
    todayPracticeDay.isRestDay
  );

  let schedule = DEFAULT_SCHEDULES[dayType];
  
  // Handle family holiday custom schedule
  if (dayType === "family_holiday" && profile.familyHolidaySchedule === "custom" && profile.familyHolidayCustomSlots) {
    schedule = {
      type: "family_holiday",
      timeSlots: profile.familyHolidayCustomSlots.map((slot, index) => ({
        id: `family_holiday_${index}`,
        name: index === 0 ? "Morning" : "Afternoon",
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    };
  } else if (dayType === "family_holiday" && profile.familyHolidaySchedule === "no_scheduled") {
    schedule = {
      type: "family_holiday",
      timeSlots: [],
    };
  }

  const scheduleLabel = getScheduleLabel(
    dayType,
    profile.familyHolidaySchedule,
    profile.familyHolidayCustomSlots
  );

  // Count sessions by time slot
  const sessionCount = todayPractice?.sessions?.length || 0;
  const morningSessions = todayPractice?.sessions?.filter((s) =>
    s && (s.timeSlot === "morning" || (s.timeSlotId && s.timeSlotId.includes("morning")))
  ) || [];
  const eveningSessions = todayPractice?.sessions?.filter((s) =>
    s && (s.timeSlot === "evening" || (s.timeSlot === "custom" && s.timeSlotId && s.timeSlotId.includes("afternoon")))
  ) || [];
  
  const hasMorning = morningSessions.length > 0;
  const hasAfternoon = eveningSessions.length > 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleTitlePress} activeOpacity={1}>
            <View>
              <Text style={styles.title}>Training Hub</Text>
              <Text style={styles.subtitle}>{formatDate(today)}</Text>
            </View>
          </TouchableOpacity>
          {/* Currency display removed - cosmetics disabled */}
        </View>
        {showDevButton && (
          <TouchableOpacity
            style={styles.devButton}
            onPress={handleDevAddXP}
          >
            <Text style={styles.devButtonText}>+500 XP (Dev Test)</Text>
          </TouchableOpacity>
        )}
      </View>

      <PlayerCard profile={profile} gamification={gamification} />

      {dailyChallenge && (
        <View style={[styles.dailyChallengeCard, { borderColor: theme.primary + "40" }]}>
          <View style={styles.dailyChallengeHeader}>
            <View style={[styles.dailyChallengeIconWrap, { backgroundColor: theme.primary + "20" }]}>
              <Ionicons name={dailyChallenge.challenge.icon as any} size={22} color={theme.primary} />
            </View>
            <View style={styles.dailyChallengeTitleWrap}>
              <Text style={styles.dailyChallengeLabel}>Daily Challenge</Text>
              <Text style={[styles.dailyChallengeName, { color: theme.primary }]}>
                {dailyChallenge.challenge.name}
              </Text>
            </View>
            {dailyChallenge.completed ? (
              <View style={[styles.dailyChallengeDoneBadge, { backgroundColor: theme.primary + "25" }]}>
                <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
                <Text style={[styles.dailyChallengeDoneText, { color: theme.primary }]}>Done</Text>
              </View>
            ) : dailyChallenge.isCompleteToday ? (
              <View style={[styles.dailyChallengeDoneBadge, { backgroundColor: theme.primary + "25" }]}>
                <Text style={[styles.dailyChallengeDoneText, { color: theme.primary }]}>Log to claim</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.dailyChallengeDescription}>
            {dailyChallenge.challenge.description}
          </Text>
          {!dailyChallenge.completed && (
            <Text style={styles.dailyChallengeReward}>
              +{dailyChallenge.challenge.xpBonus} XP · +{dailyChallenge.challenge.vcBonus} VC
            </Text>
          )}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <View style={[styles.scheduleBadge, { backgroundColor: theme.primary + "15" }]}>
            <Ionicons 
              name={
                dayType === "school" ? "school" :
                dayType === "school_holiday" ? "sunny" :
                dayType === "family_holiday" ? "airplane" :
                "bed"
              } 
              size={14} 
              color={theme.primary} 
            />
            <Text style={[styles.scheduleLabel, { color: theme.primary }]}>
              {dayType === "school" ? "School Day" :
               dayType === "school_holiday" ? "School Holiday" :
               dayType === "family_holiday" ? "Family Holiday" :
               "Rest Day"}
            </Text>
          </View>
        </View>
        <Text style={styles.scheduleDescription}>{scheduleLabel}</Text>
        {sessionCount > 0 && (
          <View style={styles.sessionCountBadge}>
            <Ionicons name="checkmark-circle" size={14} color={theme.primary} />
            <Text style={[styles.sessionCountText, { color: theme.primary }]}>
              {sessionCount} session{sessionCount !== 1 ? "s" : ""} completed today
            </Text>
          </View>
        )}
        {!schedule || !schedule.timeSlots || schedule.timeSlots.length === 0 ? (
          <Text style={styles.noSessionsText}>
            No scheduled sessions today
          </Text>
        ) : (
          schedule.timeSlots.map((slot) => {
          const isMorning = slot.id.includes("morning");
          const isAfternoon = slot.id.includes("afternoon") || slot.id.includes("evening");
          const isCompleted = isMorning && hasMorning || isAfternoon && hasAfternoon;
          
          // Get session types for this time slot
          const sessionsForSlot = isMorning 
            ? morningSessions 
            : isAfternoon 
            ? eveningSessions 
            : [];
          const sessionTypes = sessionsForSlot.map((s) => s.type || "mixed").join(", ");
          
          return (
            <View key={slot.id} style={styles.scheduleItem}>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleTime}>
                  {slot.startTime} - {slot.endTime}
                </Text>
                <Text style={styles.scheduleName}>{slot.name}</Text>
                {isCompleted && sessionTypes && (
                  <Text style={styles.sessionTypeText}>
                    {sessionTypes}
                  </Text>
                )}
              </View>
              <View
                style={[
                  styles.statusBadge,
                  isCompleted && { backgroundColor: theme.primary },
                ]}
              >
                {isCompleted && (
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                )}
                <Text
                  style={[
                    styles.statusText,
                    isCompleted && styles.statusTextCompleted,
                  ]}
                >
                  {isCompleted ? "Done" : "Not Started"}
                </Text>
              </View>
            </View>
          );
        }))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
          onPress={() => {
            navigation.navigate("LogWorkout");
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="add-circle" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.primaryButtonText}>Log Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleMarkRestDay}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="bed" size={20} color={theme.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Mark Today as Rest Day</Text>
        </TouchableOpacity>
      </View>

      {/* Debug: Streak Debug Button */}
      <TouchableOpacity
        style={styles.debugButton}
        onPress={() => {
          (navigation as any).navigate("StreakDebug");
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.debugButtonText}>Debug Streaks</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#0A0A0A",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 4,
  },
  currencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: "700",
  },
  dailyChallengeCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#1A1A1A",
  },
  dailyChallengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dailyChallengeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dailyChallengeTitleWrap: {
    flex: 1,
  },
  dailyChallengeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dailyChallengeName: {
    fontSize: 17,
    fontWeight: "700",
  },
  dailyChallengeDoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  dailyChallengeDoneText: {
    fontSize: 12,
    fontWeight: "700",
  },
  dailyChallengeDescription: {
    fontSize: 13,
    color: "#8E8E93",
    lineHeight: 18,
    marginBottom: 6,
  },
  dailyChallengeReward: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  scheduleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  scheduleLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scheduleDescription: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 16,
    lineHeight: 18,
  },
  noSessionsText: {
    fontSize: 14,
    color: "#8E8E93",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
  sessionCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#1A1A1A",
    alignSelf: "flex-start",
  },
  sessionCountText: {
    fontSize: 13,
    fontWeight: "600",
  },
  sessionTypeText: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
    fontStyle: "italic",
  },
  section: {
    backgroundColor: "#1A1A1A",
    margin: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  scheduleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  scheduleName: {
    fontSize: 13,
    color: "#8E8E93",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#2A2A2A",
  },
  statusBadgeCompleted: {
    // backgroundColor applied dynamically via inline styles
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
  },
  statusTextCompleted: {
    color: "#FFFFFF",
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  primaryButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  secondaryButton: {
    backgroundColor: "#1A1A1A",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#2A2A2A",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  debugButton: {
    marginTop: 12,
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#39FF1440",
    alignItems: "center",
  },
  debugButtonText: {
    color: "#39FF14",
    fontSize: 12,
    fontWeight: "600",
  },
  devButton: {
    marginTop: 12,
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#39FF1440",
    alignItems: "center",
  },
  devButtonText: {
    color: "#39FF14",
    fontSize: 12,
    fontWeight: "600",
  },
});
