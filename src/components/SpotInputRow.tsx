// Component for inputting makes/attempts for a shot spot

import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { ShotSpot } from "../models/types";
import { safePercent } from "../utils/number";

interface SpotInputRowProps {
  spot: ShotSpot;
  makes: number;
  attempts: number;
  onMakesChange: (makes: number) => void;
  onAttemptsChange: (attempts: number) => void;
}

export const SpotInputRow: React.FC<SpotInputRowProps> = ({
  spot,
  makes,
  attempts,
  onMakesChange,
  onAttemptsChange,
}) => {
  // Clamp makes to not exceed attempts, then calculate safe percentage
  const safeMakes = Math.max(0, Math.min(makes, attempts));
  const percentage = safePercent(safeMakes, attempts);

  return (
    <View style={styles.container}>
      <View style={styles.spotInfo}>
        <Text style={styles.spotName}>{spot.name}</Text>
        <Text style={styles.spotType}>{spot.type}</Text>
      </View>
      <View style={styles.inputs}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Makes</Text>
          <TextInput
            style={styles.input}
            value={makes.toString()}
            onChangeText={(text) => {
              const num = parseInt(text) || 0;
              // Clamp makes to not exceed attempts
              const safeNum = Math.max(0, Math.min(num, attempts || Infinity));
              onMakesChange(safeNum);
            }}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Attempts</Text>
          <TextInput
            style={styles.input}
            value={attempts.toString()}
            onChangeText={(text) => {
              const num = parseInt(text) || 0;
              onAttemptsChange(num);
            }}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        {attempts > 0 && (
          <View style={styles.percentage}>
            <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    marginBottom: 8,
  },
  spotInfo: {
    flex: 1,
    justifyContent: "center",
  },
  spotName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  spotType: {
    fontSize: 12,
    color: "#8E8E93",
    textTransform: "capitalize",
  },
  inputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inputGroup: {
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    color: "#8E8E93",
    marginBottom: 6,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 8,
    padding: 10,
    width: 65,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    backgroundColor: "#0A0A0A",
  },
  percentage: {
    marginLeft: 8,
    minWidth: 50,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#39FF14",
  },
});
