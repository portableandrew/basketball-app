// Calendar screen showing practice days and sessions

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { CalendarDay } from "../components/CalendarDay";
import { getPracticeDays, getPracticeDay, markFamilyHoliday, getUserProfile } from "../storage/storage";
import { PracticeDay } from "../models/types";
import { getDatesInMonth, formatDate, safeFormatDateToYYYYMMDD } from "../utils/dates";
import { isSchoolHoliday } from "../utils/holidays";
import { Ionicons } from "@expo/vector-icons";

export const CalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [practiceDays, setPracticeDays] = useState<PracticeDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<PracticeDay | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [days, userProfile] = await Promise.all([
      getPracticeDays(),
      getUserProfile(),
    ]);
    setPracticeDays(days);
    setProfile(userProfile);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const dates = getDatesInMonth(year, month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getPracticeDayForDate = (date: Date): PracticeDay | undefined => {
    const dateStr = safeFormatDateToYYYYMMDD(date);
    return practiceDays.find((d) => d.date === dateStr);
  };

  const handleDayPress = async (date: Date) => {
    const dateStr = safeFormatDateToYYYYMMDD(date);
    const day = await getPracticeDay(dateStr);
    setSelectedDay(day || null);
  };

  const handleToggleFamilyHoliday = async (date: string) => {
    const day = practiceDays.find((d) => d.date === date);
    if (!day) return;
    const newValue = !day.isFamilyHoliday;
    await markFamilyHoliday(date, newValue);
    const updated = await getPracticeDay(date);
    setSelectedDay(updated || null);
    setPracticeDays((prev) =>
      prev.map((d) => (d.date === date && updated ? updated : d))
    );
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get first day of month to pad calendar
  const firstDay = new Date(year, month, 1).getDay();
  const paddingDays = Array(firstDay).fill(null);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.monthHeader}>
          <TouchableOpacity
            onPress={() => {
              const prevMonth = new Date(year, month - 1, 1);
              setCurrentDate(prevMonth);
            }}
          >
            <Text style={styles.navButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {monthNames[month]} {year}
          </Text>
          <TouchableOpacity
            onPress={() => {
              const nextMonth = new Date(year, month + 1, 1);
              setCurrentDate(nextMonth);
            }}
          >
            <Text style={styles.navButton}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendar}>
        <View style={styles.weekDays}>
          {weekDays.map((day) => (
            <View key={day} style={styles.weekDay}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {paddingDays.map((_, index) => (
            <View key={`pad-${index}`} style={styles.emptyDay} />
          ))}
          {dates.map((date) => {
            const practiceDay = getPracticeDayForDate(date);
            const dateStr = safeFormatDateToYYYYMMDD(date);
            const isToday = date.toDateString() === today.toDateString();
            const isSchoolHolidayDate = isSchoolHoliday(dateStr);
            const isFamilyHolidayDate = profile?.familyHolidayDates?.includes(dateStr) || false;
            
            return (
              <CalendarDay
                key={safeFormatDateToYYYYMMDD(date)}
                date={date}
                practiceDay={practiceDay}
                isToday={isToday}
                isSchoolHoliday={isSchoolHolidayDate}
                isFamilyHoliday={isFamilyHolidayDate}
                onPress={() => handleDayPress(date)}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#39FF14" }]} />
          <Text style={styles.legendText}>School Holiday</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#4A90E2" }]} />
          <Text style={styles.legendText}>Family Holiday</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#FFA500" }]} />
          <Text style={styles.legendText}>Rest Day</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#2196F3" }]} />
          <Text style={styles.legendText}>Morning</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#9C27B0" }]} />
          <Text style={styles.legendText}>Afternoon</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#f44336" }]} />
          <Text style={styles.legendText}>Missed</Text>
        </View>
      </View>

      {selectedDay && (
        <View style={styles.selectedDayInfo}>
          <Text style={styles.selectedDayTitle}>
            {formatDate(selectedDay.date)}
          </Text>
          
          <View style={styles.dayTypeBadges}>
            {selectedDay.isSchoolHoliday && (
              <View style={styles.typeBadge}>
                <Ionicons name="sunny" size={14} color="#39FF14" />
                <Text style={styles.typeBadgeText}>School Holiday</Text>
              </View>
            )}
            {selectedDay.isFamilyHoliday && (
              <View style={[styles.typeBadge, styles.familyHolidayBadge]}>
                <Ionicons name="airplane" size={14} color="#4A90E2" />
                <Text style={[styles.typeBadgeText, styles.familyHolidayBadgeText]}>Family Holiday</Text>
              </View>
            )}
            {selectedDay.isRestDay && (
              <View style={styles.typeBadge}>
                <Ionicons name="bed" size={14} color="#FFA500" />
                <Text style={styles.typeBadgeText}>Rest Day</Text>
              </View>
            )}
          </View>

          {selectedDay.isRestDay ? (
            <Text style={styles.restDayText}>Rest Day</Text>
          ) : selectedDay.sessions.length === 0 ? (
            <Text style={styles.noPracticeText}>No practice logged</Text>
          ) : (
            <View>
              <View style={styles.sessionCountHeader}>
                <Text style={styles.sessionCountText}>
                  {selectedDay.sessions.length} session{selectedDay.sessions.length !== 1 ? "s" : ""} completed
                </Text>
              </View>
              {selectedDay.sessions.map((session) => {
                const sessionTimeSlot = session.timeSlot || 
                  (session.timeSlotId.includes("morning") ? "morning" :
                   session.timeSlotId.includes("afternoon") || session.timeSlotId.includes("evening") ? "evening" : "custom");
                const sessionType = session.type || "mixed";
                
                return (
                  <View key={session.id} style={styles.sessionInfo}>
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionTimeSlot}>
                        {sessionTimeSlot === "morning" ? "Morning" :
                         sessionTimeSlot === "evening" ? "Evening" : "Custom"}
                      </Text>
                      <View style={styles.sessionTypeBadge}>
                        <Text style={styles.sessionTypeText}>{sessionType}</Text>
                      </View>
                    </View>
                    <Text style={styles.sessionDetails}>
                      {session.shootingSets.length} shooting sets,{" "}
                      {session.drillCompletions.length} drills
                      {session.trainingSessions && session.trainingSessions.length > 0 && (
                        <>, {session.trainingSessions.length} training session{session.trainingSessions.length !== 1 ? "s" : ""}</>
                      )}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <TouchableOpacity
            style={styles.toggleFamilyHolidayButton}
            onPress={() => handleToggleFamilyHoliday(selectedDay.date)}
          >
            <Ionicons 
              name={selectedDay.isFamilyHoliday ? "airplane" : "airplane-outline"} 
              size={18} 
              color="#4A90E2" 
            />
            <Text style={styles.toggleFamilyHolidayText}>
              {selectedDay.isFamilyHoliday ? "Remove Family Holiday" : "Mark as Family Holiday"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedDay(null)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  header: {
    padding: 16,
    backgroundColor: "#0A0A0A",
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navButton: {
    fontSize: 24,
    color: "#39FF14",
    fontWeight: "bold",
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  calendar: {
    backgroundColor: "#1A1A1A",
    margin: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  weekDays: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  emptyDay: {
    width: 50,
    height: 60,
    margin: 2,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#8E8E93",
  },
  selectedDayInfo: {
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
  selectedDayTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  dayTypeBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  familyHolidayBadge: {
    backgroundColor: "#4A90E215",
  },
  familyHolidayBadgeText: {
    color: "#4A90E2",
  },
  restDayText: {
    fontSize: 16,
    color: "#FFA500",
    marginBottom: 12,
  },
  noPracticeText: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 12,
  },
  toggleFamilyHolidayButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A90E215",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
    justifyContent: "center",
  },
  toggleFamilyHolidayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A90E2",
  },
  sessionCountHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  sessionCountText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#39FF14",
  },
  sessionInfo: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  sessionTimeSlot: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  sessionTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#39FF1415",
    borderWidth: 1,
    borderColor: "#39FF1440",
  },
  sessionTypeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#39FF14",
    textTransform: "uppercase",
  },
  sessionDetails: {
    fontSize: 14,
    color: "#8E8E93",
  },
  closeButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#39FF14",
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
