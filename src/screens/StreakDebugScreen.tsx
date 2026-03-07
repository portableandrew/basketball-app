// Streak Debug Screen - Shows last 14 days with training/neutral/streak status

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { getPracticeDays, getShootingSets, getUserProfile } from "../storage/storage";
import { getStreakDebugInfo } from "../utils/streaks";
import { formatDate } from "../utils/dates";

export const StreakDebugScreen: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      const [practiceDays, shootingSets, profile] = await Promise.all([
        getPracticeDays(),
        getShootingSets(),
        getUserProfile(),
      ]);

      const info = getStreakDebugInfo(
        practiceDays,
        shootingSets,
        profile?.familyHolidayDates || [],
        14
      );

      setDebugInfo(info);
    } catch (error) {
      console.error("Error loading streak debug info:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Streak Debug (Last 14 Days)</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Date</Text>
          <Text style={styles.headerCell}>Training?</Text>
          <Text style={styles.headerCell}>Neutral?</Text>
          <Text style={styles.headerCell}>Streak</Text>
          <Text style={styles.headerCell}>Reason</Text>
        </View>

        {debugInfo.map((day, index) => (
          <View
            key={day.date}
            style={[
              styles.tableRow,
              index % 2 === 0 && styles.tableRowEven,
            ]}
          >
            <Text style={styles.cell}>{formatDate(day.date)}</Text>
            <Text
              style={[
                styles.cell,
                day.isTraining ? styles.trueText : styles.falseText,
              ]}
            >
              {day.isTraining ? "Yes" : "No"}
            </Text>
            <Text
              style={[
                styles.cell,
                day.isNeutral ? styles.trueText : styles.falseText,
              ]}
            >
              {day.isNeutral ? "Yes" : "No"}
            </Text>
            <Text style={styles.cell}>{day.streakValue}</Text>
            <Text style={[styles.cell, styles.reasonCell]}>
              {day.reason || "-"}
            </Text>
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
  header: {
    padding: 20,
    backgroundColor: "#1A1A1A",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  loadingText: {
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 50,
  },
  table: {
    margin: 16,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2A2A2A",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#39FF14",
  },
  headerCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#39FF14",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  tableRowEven: {
    backgroundColor: "#0A0A0A",
  },
  cell: {
    flex: 1,
    fontSize: 12,
    color: "#FFFFFF",
  },
  trueText: {
    color: "#39FF14",
  },
  falseText: {
    color: "#8E8E93",
  },
  reasonCell: {
    fontSize: 10,
    color: "#8E8E93",
  },
});
