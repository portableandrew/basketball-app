// Shot Chart Heatmap Component - Visual representation of shooting performance

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ShotSpot } from "../models/types";
import { formatPercent, clamp, safePercent } from "../utils/number";

interface ShotSpotStats {
  spotId: string;
  spotName: string;
  makes: number;
  attempts: number;
  percentage: number;
}

interface ShotChartProps {
  spots: ShotSpot[];
  stats: ShotSpotStats[];
}

export const ShotChart: React.FC<ShotChartProps> = ({ spots, stats }) => {
  const getPercentageColor = (percentage: number): string => {
    const safePercent = clamp(isFinite(percentage) ? percentage : 0, 0, 100);
    if (safePercent === 0) return "#8E8E93"; // No data
    if (safePercent >= 60) return "#39FF14"; // Great (green)
    if (safePercent >= 50) return "#FFD700"; // Good (yellow/gold)
    return "#FF6B35"; // Bad (red/orange)
  };

  const getSpotStats = (spotId: string) => {
    if (!stats || !Array.isArray(stats) || !spotId) {
      return {
        makes: 0,
        attempts: 0,
        percentage: 0,
      };
    }
    const found = stats.find((s) => s && s.spotId === spotId);
    if (!found) {
      return {
        makes: 0,
        attempts: 0,
        percentage: 0,
      };
    }
    // Ensure percentage is valid
    return {
      makes: isFinite(found.makes) ? Math.max(0, found.makes) : 0,
      attempts: isFinite(found.attempts) ? Math.max(0, found.attempts) : 0,
      percentage: clamp(isFinite(found.percentage) ? found.percentage : 0, 0, 100),
    };
  };

  const getColorForPercentage = (percentage: number): string => {
    // Ensure percentage is valid
    const safePercent = clamp(isFinite(percentage) ? percentage : 0, 0, 100);
    if (safePercent === 0) return "#2A2A2A"; // No data
    if (safePercent >= 60) return "#39FF14"; // Great (green)
    if (safePercent >= 50) return "#FFD700"; // Good (yellow/gold)
    return "#FF6B35"; // Bad (red/orange)
  };

  const getSpotPosition = (spotName: string) => {
    const positions: Record<string, { top: number; left: number }> = {
      "Right Corner 3": { top: 75, left: 5 },
      "Right Wing 3": { top: 40, left: 20 },
      "Top 3": { top: 5, left: 45 },
      "Left Wing 3": { top: 40, left: 70 },
      "Left Corner 3": { top: 75, left: 85 },
    };
    return positions[spotName] || { top: 50, left: 50 };
  };

  const activeSpots = (spots && Array.isArray(spots)) 
    ? spots.filter((s) => s && s.isActive)
    : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shot Chart</Text>
      <View style={styles.chartContainer}>
        <View style={styles.court}>
          {/* Court lines */}
          <View style={styles.threePointLine} />
          <View style={styles.key} />
          <View style={styles.rim} />

          {/* Shot spots */}
          {activeSpots.map((spot) => {
            if (!spot || !spot.id) return null;
            const spotStats = getSpotStats(spot.id);
            const position = getSpotPosition(spot.name);
            const color = getColorForPercentage(spotStats.percentage);

            return (
              <View
                key={spot.id}
                style={[
                  styles.shotSpot,
                  {
                    top: `${position.top}%`,
                    left: `${position.left}%`,
                    backgroundColor: color,
                  },
                ]}
              >
                <Text style={styles.spotPercentage}>
                  {spotStats.attempts > 0
                    ? formatPercent(spotStats.percentage, 0)
                    : "-"}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#39FF14" }]} />
          <Text style={styles.legendText}>Great (60%+)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#FFD700" }]} />
          <Text style={styles.legendText}>Good (50-59%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#FF6B35" }]} />
          <Text style={styles.legendText}>Bad ({'<'}50%)</Text>
        </View>
      </View>

      <View style={styles.statsList}>
        {activeSpots.map((spot) => {
          const spotStats = getSpotStats(spot.id);
          return (
            <View key={spot.id} style={styles.statRow}>
              <Text style={styles.statName}>{spot.name}</Text>
              <View style={styles.statNumbers}>
                <Text style={[styles.statPercentage, { color: spotStats.attempts > 0 ? getPercentageColor(spotStats.percentage) : "#8E8E93" }]}>
                  {spotStats.attempts > 0
                    ? formatPercent(spotStats.percentage)
                    : "N/A"}
                </Text>
                <Text style={styles.statCount}>
                  {isFinite(spotStats.makes) ? Math.max(0, spotStats.makes) : 0}/{isFinite(spotStats.attempts) ? Math.max(0, spotStats.attempts) : 0}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    margin: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  court: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#0A0A0A",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#39FF1440",
    position: "relative",
    overflow: "hidden",
  },
  threePointLine: {
    position: "absolute",
    width: "80%",
    height: "80%",
    borderRadius: 200,
    borderWidth: 2,
    borderColor: "#39FF1460",
    top: "10%",
    left: "10%",
  },
  key: {
    position: "absolute",
    width: "30%",
    height: "25%",
    borderWidth: 2,
    borderColor: "#39FF1460",
    bottom: "10%",
    left: "35%",
    borderTopWidth: 0,
  },
  rim: {
    position: "absolute",
    width: "8%",
    height: "8%",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#39FF14",
    bottom: "20%",
    left: "46%",
  },
  shotSpot: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateX: -25 }, { translateY: -25 }],
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  spotPercentage: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 20,
    flexWrap: "wrap",
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
  statsList: {
    gap: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  statName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
  },
  statNumbers: {
    alignItems: "flex-end",
  },
  statPercentage: {
    fontSize: 16,
    fontWeight: "700",
    color: "#39FF14",
    marginBottom: 2,
  },
  statCount: {
    fontSize: 12,
    color: "#8E8E93",
  },
});
