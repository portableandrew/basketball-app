// Log Workout screen - multi-step form for logging practice

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { HomeStackParamList } from "../navigation/types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SpotInputRow } from "../components/SpotInputRow";
import { DrillChecklistItem } from "../components/DrillChecklistItem";
import {
  getShotSpots,
  getDrills,
  addShootingSet,
  addDrillCompletion,
  addPracticeSession,
  savePracticeDay,
  getPracticeDay,
  getUserProfile,
  getGamificationState,
  setGamificationState,
  getPracticeDays,
  getShootingSetsByDate,
  getDrillCompletionsByDate,
  getShootingSets,
  getDrillCompletions,
  getAchievements,
  setAchievements,
  getDailyChallengeCompletions,
  setDailyChallengeCompleted,
  createBackupSnapshot,
} from "../storage/storage";
import { ShotSpot, ChecklistDrill, TimeOfDay, PracticeSession, TrainingSession, TrainingSessionType, SessionTimeSlot, SessionType } from "../models/types";
import { DEFAULT_SCHEDULES } from "../models/constants";
import { getTodayDateString, formatDate, safeFormatDateToYYYYMMDD } from "../utils/dates";
import { calculateSessionXp } from "../utils/xp";
import { calculateStreak, reconcileStreak } from "../utils/streaks";
import { calculateLevel, getRankForLevel } from "../utils/xp";
import { getDayType, isSchoolHoliday, getScheduleLabel } from "../utils/holidays";
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
import { XP_CONSTANTS } from "../models/constants";
import { useRankUpContext } from "../context/RankUpContext";

export const LogWorkoutScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const { checkRankAndLevel } = useRankUpContext();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [shotSpots, setShotSpots] = useState<ShotSpot[]>([]);
  const [shootingData, setShootingData] = useState<
    Record<string, { makes: number; attempts: number }>
  >({});
  const [drills, setDrills] = useState<ChecklistDrill[]>([]);
  const [drillCompletions, setDrillCompletions] = useState<
    Record<string, boolean>
  >({});
  const [freeThrows, setFreeThrows] = useState<{ makes: number; attempts: number }>({
    makes: 0,
    attempts: 0,
  });
  const [swishEverythingLevel, setSwishEverythingLevel] = useState<string>("");
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULES.school);
  const [dayTypeLabel, setDayTypeLabel] = useState<string>("");
  const [existingSessionIds, setExistingSessionIds] = useState<string[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<Record<TrainingSessionType, { completed: boolean; notes: string }>>({
    gym: { completed: false, notes: "" },
    vertical_jump: { completed: false, notes: "" },
  });

  useEffect(() => {
    loadData();
  }, [selectedDate]);
  
  // Reload session-specific data when time slot changes
  useEffect(() => {
    if (selectedTimeSlot && selectedDate) {
      // Reload only session-specific data, not the full form
      const loadSessionData = async () => {
        const practiceDay = await getPracticeDay(selectedDate);
        const existingSessions = practiceDay?.sessions || [];
        const existingSessionForSlot = existingSessions.find((s) => s.timeSlotId === selectedTimeSlot);
        
        // Get current shotSpots and drills to avoid stale closures
        const [currentSpots, currentDrills] = await Promise.all([
          getShotSpots(),
          getDrills(),
        ]);
        const activeSpots = currentSpots.filter((s) => s.isActive);
        const activeDrills = currentDrills.filter((d) => d.isActive);
        
        if (existingSessionForSlot) {
          // Load shooting sets for this session
          const existingShootingSets = await getShootingSetsByDate(selectedDate);
          const sessionSetIds = existingSessionForSlot.shootingSets || [];
          const sessionSets = existingShootingSets.filter((s) => sessionSetIds.includes(s.id));
          
          const updatedShooting: Record<string, { makes: number; attempts: number }> = {};
          activeSpots.forEach((spot) => {
            const setsForSpot = sessionSets.filter((s) => s.spotId === spot.id);
            const totalMakes = setsForSpot.reduce((sum, s) => sum + s.makes, 0);
            const totalAttempts = setsForSpot.reduce((sum, s) => sum + s.attempts, 0);
            updatedShooting[spot.id] = { makes: totalMakes, attempts: totalAttempts };
          });
          setShootingData(updatedShooting);
          
          // Load drill completions for this session
          const existingDrillCompletions = await getDrillCompletionsByDate(selectedDate);
          const sessionCompletionIds = existingSessionForSlot.drillCompletions || [];
          const sessionCompletions = existingDrillCompletions.filter((dc) => 
            sessionCompletionIds.includes(dc.id)
          );
          
          const updatedDrills: Record<string, boolean> = {};
          activeDrills.forEach((drill) => {
            const hasCompletion = sessionCompletions.some(
              (dc) => dc.drillId === drill.id && dc.completed
            );
            updatedDrills[drill.id] = hasCompletion;
          });
          setDrillCompletions(updatedDrills);
        } else {
          // New session - clear data
          const emptyShooting: Record<string, { makes: number; attempts: number }> = {};
          activeSpots.forEach((spot) => {
            emptyShooting[spot.id] = { makes: 0, attempts: 0 };
          });
          setShootingData(emptyShooting);
          
          const emptyDrills: Record<string, boolean> = {};
          activeDrills.forEach((drill) => {
            emptyDrills[drill.id] = false;
          });
          setDrillCompletions(emptyDrills);
        }
      };
      
      loadSessionData();
    }
  }, [selectedTimeSlot, selectedDate]);

  const loadData = async () => {
    const [spots, drillList, profile, practiceDay] = await Promise.all([
      getShotSpots(),
      getDrills(),
      getUserProfile(),
      getPracticeDay(selectedDate),
    ]);

    setShotSpots(spots.filter((s) => s.isActive));
    setDrills(drillList.filter((d) => d.isActive));

    // Determine schedule based on day type
    const dayType = getDayType(
      selectedDate,
      practiceDay?.isFamilyHoliday || false,
      practiceDay?.isRestDay || false
    );

    let daySchedule = DEFAULT_SCHEDULES[dayType];
    
    // Handle family holiday custom schedule
    if (dayType === "family_holiday" && profile?.familyHolidaySchedule === "custom" && profile?.familyHolidayCustomSlots) {
      daySchedule = {
        type: "family_holiday",
        timeSlots: profile.familyHolidayCustomSlots.map((slot: any, index: number) => ({
          id: `family_holiday_${index}`,
          name: index === 0 ? "Morning" : "Afternoon",
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      };
    } else if (dayType === "family_holiday" && profile?.familyHolidaySchedule === "no_scheduled") {
      daySchedule = {
        type: "family_holiday",
        timeSlots: [],
      };
    }
    
    setSchedule(daySchedule);
    setDayTypeLabel(getScheduleLabel(dayType, profile?.familyHolidaySchedule, profile?.familyHolidayCustomSlots));

    // Load existing data for this date
    const existingShootingSets = await getShootingSetsByDate(selectedDate);
    const existingDrillCompletions = await getDrillCompletionsByDate(selectedDate);
    const existingSessions = practiceDay?.sessions || [];

    // Find existing session for selected time slot (if editing)
    // If no time slot selected yet, we'll load data when one is selected
    const existingSessionForSlot = selectedTimeSlot
      ? existingSessions.find((s) => s.timeSlotId === selectedTimeSlot)
      : null;

    // Initialize shooting data from existing sets for THIS time slot only
    const initialShooting: Record<string, { makes: number; attempts: number }> = {};
    if (existingSessionForSlot) {
      // Load data from the session's shooting sets
      const sessionSetIds = existingSessionForSlot.shootingSets || [];
      const sessionSets = existingShootingSets.filter((s) => sessionSetIds.includes(s.id));
      
      spots.forEach((spot) => {
        const setsForSpot = sessionSets.filter((s) => s.spotId === spot.id);
        const totalMakes = setsForSpot.reduce((sum, s) => sum + s.makes, 0);
        const totalAttempts = setsForSpot.reduce((sum, s) => sum + s.attempts, 0);
        initialShooting[spot.id] = { makes: totalMakes, attempts: totalAttempts };
      });
    } else {
      // New session - start with empty data
      spots.forEach((spot) => {
        initialShooting[spot.id] = { makes: 0, attempts: 0 };
      });
    }
    setShootingData(initialShooting);

    // Load existing free throw data (day-level, not session-specific)
    // For now, we'll show the day's free throws. In future, might want per-session
    if (practiceDay?.freeThrows) {
      setFreeThrows(practiceDay.freeThrows);
    } else {
      setFreeThrows({ makes: 0, attempts: 0 });
    }
    setSwishEverythingLevel(
      practiceDay?.swishEverythingLevel !== undefined
        ? String(practiceDay.swishEverythingLevel)
        : ""
    );

    // Initialize drill completions from existing data for THIS time slot only
    const initialDrills: Record<string, boolean> = {};
    if (existingSessionForSlot) {
      const sessionCompletionIds = existingSessionForSlot.drillCompletions || [];
      const sessionCompletions = existingDrillCompletions.filter((dc) => 
        sessionCompletionIds.includes(dc.id)
      );
      
      drillList.forEach((drill) => {
        const hasCompletion = sessionCompletions.some(
          (dc) => dc.drillId === drill.id && dc.completed
        );
        initialDrills[drill.id] = hasCompletion;
      });
    } else {
      // New session - start with empty completions
      drillList.forEach((drill) => {
        initialDrills[drill.id] = false;
      });
    }
    setDrillCompletions(initialDrills);

    // Initialize training sessions from existing data for THIS time slot
    // Training sessions are day-level, but we check if they're associated with this session
    const existingTrainingSessions = practiceDay?.trainingSessions || [];
    const initialTrainingSessions: Record<TrainingSessionType, { completed: boolean; notes: string }> = {
      gym: { completed: false, notes: "" },
      vertical_jump: { completed: false, notes: "" },
    };
    
    if (existingSessionForSlot?.trainingSessions) {
      // Load training sessions associated with this session
      existingSessionForSlot.trainingSessions.forEach((tsId) => {
        const ts = existingTrainingSessions.find((t) => t.id === tsId);
        if (ts && (ts.type === "gym" || ts.type === "vertical_jump")) {
          initialTrainingSessions[ts.type] = {
            completed: ts.completed,
            notes: ts.notes || "",
          };
        }
      });
    }
    setTrainingSessions(initialTrainingSessions);

    // Store existing session IDs for potential deletion/update
    setExistingSessionIds(existingSessions.map((s) => s.id));

    // Load data for the selected time slot (or first available)
    // If a time slot is already selected, load its data
    // Otherwise, auto-select first time slot if only one exists
    if (selectedTimeSlot) {
      // Load existing session data for selected time slot
      const existingSessionForSlot = existingSessions.find((s) => s.timeSlotId === selectedTimeSlot);
      if (existingSessionForSlot) {
        // Load shooting data, drill completions, etc. for this session
        // This will be handled in the existing data loading logic below
      }
    } else if (daySchedule.timeSlots.length === 1 && existingSessions.length === 0) {
      setSelectedTimeSlot(daySchedule.timeSlots[0].id);
    } else if (existingSessions.length > 0) {
      // If editing existing day, select the first session's time slot
      setSelectedTimeSlot(existingSessions[0].timeSlotId);
    }
  };

  const parseDateKeyToPickerDate = (dateKey: string): Date => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey || "");
    if (!match) return new Date();
    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    const day = Number(match[3]);
    return new Date(year, monthIndex, day, 12, 0, 0);
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (event?.type === "dismissed") return;

    const nextDate = date || parseDateKeyToPickerDate(selectedDate);
    if (nextDate) {
      const dateString = safeFormatDateToYYYYMMDD(nextDate);
      setSelectedDate(dateString);
      setStep(1); // Reset to step 1 when date changes
      setSelectedTimeSlot(null);
    }
  };

  const handleSave = async () => {
    if (!selectedTimeSlot) {
      Alert.alert("Error", "Please select a time slot");
      return;
    }

    try {
      // Validate selectedDate is valid
      if (!selectedDate || typeof selectedDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
        const error = new Error(`Invalid date format: ${selectedDate}`);
        console.error("SAVE_WORKOUT_ERROR", error);
        Alert.alert("Error", `Failed to save workout: Invalid date format`);
        return;
      }

      const timeOfDay: TimeOfDay = selectedTimeSlot.includes("morning")
        ? "morning"
        : selectedTimeSlot.includes("afternoon")
        ? "afternoon"
        : "other";
      
      // Determine session time slot type
      const sessionTimeSlot: SessionTimeSlot = selectedTimeSlot.includes("morning")
        ? "morning"
        : selectedTimeSlot.includes("afternoon") || selectedTimeSlot.includes("evening")
        ? "evening"
        : "custom";

      // Determine session type based on what's being logged
      const hasShooting = Object.values(shootingData).some((d) => d.attempts > 0) || freeThrows.attempts > 0;
      const hasDrills = Object.values(drillCompletions).some((c) => c);
      const hasTraining = trainingSessions.gym.completed || trainingSessions.vertical_jump.completed;
      
      let sessionType: SessionType = "shooting";
      if (hasTraining && !hasShooting && !hasDrills) {
        sessionType = trainingSessions.gym.completed ? "gym" : "vertical";
      } else if (hasDrills && !hasShooting && !hasTraining) {
        sessionType = "drill";
      } else if (hasShooting || hasDrills || hasTraining) {
        sessionType = "mixed";
      }

      // Get existing practice day
      const profile = await getUserProfile();
      let practiceDay = await getPracticeDay(selectedDate);
      if (!practiceDay) {
        practiceDay = {
          date: selectedDate,
          isRestDay: false,
          isSchoolHoliday: isSchoolHoliday(selectedDate),
          isFamilyHoliday: profile?.familyHolidayDates?.includes(selectedDate) || false,
          sessions: [],
        };
      }

      // Find existing session for this time slot (if editing)
      const existingSessionForSlot = practiceDay.sessions.find(
        (s) => s.timeSlotId === selectedTimeSlot || 
               (s.timeSlot === sessionTimeSlot && s.date === selectedDate)
      );
      
      // Get existing shooting sets and drill completions for THIS time slot only
      const existingSets = await getShootingSetsByDate(selectedDate);
      const existingCompletions = await getDrillCompletionsByDate(selectedDate);
      const allSets = await getShootingSets();
      const allCompletions = await getDrillCompletions();

      // Remove old sets and completions for THIS time slot only
      // (Keep sets/completions from other time slots)
      const existingSessionSetIds = existingSessionForSlot?.shootingSets || [];
      const existingSessionCompletionIds = existingSessionForSlot?.drillCompletions || [];
      
      const updatedSets = allSets.filter((s) => !existingSessionSetIds.includes(s.id));
      const updatedCompletions = allCompletions.filter((c) => !existingSessionCompletionIds.includes(c.id));

      // Validate arrays before saving
      if (!Array.isArray(updatedSets)) {
        const error = new Error(`updatedSets is not an array: ${typeof updatedSets}`);
        console.error("SAVE_WORKOUT_ERROR", error);
        Alert.alert("Error", `Failed to save workout: Invalid shooting sets array`);
        return;
      }
      if (!Array.isArray(updatedCompletions)) {
        const error = new Error(`updatedCompletions is not an array: ${typeof updatedCompletions}`);
        console.error("SAVE_WORKOUT_ERROR", error);
        Alert.alert("Error", `Failed to save workout: Invalid drill completions array`);
        return;
      }

      // Save updated arrays using AsyncStorage directly
      try {
        const AsyncStorage = await import("@react-native-async-storage/async-storage");
        
        // Test JSON.stringify before saving
        const setsJson = JSON.stringify(updatedSets);
        const completionsJson = JSON.stringify(updatedCompletions);
        
        await AsyncStorage.default.setItem(
          "@bucket_tracker:shooting_sets",
          setsJson
        );
        await AsyncStorage.default.setItem(
          "@bucket_tracker:drill_completions",
          completionsJson
        );
      } catch (storageError) {
        console.error("SAVE_WORKOUT_ERROR", storageError);
        const errorMessage = storageError instanceof Error ? storageError.message : String(storageError);
        Alert.alert("Error", `Failed to save workout: Error saving sets/completions - ${errorMessage}`);
        return;
      }

      // Create new shooting sets
      const shootingSetIds: string[] = [];
      const baseTimestamp = Date.now();
      let index = 0;
      for (const [spotId, data] of Object.entries(shootingData)) {
        if (data.attempts > 0) {
          const setId = `set_${baseTimestamp}_${index}_${spotId}`;
          await addShootingSet({
            id: setId,
            date: selectedDate,
            timeOfDay,
            spotId,
            makes: data.makes,
            attempts: data.attempts,
          });
          shootingSetIds.push(setId);
          index++;
        }
      }

      // Create drill completions
      const drillCompletionIds: string[] = [];
      for (const [drillId, completed] of Object.entries(drillCompletions)) {
        if (completed) {
          const completionId = `completion_${Date.now()}_${drillId}`;
          await addDrillCompletion({
            id: completionId,
            drillId,
            date: selectedDate,
            timeOfDay,
            completed: true,
          });
          drillCompletionIds.push(completionId);
        }
      }

      // Create or update session for this time slot
      const sessionId = existingSessionForSlot?.id || `session_${Date.now()}_${selectedTimeSlot}`;
      
      // Validate session object before saving
      if (!sessionId || typeof sessionId !== "string") {
        const error = new Error(`Invalid session ID: ${sessionId}`);
        console.error("SAVE_WORKOUT_ERROR", error);
        Alert.alert("Error", `Failed to save workout: Invalid session ID`);
        return;
      }
      if (!selectedDate || typeof selectedDate !== "string") {
        const error = new Error(`Invalid date: ${selectedDate}`);
        console.error("SAVE_WORKOUT_ERROR", error);
        Alert.alert("Error", `Failed to save workout: Invalid date`);
        return;
      }
      if (!sessionTimeSlot || !["morning", "evening", "custom"].includes(sessionTimeSlot)) {
        const error = new Error(`Invalid timeSlot: ${sessionTimeSlot}`);
        console.error("SAVE_WORKOUT_ERROR", error);
        Alert.alert("Error", `Failed to save workout: Invalid time slot`);
        return;
      }
      if (!sessionType || !["shooting", "gym", "vertical", "drill", "mixed"].includes(sessionType)) {
        const error = new Error(`Invalid session type: ${sessionType}`);
        console.error("SAVE_WORKOUT_ERROR", error);
        Alert.alert("Error", `Failed to save workout: Invalid session type`);
        return;
      }
      
      const newSession: PracticeSession = {
        id: sessionId,
        date: selectedDate,
        timeSlot: sessionTimeSlot,
        timeSlotId: selectedTimeSlot,
        type: sessionType,
        shootingSets: shootingSetIds,
        drillCompletions: drillCompletionIds,
      };

      // Save training sessions for this session
      const trainingSessionList: TrainingSession[] = [];
      if (trainingSessions.gym.completed) {
        trainingSessionList.push({
          id: `training_${Date.now()}_gym`,
          date: selectedDate,
          type: "gym",
          completed: true,
          notes: trainingSessions.gym.notes.trim() || undefined,
          durationMinutes: 60,
        });
      }
      if (trainingSessions.vertical_jump.completed) {
        trainingSessionList.push({
          id: `training_${Date.now()}_vertical_jump`,
          date: selectedDate,
          type: "vertical_jump",
          completed: true,
          notes: trainingSessions.vertical_jump.notes.trim() || undefined,
          durationMinutes: 10,
        });
      }
      if (trainingSessionList.length > 0) {
        // Store training session IDs in the practice session
        // Note: Training sessions are stored in practiceDay.trainingSessions, but we also track them in the session
        newSession.trainingSessions = trainingSessionList.map((ts) => ts.id);
      }

      // Ensure sessions array exists
      if (!Array.isArray(practiceDay.sessions)) {
        practiceDay.sessions = [];
      }
      
      // Append or update session (don't replace all sessions)
      if (existingSessionForSlot) {
        // Update existing session
        const sessionIndex = practiceDay.sessions.findIndex((s) => s.id === sessionId);
        if (sessionIndex >= 0) {
          practiceDay.sessions[sessionIndex] = newSession;
        } else {
          // Session ID exists but not found in array - append it
          console.warn(`Session ${sessionId} not found in array, appending`);
          practiceDay.sessions.push(newSession);
        }
      } else {
        // Append new session
        practiceDay.sessions.push(newSession);
      }
      
      // Validate sessions array after update
      if (!Array.isArray(practiceDay.sessions)) {
        const error = new Error(`practiceDay.sessions is not an array after update`);
        console.error("SAVE_WORKOUT_ERROR", error);
        Alert.alert("Error", `Failed to save workout: Sessions array corrupted`);
        return;
      }
      
      // Save free throw data (aggregate across all sessions for the day)
      // Free throws are stored at the day level, not per session
      const existingFreeThrows = practiceDay.freeThrows || { makes: 0, attempts: 0 };
      // For now, we'll update free throws if this session has them
      // In the future, we might want to aggregate across sessions
      if (freeThrows.makes > 0 || freeThrows.attempts > 0) {
        practiceDay.freeThrows = freeThrows;
      } else if (!practiceDay.freeThrows) {
        practiceDay.freeThrows = undefined;
      }

      // Save Swish Everything score (highest level reached, 0-10)
      const parsedSwishLevel = parseInt(swishEverythingLevel, 10);
      if (!isNaN(parsedSwishLevel)) {
        practiceDay.swishEverythingLevel = Math.max(0, Math.min(10, parsedSwishLevel));
      } else {
        practiceDay.swishEverythingLevel = undefined;
      }

      // Save training sessions to practiceDay (aggregate across all sessions)
      const existingTrainingSessions = practiceDay.trainingSessions || [];
      const newTrainingSessions = [...existingTrainingSessions];
      
      // Remove training sessions that were in the old session but are now unchecked
      if (existingSessionForSlot?.trainingSessions) {
        existingSessionForSlot.trainingSessions.forEach((tsId) => {
          const ts = existingTrainingSessions.find((t) => t.id === tsId);
          if (ts) {
            // Check if this training session should still exist
            const shouldKeep = (ts.type === "gym" && trainingSessions.gym.completed) ||
                              (ts.type === "vertical_jump" && trainingSessions.vertical_jump.completed);
            if (!shouldKeep) {
              const index = newTrainingSessions.findIndex((t) => t.id === tsId);
              if (index >= 0) {
                newTrainingSessions.splice(index, 1);
              }
            }
          }
        });
      }
      
      // Add new training sessions
      trainingSessionList.forEach((ts) => {
        const exists = newTrainingSessions.some((t) => t.id === ts.id || (t.type === ts.type && t.date === ts.date));
        if (!exists) {
          newTrainingSessions.push(ts);
        }
      });
      
      practiceDay.trainingSessions = newTrainingSessions.length > 0 ? newTrainingSessions : undefined;
      
      // Validate practiceDay before saving
      if (!practiceDay.date || typeof practiceDay.date !== "string") {
        const error = new Error(`Invalid practiceDay.date: ${practiceDay.date}`);
        console.error("SAVE_WORKOUT_ERROR", error);
        Alert.alert("Error", `Failed to save workout: Invalid practice day date`);
        return;
      }
      if (!Array.isArray(practiceDay.sessions)) {
        const error = new Error(`practiceDay.sessions is not an array: ${typeof practiceDay.sessions}`);
        console.error("SAVE_WORKOUT_ERROR", error);
        Alert.alert("Error", `Failed to save workout: Invalid sessions array`);
        return;
      }
      
      // Validate that the session we're adding/updating is valid
      const sessionToSave = practiceDay.sessions.find((s) => s.id === sessionId);
      if (sessionToSave) {
        if (!sessionToSave.id || !sessionToSave.date || !sessionToSave.timeSlot || !sessionToSave.type) {
          const error = new Error(`Session missing required fields: ${JSON.stringify(sessionToSave)}`);
          console.error("SAVE_WORKOUT_ERROR", error);
          Alert.alert("Error", `Failed to save workout: Session missing required fields`);
          return;
        }
      }
      
      try {
        await savePracticeDay(practiceDay);
      } catch (saveError) {
        console.error("SAVE_WORKOUT_ERROR", saveError);
        const errorMessage = saveError instanceof Error ? saveError.message : String(saveError);
        Alert.alert("Error", `Failed to save workout: ${errorMessage}`);
        return;
      }

      // Recalculate XP from all shooting sets and drill completions
      // (since editing past dates affects totals)
      const gamState = await getGamificationState();
      const allShootingSetsForXp = await getShootingSets();
      const allDrillCompletionsForXp = await getDrillCompletions();
      
      // Group sessions by date for session bonuses
      // Each session gets a bonus, but we count unique dates for daily bonuses
      const datesWithSessions = new Set<string>();
      const allPracticeDaysForXp = await getPracticeDays();
      
      // Count sessions per date
      allPracticeDaysForXp.forEach((day) => {
        if (day.sessions && day.sessions.length > 0) {
          datesWithSessions.add(day.date);
        }
      });
      
      // Calculate XP: shooting sets + free throws + drill completions + training sessions + session bonuses
      let totalXp = 0;
      
      // XP from shooting sets (across all sessions)
      allShootingSetsForXp.forEach((set) => {
        totalXp += set.makes * 2 + set.attempts * 0.2;
      });
      
      // XP from free throws (same formula as shooting sets)
      allPracticeDaysForXp.forEach((day) => {
        if (day.freeThrows) {
          totalXp += day.freeThrows.makes * 2 + day.freeThrows.attempts * 0.2;
        }
      });
      
      // XP from drill completions (across all sessions)
      const completedDrills = allDrillCompletionsForXp.filter((d) => d.completed);
      totalXp += completedDrills.length * 20; // 20 XP per drill

      // XP from training sessions (gym and vertical jump)
      allPracticeDaysForXp.forEach((day) => {
        if (day.trainingSessions && day.trainingSessions.length > 0) {
          day.trainingSessions.forEach((ts) => {
            if (ts.completed) {
              if (ts.type === "gym") {
                totalXp += 100; // Gym session XP
              } else if (ts.type === "vertical_jump") {
                totalXp += 30; // Vertical jump XP
              }
            }
          });
        }
      });

      // Session bonuses: one per session (not per day)
      // Count total sessions across all days
      let totalSessionCount = 0;
      allPracticeDaysForXp.forEach((day) => {
        if (day.sessions && day.sessions.length > 0) {
          totalSessionCount += day.sessions.length;
        }
      });
      totalXp += totalSessionCount * 50; // 50 XP per session

      const newLevel = calculateLevel(totalXp);
      const newRankDef = getRankForLevel(newLevel);
      const newRank = newRankDef.name;
      const oldLevel = gamState.level;
      const xpEarned = totalXp - gamState.totalXp;

      // Award currency for workout completion
      const currencyEarned = await awardWorkoutCurrency();
      
      // Check for level up and award currency
      const levelUpCurrency = await checkLevelUpReward(oldLevel, newLevel);
      
      // Get updated currency after rewards
      const updatedGamState = await getGamificationState();

      // Check for achievements
      const allShootingSetsForAchievements = await getShootingSets();
      const allPracticeDaysForAchievements = await getPracticeDays();
      const allDrillCompletionsForAchievements = await getDrillCompletions();
      const storedAchievements = await getAchievements();

      const achievementData = {
        shootingSets: allShootingSetsForAchievements,
        practiceDays: allPracticeDaysForAchievements,
        drillCompletions: allDrillCompletionsForAchievements,
        gamification: updatedGamState,
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

      // Daily challenge: check and award for the date we just logged
      let totalXpWithBonus = totalXp;
      let currencyWithBonus = updatedGamState.currency;
      let dailyChallengeMessage = "";
      const challenge = getTodaysChallenge(selectedDate);
      const completedDates = await getDailyChallengeCompletions();
      if (!completedDates.includes(selectedDate)) {
        const checkData: DailyChallengeCheckData = {
          date: selectedDate,
          practiceDays: allPracticeDaysForAchievements.map((d) => ({
            date: d.date,
            sessions: d.sessions || [],
            freeThrows: d.freeThrows,
          })),
          drillCompletions: allDrillCompletionsForAchievements.map((dc) => ({
            date: dc.date,
            drillId: dc.drillId,
            completed: dc.completed,
          })),
          shootingSets: allShootingSetsForAchievements.map((s) => ({
            date: s.date,
            makes: s.makes,
            attempts: s.attempts,
          })),
        };
        if (checkDailyChallengeComplete(challenge.id, checkData)) {
          await setDailyChallengeCompleted(selectedDate);
          totalXpWithBonus += challenge.xpBonus;
          currencyWithBonus += challenge.vcBonus;
          dailyChallengeMessage = `\n\n⭐ Daily: ${challenge.name}! +${challenge.xpBonus} XP, +${challenge.vcBonus} VC`;
        }
      }

      // Update streaks using reconciliation (safe, atomic update)
      const nowISO = new Date().toISOString();
      const currentGamState = await getGamificationState();
      const reconciled = reconcileStreak({
        streakCount: currentGamState.currentStreakDays,
        lastCompletionISO: currentGamState.lastCompletionISO,
        nowISO,
      });

      // Streak multiplier (10% bonus when streak >= 3), applied to base session XP
      const baseSessionXp = Math.max(0, totalXp - gamState.totalXp);
      const streakBonusXp =
        reconciled.streakCount >= 3
          ? Math.floor(baseSessionXp * (XP_CONSTANTS.STREAK_BONUS_MULTIPLIER - 1))
          : 0;
      totalXpWithBonus += streakBonusXp;
      const streakMsg = streakBonusXp > 0 ? `\n🔥 1.1x Streak bonus! +${streakBonusXp} XP` : "";

      const newLevelFinal = calculateLevel(totalXpWithBonus);
      const newRankDefFinal = getRankForLevel(newLevelFinal);
      const newRankFinal = newRankDefFinal.name;

      // Also calculate from practice days for best streak (complex logic with rest days/holidays)
      const practiceDaysForStreak = await getPracticeDays();
      const allShootingSetsForStreak = await getShootingSets();
      const profileForStreak = await getUserProfile();
      const streakInfo = calculateStreak(
        practiceDaysForStreak,
        getTodayDateString(),
        allShootingSetsForStreak,
        profileForStreak?.familyHolidayDates || []
      );

      // Use calculateStreak for current streak (rest days don't reset; only missed days break)
      await setGamificationState({
        totalXp: totalXpWithBonus,
        level: newLevelFinal,
        rank: newRankFinal,
        currentStreakDays: streakInfo.current,
        bestStreakDays: Math.max(gamState.bestStreakDays, streakInfo.best),
        currency: currencyWithBonus,
        lastCompletionISO: nowISO,
      });
      
      // Trigger rank/level up check after XP update
      setTimeout(() => {
        checkRankAndLevel();
      }, 300);

      if (profile?.autoSaveResults !== false) {
        await createBackupSnapshot();
      }

      const xpEarnedDisplay = totalXpWithBonus - gamState.totalXp;
      Alert.alert(
        "Workout Logged!",
        `XP updated! ${xpEarnedDisplay >= 0 ? `+${xpEarnedDisplay}` : xpEarnedDisplay} XP${streakMsg}\n+${currencyEarned} VC${levelUpCurrency > 0 ? `\n+${levelUpCurrency} VC (Level Up!)` : ""}${achievementMessage}${dailyChallengeMessage}`,
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form and go back
              setStep(1);
              setSelectedDate(getTodayDateString());
              setSelectedTimeSlot(null);
              loadData();
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error("SAVE_WORKOUT_ERROR", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error("SAVE_WORKOUT_ERROR_STACK", errorStack);
      Alert.alert(
        "Error", 
        `Failed to save workout: ${errorMessage}${errorStack ? `\n\nDebug: ${errorStack.substring(0, 200)}` : ""}`
      );
    }
  };

  const renderStep1 = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Step 1: Select Date</Text>
      <TouchableOpacity
        style={styles.dateSelector}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.7}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="calendar" size={20} color="#39FF14" />
        <Text style={styles.selectedDate}>{formatDate(selectedDate)}</Text>
        <Ionicons name="chevron-down" size={20} color="#8E8E93" />
      </TouchableOpacity>
      <Text style={styles.dayTypeLabel}>{dayTypeLabel}</Text>
      {showDatePicker && (
        <DateTimePicker
          value={parseDateKeyToPickerDate(selectedDate)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
      {Platform.OS === "ios" && showDatePicker && (
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(false)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.datePickerButtonText}>Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Step 2: Select Time Slot</Text>
      {schedule.timeSlots.length === 0 ? (
        <Text style={styles.noSlotsText}>
          No scheduled sessions for this day. You can still log optional workouts.
        </Text>
      ) : (
        schedule.timeSlots.map((slot) => (
          <TouchableOpacity
            key={slot.id}
            style={[
              styles.timeSlotButton,
              selectedTimeSlot === slot.id && styles.timeSlotButtonSelected,
            ]}
            onPress={() => setSelectedTimeSlot(slot.id)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={[
                styles.timeSlotText,
                selectedTimeSlot === slot.id && styles.timeSlotTextSelected,
              ]}
            >
              {slot.name}: {slot.startTime} - {slot.endTime}
            </Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Step 3: Log Shooting</Text>
      {shotSpots.map((spot) => (
        <SpotInputRow
          key={spot.id}
          spot={spot}
          makes={shootingData[spot.id]?.makes || 0}
          attempts={shootingData[spot.id]?.attempts || 0}
          onMakesChange={(makes) =>
            setShootingData({
              ...shootingData,
              [spot.id]: { ...shootingData[spot.id], makes },
            })
          }
          onAttemptsChange={(attempts) =>
            setShootingData({
              ...shootingData,
              [spot.id]: { ...shootingData[spot.id], attempts },
            })
          }
        />
      ))}
      
      {/* Free Throw Section */}
      <View style={styles.freeThrowSection}>
        <Text style={styles.freeThrowTitle}>Free Throws</Text>
        <SpotInputRow
          spot={{
            id: "free_throw",
            name: "Free Throw",
            type: "other",
            isActive: true,
          }}
          makes={freeThrows.makes}
          attempts={freeThrows.attempts}
          onMakesChange={(makes) =>
            setFreeThrows({ ...freeThrows, makes })
          }
          onAttemptsChange={(attempts) =>
            setFreeThrows({ ...freeThrows, attempts })
          }
        />
      </View>

      <View style={styles.swishSection}>
        <Text style={styles.swishTitle}>Swish Everything Score (Optional)</Text>
        <Text style={styles.swishSubtitle}>
          Enter your highest level reached (0-10) for the 30-minute Swish Everything workout.
        </Text>
        <TextInput
          style={styles.swishInput}
          value={swishEverythingLevel}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, "");
            if (cleaned === "") {
              setSwishEverythingLevel("");
              return;
            }
            const clamped = Math.max(0, Math.min(10, parseInt(cleaned, 10)));
            setSwishEverythingLevel(String(clamped));
          }}
          keyboardType="number-pad"
          placeholder="Highest level (0-10)"
          placeholderTextColor="#8E8E93"
          maxLength={2}
        />
      </View>
    </View>
  );

  const renderStep4 = () => {
    const drillsByCategory = drills.reduce(
      (acc, drill) => {
        if (!acc[drill.category]) {
          acc[drill.category] = [];
        }
        acc[drill.category].push(drill);
        return acc;
      },
      {} as Record<string, ChecklistDrill[]>
    );

    return (
      <View style={styles.step}>
        <Text style={styles.stepTitle}>Step 4: Log Drills</Text>
        {Object.entries(drillsByCategory).map(([category, categoryDrills]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            {categoryDrills.map((drill) => (
              <DrillChecklistItem
                key={drill.id}
                drill={drill}
                completed={drillCompletions[drill.id] || false}
                onToggle={(completed) =>
                  setDrillCompletions({
                    ...drillCompletions,
                    [drill.id]: completed,
                  })
                }
              />
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderStep5 = () => {
    return (
      <View style={styles.step}>
        <Text style={styles.stepTitle}>Step 5: Training Sessions</Text>
        <Text style={styles.stepSubtitle}>
          Mark completed training sessions (optional)
        </Text>

        {/* Gym Session */}
        <View style={styles.trainingSessionCard}>
          <View style={styles.trainingSessionHeader}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() =>
                setTrainingSessions({
                  ...trainingSessions,
                  gym: {
                    ...trainingSessions.gym,
                    completed: !trainingSessions.gym.completed,
                  },
                })
              }
              activeOpacity={0.7}
            >
              <Ionicons
                name={trainingSessions.gym.completed ? "checkbox" : "square-outline"}
                size={24}
                color={trainingSessions.gym.completed ? "#39FF14" : "#8E8E93"}
              />
            </TouchableOpacity>
            <View style={styles.trainingSessionInfo}>
              <Text style={styles.trainingSessionTitle}>Gym Session</Text>
              <Text style={styles.trainingSessionDuration}>60 minutes</Text>
              <Text style={styles.trainingSessionXp}>+100 XP</Text>
            </View>
          </View>
          {trainingSessions.gym.completed && (
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes (optional)..."
              placeholderTextColor="#8E8E93"
              value={trainingSessions.gym.notes}
              onChangeText={(text) =>
                setTrainingSessions({
                  ...trainingSessions,
                  gym: { ...trainingSessions.gym, notes: text },
                })
              }
              multiline
              numberOfLines={2}
            />
          )}
        </View>

        {/* Vertical Jump Training */}
        <View style={styles.trainingSessionCard}>
          <View style={styles.trainingSessionHeader}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() =>
                setTrainingSessions({
                  ...trainingSessions,
                  vertical_jump: {
                    ...trainingSessions.vertical_jump,
                    completed: !trainingSessions.vertical_jump.completed,
                  },
                })
              }
              activeOpacity={0.7}
            >
              <Ionicons
                name={trainingSessions.vertical_jump.completed ? "checkbox" : "square-outline"}
                size={24}
                color={trainingSessions.vertical_jump.completed ? "#39FF14" : "#8E8E93"}
              />
            </TouchableOpacity>
            <View style={styles.trainingSessionInfo}>
              <Text style={styles.trainingSessionTitle}>Vertical Jump Training</Text>
              <Text style={styles.trainingSessionDuration}>10 minutes</Text>
              <Text style={styles.trainingSessionXp}>+30 XP</Text>
            </View>
          </View>
          {trainingSessions.vertical_jump.completed && (
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes (optional)..."
              placeholderTextColor="#8E8E93"
              value={trainingSessions.vertical_jump.notes}
              onChangeText={(text) =>
                setTrainingSessions({
                  ...trainingSessions,
                  vertical_jump: { ...trainingSessions.vertical_jump, notes: text },
                })
              }
              multiline
              numberOfLines={2}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Log Workout</Text>
        <Text style={styles.stepIndicator}>
          Step {step} of 5
        </Text>
      </View>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}

      <View style={styles.navigation}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setStep(step - 1)}
            activeOpacity={0.7}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        {step < 5 ? (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={() => setStep(step + 1)}
            activeOpacity={0.7}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            <Text
              style={[styles.navButtonText, styles.navButtonTextPrimary]}
            >
              Next
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={handleSave}
            activeOpacity={0.7}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            <Text
              style={[styles.navButtonText, styles.navButtonTextPrimary]}
            >
              Save Workout
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
    paddingTop: 20,
    backgroundColor: "#0A0A0A",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  stepIndicator: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "600",
  },
  step: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginBottom: 12,
    gap: 12,
  },
  selectedDate: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  dayTypeLabel: {
    fontSize: 13,
    color: "#39FF14",
    fontWeight: "600",
    textAlign: "center",
  },
  datePickerButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#39FF14",
    borderRadius: 8,
    alignItems: "center",
  },
  datePickerButtonText: {
    color: "#0A0A0A",
    fontSize: 16,
    fontWeight: "700",
  },
  note: {
    fontSize: 12,
    color: "#8E8E93",
  },
  noSlotsText: {
    fontSize: 14,
    color: "#8E8E93",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
  },
  timeSlotButton: {
    padding: 18,
    minHeight: 52,
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  timeSlotButtonSelected: {
    borderColor: "#39FF14",
    backgroundColor: "#39FF1415",
  },
  timeSlotText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  timeSlotTextSelected: {
    color: "#39FF14",
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
    marginTop: 8,
    letterSpacing: -0.3,
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 20,
  },
  trainingSessionCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  trainingSessionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    padding: 4,
  },
  trainingSessionInfo: {
    flex: 1,
  },
  trainingSessionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  trainingSessionDuration: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  trainingSessionXp: {
    fontSize: 14,
    fontWeight: "600",
    color: "#39FF14",
  },
  notesInput: {
    marginTop: 12,
    backgroundColor: "#0A0A0A",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    minHeight: 60,
    textAlignVertical: "top",
  },
  freeThrowSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  freeThrowTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  swishSection: {
    marginTop: 16,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    padding: 14,
  },
  swishTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  swishSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#8E8E93",
    lineHeight: 18,
  },
  swishInput: {
    marginTop: 10,
    backgroundColor: "#0A0A0A",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: "#FFFFFF",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    fontWeight: "700",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    gap: 12,
    paddingBottom: 32,
  },
  navButton: {
    flex: 1,
    padding: 16,
    minHeight: 52,
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  navButtonPrimary: {
    backgroundColor: "#39FF14",
    borderColor: "#39FF14",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  navButtonTextPrimary: {
    color: "#0A0A0A",
  },
});
