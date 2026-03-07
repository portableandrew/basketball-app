// Stats screen showing shooting percentages and XP history

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getShootingSets,
  getShotSpots,
  getPracticeDays,
  getGamificationState,
} from "../storage/storage";
import { ShootingSet, ShotSpot } from "../models/types";
import { getDateDaysAgo } from "../utils/dates";
import { ShotChart } from "../components/ShotChart";
import { safePercent, formatPercent, clamp } from "../utils/number";

type TimeRange = "7" | "30" | "all";

export const StatsScreen: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30");
  const [shootingSets, setShootingSets] = useState<ShootingSet[]>([]);
  const [shotSpots, setShotSpots] = useState<ShotSpot[]>([]);
  const [practiceDays, setPracticeDays] = useState<any[]>([]);
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    const [sets, spots, days, gamState] = await Promise.all([
      getShootingSets(),
      getShotSpots(),
      getPracticeDays(),
      getGamificationState(),
    ]);

    setShotSpots(spots);
    setPracticeDays(days);
    setTotalXp(gamState.totalXp);

    // Filter by time range
    const cutoffDate =
      timeRange === "all"
        ? null
        : getDateDaysAgo(parseInt(timeRange));
    const filteredSets = cutoffDate
      ? sets.filter((s) => s.date >= cutoffDate)
      : sets;

    setShootingSets(filteredSets);
  };

  const getStatsForSpot = (spotId: string) => {
    if (!shootingSets || !Array.isArray(shootingSets)) {
      return { makes: 0, attempts: 0, percentage: 0 };
    }
    const sets = shootingSets.filter((s) => s && s.spotId === spotId);
    const makes = sets.reduce((sum, s) => sum + (isFinite(s.makes) ? Math.max(0, s.makes) : 0), 0);
    const attempts = sets.reduce((sum, s) => sum + (isFinite(s.attempts) ? Math.max(0, s.attempts) : 0), 0);
    const percentage = safePercent(makes, attempts);

    return { makes, attempts, percentage };
  };

  const activeSpots = (shotSpots && Array.isArray(shotSpots)) ? shotSpots.filter((s) => s && s.isActive) : [];

  // Helper function to get percentage status
  const getPercentageStatus = (percentage: number): "bad" | "good" | "great" => {
    const safePercent = isFinite(percentage) ? Math.max(0, Math.min(100, percentage)) : 0;
    if (safePercent >= 60) return "great";
    if (safePercent >= 50) return "good";
    return "bad";
  };

  // Helper function to get color based on percentage status
  const getPercentageColor = (percentage: number): string => {
    const safePercent = isFinite(percentage) ? Math.max(0, Math.min(100, percentage)) : 0;
    const status = getPercentageStatus(safePercent);
    if (status === "great") return "#39FF14"; // Green
    if (status === "good") return "#FFD700"; // Yellow/Gold
    return "#FF6B35"; // Red/Orange
  };

  // Helper function to get status label
  const getStatusLabel = (percentage: number): string => {
    const safePercent = isFinite(percentage) ? Math.max(0, Math.min(100, percentage)) : 0;
    const status = getPercentageStatus(safePercent);
    if (status === "great") return "Great";
    if (status === "good") return "Good";
    return "Bad";
  };

  // Calculate overall stats
  const totalMakes = (shootingSets && Array.isArray(shootingSets)) 
    ? shootingSets.reduce((sum, s) => sum + (s && isFinite(s.makes) ? Math.max(0, s.makes) : 0), 0)
    : 0;
  const totalAttempts = (shootingSets && Array.isArray(shootingSets))
    ? shootingSets.reduce((sum, s) => sum + (s && isFinite(s.attempts) ? Math.max(0, s.attempts) : 0), 0)
    : 0;
  const overallFG = safePercent(totalMakes, totalAttempts);

  // Find best and worst shooting spots
  const spotStats = activeSpots.map((spot) => ({
    spotId: spot.id,
    spotName: spot.name,
    ...getStatsForSpot(spot.id),
  }));

  const bestSpot = spotStats
    .filter((s) => s && s.attempts >= 10)
    .sort((a, b) => b.percentage - a.percentage)[0];
  const worstSpot = spotStats
    .filter((s) => s && s.attempts >= 10)
    .sort((a, b) => a.percentage - b.percentage)[0];

  // Calculate 7-day and 30-day summaries
  const sevenDaySets = (shootingSets && Array.isArray(shootingSets))
    ? shootingSets.filter((s) => s && s.date >= getDateDaysAgo(7))
    : [];
  const thirtyDaySets = (shootingSets && Array.isArray(shootingSets))
    ? shootingSets.filter((s) => s && s.date >= getDateDaysAgo(30))
    : [];

  const sevenDayMakes = sevenDaySets.reduce((sum, s) => sum + (isFinite(s.makes) ? Math.max(0, s.makes) : 0), 0);
  const sevenDayAttempts = sevenDaySets.reduce((sum, s) => sum + (isFinite(s.attempts) ? Math.max(0, s.attempts) : 0), 0);
  const sevenDayFG = safePercent(sevenDayMakes, sevenDayAttempts);

  const thirtyDayMakes = thirtyDaySets.reduce((sum, s) => sum + (isFinite(s.makes) ? Math.max(0, s.makes) : 0), 0);
  const thirtyDayAttempts = thirtyDaySets.reduce(
    (sum, s) => sum + (isFinite(s.attempts) ? Math.max(0, s.attempts) : 0),
    0
  );
  const thirtyDayFG = safePercent(thirtyDayMakes, thirtyDayAttempts);

  // Calculate Free Throw stats
  const cutoffDate = timeRange === "all" ? null : getDateDaysAgo(parseInt(timeRange));
  const filteredDays = (practiceDays && Array.isArray(practiceDays))
    ? (cutoffDate
        ? practiceDays.filter((d) => d && d.date >= cutoffDate)
        : practiceDays)
    : [];
  
  const ftTotal = filteredDays.reduce(
    (acc, day) => {
      if (day.freeThrows) {
        const makes = isFinite(day.freeThrows.makes) ? Math.max(0, day.freeThrows.makes) : 0;
        const attempts = isFinite(day.freeThrows.attempts) ? Math.max(0, day.freeThrows.attempts) : 0;
        acc.makes += makes;
        acc.attempts += attempts;
      }
      return acc;
    },
    { makes: 0, attempts: 0 }
  );
  // Clamp makes to not exceed attempts
  ftTotal.makes = Math.min(ftTotal.makes, ftTotal.attempts);
  const ftPercentage = safePercent(ftTotal.makes, ftTotal.attempts);

  // 7-day FT stats
  const sevenDayDays = (practiceDays && Array.isArray(practiceDays))
    ? practiceDays.filter((d) => d && d.date >= getDateDaysAgo(7))
    : [];
  const ft7Day = sevenDayDays.reduce(
    (acc, day) => {
      if (day.freeThrows) {
        const makes = isFinite(day.freeThrows.makes) ? Math.max(0, day.freeThrows.makes) : 0;
        const attempts = isFinite(day.freeThrows.attempts) ? Math.max(0, day.freeThrows.attempts) : 0;
        acc.makes += makes;
        acc.attempts += attempts;
      }
      return acc;
    },
    { makes: 0, attempts: 0 }
  );
  ft7Day.makes = Math.min(ft7Day.makes, ft7Day.attempts);
  const ft7DayPercentage = safePercent(ft7Day.makes, ft7Day.attempts);

  // 30-day FT stats
  const thirtyDayDays = (practiceDays && Array.isArray(practiceDays))
    ? practiceDays.filter((d) => d && d.date >= getDateDaysAgo(30))
    : [];
  const ft30Day = thirtyDayDays.reduce(
    (acc, day) => {
      if (day.freeThrows) {
        const makes = isFinite(day.freeThrows.makes) ? Math.max(0, day.freeThrows.makes) : 0;
        const attempts = isFinite(day.freeThrows.attempts) ? Math.max(0, day.freeThrows.attempts) : 0;
        acc.makes += makes;
        acc.attempts += attempts;
      }
      return acc;
    },
    { makes: 0, attempts: 0 }
  );
  ft30Day.makes = Math.min(ft30Day.makes, ft30Day.attempts);
  const ft30DayPercentage = safePercent(ft30Day.makes, ft30Day.attempts);

  // Calculate training session stats (per week)
  const sevenDayDaysForTraining = (practiceDays && Array.isArray(practiceDays))
    ? practiceDays.filter((d) => d && d.date >= getDateDaysAgo(7))
    : [];
  const gymSessions7Day = sevenDayDaysForTraining.reduce((count, day) => {
    if (day.trainingSessions && day.trainingSessions.length > 0) {
      return count + day.trainingSessions.filter((ts) => ts.type === "gym" && ts.completed).length;
    }
    return count;
  }, 0);
  const verticalJumpSessions7Day = sevenDayDaysForTraining.reduce((count, day) => {
    if (day.trainingSessions && day.trainingSessions.length > 0) {
      return count + day.trainingSessions.filter((ts) => ts.type === "vertical_jump" && ts.completed).length;
    }
    return count;
  }, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
        <View style={styles.timeRangeSelector}>
          <TouchableOpacity
            style={[
              styles.timeRangeButton,
              timeRange === "7" && styles.timeRangeButtonActive,
            ]}
            onPress={() => setTimeRange("7")}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === "7" && styles.timeRangeTextActive,
              ]}
            >
              7 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timeRangeButton,
              timeRange === "30" && styles.timeRangeButtonActive,
            ]}
            onPress={() => setTimeRange("30")}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === "30" && styles.timeRangeTextActive,
              ]}
            >
              30 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timeRangeButton,
              timeRange === "all" && styles.timeRangeButtonActive,
            ]}
            onPress={() => setTimeRange("all")}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === "all" && styles.timeRangeTextActive,
              ]}
            >
              All Time
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Overall Stats Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Shooting</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Ionicons name="basketball" size={24} color="#39FF14" />
            <Text style={styles.summaryValue}>{isFinite(totalMakes) ? Math.max(0, totalMakes) : 0}</Text>
            <Text style={styles.summaryLabel}>Total Makes</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="basketball-outline" size={24} color="#39FF14" />
            <Text style={styles.summaryValue}>{isFinite(totalAttempts) ? Math.max(0, totalAttempts) : 0}</Text>
            <Text style={styles.summaryLabel}>Total Attempts</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="trophy" size={24} color={totalAttempts > 0 ? getPercentageColor(overallFG) : "#8E8E93"} />
            <Text style={[styles.summaryValue, { color: totalAttempts > 0 ? getPercentageColor(overallFG) : "#FFFFFF" }]}>
              {formatPercent(overallFG)}
            </Text>
            <Text style={styles.summaryLabel}>FG%</Text>
            {totalAttempts > 0 && (
              <Text style={[styles.statusLabel, { color: getPercentageColor(overallFG) }]}>
                {getStatusLabel(overallFG)}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Shot Chart Heatmap */}
      <ShotChart spots={shotSpots} stats={spotStats} />

      {/* Best/Worst Spots */}
      {(bestSpot || worstSpot) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Highlights</Text>
          {bestSpot && (
            <View style={styles.highlightCard}>
              <View style={styles.highlightHeader}>
                <Ionicons name="arrow-up-circle" size={20} color="#39FF14" />
                <Text style={styles.highlightTitle}>Best Spot</Text>
              </View>
              <Text style={styles.highlightSpot}>{bestSpot.spotName}</Text>
              <Text style={styles.highlightStat}>
                {formatPercent(bestSpot.percentage)} ({isFinite(bestSpot.makes) ? Math.max(0, bestSpot.makes) : 0}/
                {isFinite(bestSpot.attempts) ? Math.max(0, bestSpot.attempts) : 0})
              </Text>
            </View>
          )}
          {worstSpot && worstSpot.spotId !== bestSpot?.spotId && (
            <View style={[styles.highlightCard, styles.highlightCardWeak]}>
              <View style={styles.highlightHeader}>
                <Ionicons name="arrow-down-circle" size={20} color="#FF6B35" />
                <Text style={styles.highlightTitle}>Focus Area</Text>
              </View>
              <Text style={styles.highlightSpot}>{worstSpot.spotName}</Text>
              <Text style={styles.highlightStat}>
                {formatPercent(worstSpot.percentage)} ({isFinite(worstSpot.makes) ? Math.max(0, worstSpot.makes) : 0}/
                {isFinite(worstSpot.attempts) ? Math.max(0, worstSpot.attempts) : 0})
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Training Sessions (7-day) */}
      {(gymSessions7Day > 0 || verticalJumpSessions7Day > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Sessions (Last 7 Days)</Text>
          <View style={styles.summaryGrid}>
            {gymSessions7Day > 0 && (
              <View style={styles.summaryCard}>
                <Ionicons name="barbell" size={24} color="#39FF14" />
                <Text style={styles.summaryValue}>{gymSessions7Day}</Text>
                <Text style={styles.summaryLabel}>Gym Sessions</Text>
              </View>
            )}
            {verticalJumpSessions7Day > 0 && (
              <View style={styles.summaryCard}>
                <Ionicons name="arrow-up" size={24} color="#39FF14" />
                <Text style={styles.summaryValue}>{verticalJumpSessions7Day}</Text>
                <Text style={styles.summaryLabel}>Vertical Jump</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Time Range Summaries */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time Range Summary</Text>
        <View style={styles.timeSummaryRow}>
          <View style={styles.timeSummaryCard}>
            <Text style={styles.timeSummaryLabel}>7 Days</Text>
            <Text style={[styles.timeSummaryValue, { color: sevenDayAttempts > 0 ? getPercentageColor(sevenDayFG) : "#8E8E93" }]}>
              {formatPercent(sevenDayFG)}
            </Text>
            {sevenDayAttempts > 0 && (
              <Text style={[styles.statusBadge, { color: getPercentageColor(sevenDayFG) }]}>
                {getStatusLabel(sevenDayFG)}
              </Text>
            )}
            <Text style={styles.timeSummaryCount}>
              {isFinite(sevenDayMakes) ? Math.max(0, sevenDayMakes) : 0}/{isFinite(sevenDayAttempts) ? Math.max(0, sevenDayAttempts) : 0}
            </Text>
          </View>
          <View style={styles.timeSummaryCard}>
            <Text style={styles.timeSummaryLabel}>30 Days</Text>
            <Text style={[styles.timeSummaryValue, { color: thirtyDayAttempts > 0 ? getPercentageColor(thirtyDayFG) : "#8E8E93" }]}>
              {formatPercent(thirtyDayFG)}
            </Text>
            {thirtyDayAttempts > 0 && (
              <Text style={[styles.statusBadge, { color: getPercentageColor(thirtyDayFG) }]}>
                {getStatusLabel(thirtyDayFG)}
              </Text>
            )}
            <Text style={styles.timeSummaryCount}>
              {isFinite(thirtyDayMakes) ? Math.max(0, thirtyDayMakes) : 0}/{isFinite(thirtyDayAttempts) ? Math.max(0, thirtyDayAttempts) : 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Free Throw Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Free Throws</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Ionicons name="basketball-outline" size={24} color="#39FF14" />
            <Text style={styles.summaryValue}>{isFinite(ftTotal.makes) ? Math.max(0, ftTotal.makes) : 0}</Text>
            <Text style={styles.summaryLabel}>Total Makes</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="basketball-outline" size={24} color="#39FF14" />
            <Text style={styles.summaryValue}>{isFinite(ftTotal.attempts) ? Math.max(0, ftTotal.attempts) : 0}</Text>
            <Text style={styles.summaryLabel}>Total Attempts</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="trophy-outline" size={24} color={ftTotal.attempts > 0 ? getPercentageColor(ftPercentage) : "#8E8E93"} />
            <Text style={[styles.summaryValue, { color: ftTotal.attempts > 0 ? getPercentageColor(ftPercentage) : "#FFFFFF" }]}>
              {formatPercent(ftPercentage)}
            </Text>
            <Text style={styles.summaryLabel}>FT%</Text>
            {ftTotal.attempts > 0 && (
              <Text style={[styles.statusLabel, { color: getPercentageColor(ftPercentage) }]}>
                {getStatusLabel(ftPercentage)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.timeSummaryRow}>
          <View style={styles.timeSummaryCard}>
            <Text style={styles.timeSummaryLabel}>7 Days</Text>
            <Text style={[styles.timeSummaryValue, { color: ft7Day.attempts > 0 ? getPercentageColor(ft7DayPercentage) : "#8E8E93" }]}>
              {formatPercent(ft7DayPercentage)}
            </Text>
            {ft7Day.attempts > 0 && (
              <Text style={[styles.statusBadge, { color: getPercentageColor(ft7DayPercentage) }]}>
                {getStatusLabel(ft7DayPercentage)}
              </Text>
            )}
            <Text style={styles.timeSummaryCount}>
              {ft7Day.makes}/{ft7Day.attempts}
            </Text>
          </View>
          <View style={styles.timeSummaryCard}>
            <Text style={styles.timeSummaryLabel}>30 Days</Text>
            <Text style={[styles.timeSummaryValue, { color: ft30Day.attempts > 0 ? getPercentageColor(ft30DayPercentage) : "#8E8E93" }]}>
              {formatPercent(ft30DayPercentage)}
            </Text>
            {ft30Day.attempts > 0 && (
              <Text style={[styles.statusBadge, { color: getPercentageColor(ft30DayPercentage) }]}>
                {getStatusLabel(ft30DayPercentage)}
              </Text>
            )}
            <Text style={styles.timeSummaryCount}>
              {ft30Day.makes}/{ft30Day.attempts}
            </Text>
          </View>
        </View>
      </View>

      {/* Detailed Spot Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shooting by Spot</Text>
        {activeSpots.length === 0 ? (
          <Text style={styles.emptyText}>No active shot spots</Text>
        ) : (
          activeSpots.map((spot) => {
            const stats = getStatsForSpot(spot.id);
            return (
              <View key={spot.id} style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statName}>{spot.name}</Text>
                  <Text style={styles.statType}>{spot.type}</Text>
                </View>
                <View style={styles.statNumbers}>
                  <Text style={[styles.statPercentage, { color: stats.attempts > 0 ? getPercentageColor(stats.percentage) : "#8E8E93" }]}>
                    {stats.attempts > 0
                      ? formatPercent(stats.percentage)
                      : "N/A"}
                  </Text>
                  {stats.attempts > 0 && (
                    <Text style={[styles.statusBadge, { color: getPercentageColor(stats.percentage) }]}>
                      {getStatusLabel(stats.percentage)}
                    </Text>
                  )}
                  <Text style={styles.statCount}>
                    {isFinite(stats.makes) ? Math.max(0, stats.makes) : 0}/{isFinite(stats.attempts) ? Math.max(0, stats.attempts) : 0}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Total XP</Text>
        <View style={styles.xpCard}>
          <Text style={styles.xpValue}>{totalXp.toLocaleString()}</Text>
          <Text style={styles.xpLabel}>Total Experience Points</Text>
        </View>
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
    backgroundColor: "#1A1A1A",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  timeRangeSelector: {
    flexDirection: "row",
    gap: 10,
  },
  timeRangeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  timeRangeButtonActive: {
    backgroundColor: "#39FF14",
    borderColor: "#39FF14",
  },
  timeRangeText: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "600",
  },
  timeRangeTextActive: {
    color: "#FFFFFF",
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
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  statInfo: {
    flex: 1,
  },
  statName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statType: {
    fontSize: 13,
    color: "#8E8E93",
    textTransform: "capitalize",
  },
  statNumbers: {
    alignItems: "flex-end",
  },
  statPercentage: {
    fontSize: 22,
    fontWeight: "700",
    color: "#39FF14",
    marginBottom: 4,
  },
  statCount: {
    fontSize: 14,
    color: "#8E8E93",
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    padding: 20,
  },
  xpCard: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#39FF1415",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#39FF1430",
  },
  xpValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#39FF14",
    marginBottom: 8,
    letterSpacing: -1,
  },
  xpLabel: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  highlightCard: {
    backgroundColor: "#39FF1415",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#39FF1430",
  },
  highlightCardWeak: {
    backgroundColor: "#FF6B3515",
    borderColor: "#FF6B3530",
  },
  highlightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  highlightTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#39FF14",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  highlightSpot: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  highlightStat: {
    fontSize: 16,
    fontWeight: "700",
    color: "#39FF14",
  },
  timeSummaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  timeSummaryCard: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  timeSummaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  timeSummaryValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#39FF14",
    marginBottom: 4,
  },
  timeSummaryCount: {
    fontSize: 13,
    color: "#8E8E93",
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
