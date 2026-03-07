// Drills screen with drill management and suggestions

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import {
  getDrills,
  addDrill,
  updateDrill,
  deleteDrill,
  addDrillCompletion,
  addPracticeSession,
  savePracticeDay,
  getPracticeDay,
  getUserProfile,
} from "../storage/storage";
import { ChecklistDrill, DrillCategory, TimeOfDay } from "../models/types";
import { DEFAULT_DRILLS } from "../models/constants";
import { getTodayDateString } from "../utils/dates";
import { isSchoolHoliday } from "../utils/holidays";

export const DrillsScreen: React.FC = () => {
  const [drills, setDrills] = useState<ChecklistDrill[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DrillCategory | "mixed">("mixed");
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [suggestedWorkout, setSuggestedWorkout] = useState<ChecklistDrill[]>([]);

  useEffect(() => {
    loadDrills();
  }, []);

  const loadDrills = async () => {
    const drillList = await getDrills();
    setDrills(drillList);
  };

  const drillsByCategory = drills.reduce(
    (acc, drill) => {
      if (!acc[drill.category]) {
        acc[drill.category] = [];
      }
      acc[drill.category].push(drill);
      return acc;
    },
    {} as Record<DrillCategory, ChecklistDrill[]>
  );

  const handleSuggestWorkout = () => {
    setShowSuggestModal(true);
  };

  const generateWorkout = () => {
    let availableDrills = [...drills.filter((d) => d.isActive)];

    // Filter by category if not mixed
    if (selectedCategory !== "mixed") {
      availableDrills = availableDrills.filter(
        (d) => d.category === selectedCategory
      );
    }

    // Shuffle and select drills that fit in time
    const shuffled = [...availableDrills].sort(() => Math.random() - 0.5);
    const selected: ChecklistDrill[] = [];
    let totalTime = 0;

    for (const drill of shuffled) {
      const duration = drill.defaultDurationMinutes || 15;
      if (totalTime + duration <= selectedDuration) {
        selected.push(drill);
        totalTime += duration;
      }
    }

    // If we didn't fill the time, add more drills
    if (selected.length === 0 && availableDrills.length > 0) {
      selected.push(availableDrills[0]);
    }

    setSuggestedWorkout(selected);
  };

  const handleCompleteWorkout = async () => {
    try {
      const today = getTodayDateString();
      const timeOfDay: TimeOfDay = "other";

      const completionIds: string[] = [];
      for (const drill of suggestedWorkout) {
        const completionId = `completion_${Date.now()}_${drill.id}`;
        await addDrillCompletion({
          id: completionId,
          drillId: drill.id,
          date: today,
          timeOfDay,
          completed: true,
        });
        completionIds.push(completionId);
      }

      const sessionId = `session_${Date.now()}`;
      await addPracticeSession({
        id: sessionId,
        date: today,
        timeSlot: "custom",
        timeSlotId: "other",
        type: "drill",
        shootingSets: [],
        drillCompletions: completionIds,
      });

      const userProfile = await getUserProfile();
      let practiceDay = await getPracticeDay(today);
      if (!practiceDay) {
        practiceDay = {
          date: today,
          isRestDay: false,
          isSchoolHoliday: isSchoolHoliday(today),
          isFamilyHoliday: userProfile?.familyHolidayDates?.includes(today) ?? false,
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
        drillCompletions: completionIds,
      });
      await savePracticeDay(practiceDay);

      Alert.alert("Workout Completed!", "Drills have been logged.");
      setShowSuggestModal(false);
      setSuggestedWorkout([]);
    } catch (error) {
      console.error("Error completing workout:", error);
      Alert.alert("Error", "Failed to log workout");
    }
  };

  const handleDeleteDrill = (drillId: string) => {
    Alert.alert(
      "Delete Drill",
      "Are you sure you want to delete this drill?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteDrill(drillId);
            await loadDrills();
          },
        },
      ]
    );
  };

  const categoryLabels: Record<DrillCategory | "mixed", string> = {
    finishing: "Finishing",
    floaters: "Floaters",
    ball_handling: "Ball Handling",
    other: "Other",
    mixed: "Mixed",
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Drills</Text>
        <TouchableOpacity
          style={styles.suggestButton}
          onPress={handleSuggestWorkout}
        >
          <Text style={styles.suggestButtonText}>Suggest Workout</Text>
        </TouchableOpacity>
      </View>

      {Object.entries(drillsByCategory).map(([category, categoryDrills]) => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>
            {categoryLabels[category as DrillCategory]}
          </Text>
          {categoryDrills.map((drill) => (
            <View key={drill.id} style={styles.drillItem}>
              <View style={styles.drillInfo}>
                <Text style={styles.drillName}>{drill.name}</Text>
                {drill.description && (
                  <Text style={styles.drillDescription}>
                    {drill.description}
                  </Text>
                )}
                {drill.defaultDurationMinutes && (
                  <Text style={styles.drillDuration}>
                    ~{drill.defaultDurationMinutes} min
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteDrill(drill.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}

      <Modal
        visible={showSuggestModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSuggestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Suggest Workout</Text>

            <Text style={styles.modalLabel}>Category</Text>
            <View style={styles.categorySelector}>
              {(["mixed", "finishing", "floaters", "ball_handling", "other"] as const).map(
                (cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      selectedCategory === cat && styles.categoryButtonActive,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selectedCategory === cat &&
                          styles.categoryButtonTextActive,
                      ]}
                    >
                      {categoryLabels[cat]}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <Text style={styles.modalLabel}>Time Available</Text>
            <View style={styles.durationSelector}>
              {[15, 30, 45, 60].map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    selectedDuration === duration &&
                      styles.durationButtonActive,
                  ]}
                  onPress={() => setSelectedDuration(duration)}
                >
                  <Text
                    style={[
                      styles.durationButtonText,
                      selectedDuration === duration &&
                        styles.durationButtonTextActive,
                    ]}
                  >
                    {duration} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateWorkout}
            >
              <Text style={styles.generateButtonText}>Generate Workout</Text>
            </TouchableOpacity>

            {suggestedWorkout.length > 0 && (
              <View style={styles.workoutList}>
                <Text style={styles.workoutTitle}>Suggested Workout:</Text>
                {suggestedWorkout.map((drill) => (
                  <View key={drill.id} style={styles.workoutItem}>
                    <Text style={styles.workoutItemName}>{drill.name}</Text>
                    {drill.defaultDurationMinutes && (
                      <Text style={styles.workoutItemDuration}>
                        {drill.defaultDurationMinutes} min
                      </Text>
                    )}
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={handleCompleteWorkout}
                >
                  <Text style={styles.completeButtonText}>
                    Mark as Completed
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => {
                setShowSuggestModal(false);
                setSuggestedWorkout([]);
              }}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  suggestButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  suggestButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  categorySection: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  drillItem: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  drillInfo: {
    flex: 1,
  },
  drillName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  drillDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  drillDuration: {
    fontSize: 12,
    color: "#999",
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f44336",
    borderRadius: 6,
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  categorySelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  categoryButtonActive: {
    backgroundColor: "#4CAF50",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  durationSelector: {
    flexDirection: "row",
    gap: 8,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  durationButtonActive: {
    backgroundColor: "#4CAF50",
  },
  durationButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  durationButtonTextActive: {
    color: "#fff",
  },
  generateButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  workoutList: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f0f8f0",
    borderRadius: 8,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  workoutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  workoutItemName: {
    fontSize: 16,
    color: "#333",
  },
  workoutItemDuration: {
    fontSize: 14,
    color: "#666",
  },
  completeButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  closeModalButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
  },
  closeModalButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
});
