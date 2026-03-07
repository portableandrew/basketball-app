// Step Runner Component - Guides user through workout steps with timer

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WorkoutDetail, WorkoutStep } from "../models/workoutDetails";

interface StepRunnerProps {
  workoutDetail: WorkoutDetail;
  onComplete: () => void;
  onCancel: () => void;
}

export const StepRunner: React.FC<StepRunnerProps> = ({
  workoutDetail,
  onComplete,
  onCancel,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = workoutDetail.steps[currentStepIndex];
  const isLastStep = currentStepIndex === workoutDetail.steps.length - 1;

  // Initialize timer if step has duration
  useEffect(() => {
    if (currentStep.durationSeconds) {
      setTimeRemaining(currentStep.durationSeconds);
      setIsRunning(false);
    } else {
      setTimeRemaining(null);
      setIsRunning(false);
    }

    // Cleanup interval on step change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentStepIndex, currentStep.durationSeconds]);

  // Timer countdown
  useEffect(() => {
    if (isRunning && timeRemaining !== null && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeRemaining]);

  const handleNext = () => {
    if (isLastStep) {
      // Workout complete - return to detail screen
      // The detail screen will handle navigation back
      onComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const toggleTimer = () => {
    if (timeRemaining !== null) {
      setIsRunning((prev) => !prev);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{workoutDetail.title}</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepIndicatorText}>
            Step {currentStepIndex + 1} of {workoutDetail.steps.length}
          </Text>
        </View>
      </View>

      {/* Current Step */}
      <View style={styles.stepContainer}>
        <View style={styles.stepNumberCircle}>
          <Text style={styles.stepNumberText}>{currentStep.stepNumber}</Text>
        </View>

        <Text style={styles.stepTitle}>{currentStep.title}</Text>
        <Text style={styles.stepDescription}>{currentStep.description}</Text>

        {/* Step Details */}
        <View style={styles.stepDetails}>
          {currentStep.sets && currentStep.reps && (
            <View style={styles.detailBadge}>
              <Ionicons name="repeat" size={18} color="#39FF14" />
              <Text style={styles.detailText}>
                {currentStep.sets} sets × {currentStep.reps} reps
              </Text>
            </View>
          )}
          {currentStep.restSeconds && currentStep.restSeconds > 0 && (
            <View style={styles.detailBadge}>
              <Ionicons name="pause-circle-outline" size={18} color="#39FF14" />
              <Text style={styles.detailText}>{currentStep.restSeconds}s rest</Text>
            </View>
          )}
        </View>

        {/* Timer (if applicable) */}
        {timeRemaining !== null && (
          <View style={styles.timerContainer}>
            <TouchableOpacity
              style={styles.timerButton}
              onPress={toggleTimer}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isRunning ? "pause" : "play"}
                size={32}
                color="#39FF14"
              />
            </TouchableOpacity>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            {timeRemaining === 0 && (
              <Text style={styles.timerComplete}>Time's up! Move to next step.</Text>
            )}
          </View>
        )}
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentStepIndex === 0 && styles.navButtonDisabled]}
          onPress={handleBack}
          disabled={currentStepIndex === 0}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentStepIndex === 0 ? "#4A4A4A" : "#FFFFFF"}
          />
          <Text
            style={[
              styles.navButtonText,
              currentStepIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.completeButtonText}>
            {isLastStep ? "Complete" : "Next"}
          </Text>
          <Ionicons
            name={isLastStep ? "checkmark-circle" : "chevron-forward"}
            size={24}
            color="#0A0A0A"
          />
        </TouchableOpacity>
      </View>
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: "#39FF1420",
  },
  cancelButton: {
    alignSelf: "flex-end",
    padding: 4,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  stepIndicator: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#39FF1415",
  },
  stepIndicatorText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#39FF14",
  },
  stepContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#39FF14",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  stepNumberText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#0A0A0A",
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: "#E0E0E0",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  stepDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 32,
  },
  detailBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#39FF1440",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#39FF14",
  },
  timerContainer: {
    alignItems: "center",
    marginTop: 32,
  },
  timerButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#39FF14",
    marginBottom: 16,
  },
  timerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#39FF14",
    marginBottom: 8,
  },
  timerComplete: {
    fontSize: 14,
    color: "#8E8E93",
    fontStyle: "italic",
  },
  navigation: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#39FF1420",
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    gap: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  navButtonTextDisabled: {
    color: "#4A4A4A",
  },
  completeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#39FF14",
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0A0A0A",
  },
});
