// Component for displaying a day in the calendar

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { PracticeDay } from "../models/types";

interface CalendarDayProps {
  date: Date;
  practiceDay?: PracticeDay;
  isToday: boolean;
  isSchoolHoliday: boolean;
  isFamilyHoliday: boolean;
  onPress: () => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  practiceDay,
  isToday,
  isSchoolHoliday,
  isFamilyHoliday,
  onPress,
}) => {
  const dayNumber = date.getDate();
  const hasPractice = practiceDay && practiceDay.sessions.length > 0;
  const isRestDay = practiceDay?.isRestDay ?? false;
  const hasMorning = practiceDay?.sessions.some(
    (s) => s.timeSlot === "morning" || (s.timeSlotId && s.timeSlotId.includes("morning"))
  );
  const hasAfternoon = practiceDay?.sessions.some(
    (s) => s.timeSlot === "evening" || (s.timeSlot === "custom" && s.timeSlotId && s.timeSlotId.includes("afternoon"))
  );

  return (
    <TouchableOpacity
      style={[styles.container, isToday && styles.today]}
      onPress={onPress}
    >
      <Text style={[styles.dayNumber, isToday && styles.todayText]}>
        {dayNumber}
      </Text>
      <View style={styles.indicators}>
        {isRestDay && <View style={styles.restDot} />}
        {hasMorning && <View style={styles.morningDot} />}
        {hasAfternoon && <View style={styles.afternoonDot} />}
        {!hasPractice && !isRestDay && date < new Date() && (
          <View style={styles.missedDot} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 8,
    margin: 2,
    backgroundColor: "#0A0A0A",
  },
  today: {
    borderColor: "#39FF14",
    borderWidth: 2,
    backgroundColor: "#39FF1415",
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  todayText: {
    color: "#39FF14",
  },
  indicators: {
    flexDirection: "row",
    gap: 2,
  },
  schoolHolidayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#39FF14",
  },
  familyHolidayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4A90E2",
  },
  restDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFA500",
  },
  morningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2196F3",
  },
  afternoonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9C27B0",
  },
  missedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#f44336",
  },
});
