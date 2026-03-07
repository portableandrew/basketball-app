// Component for checklist drill items

import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { ChecklistDrill } from "../models/types";

interface DrillChecklistItemProps {
  drill: ChecklistDrill;
  completed: boolean;
  onToggle: (completed: boolean) => void;
}

export const DrillChecklistItem: React.FC<DrillChecklistItemProps> = ({
  drill,
  completed,
  onToggle,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name}>{drill.name}</Text>
        {drill.description && (
          <Text style={styles.description}>{drill.description}</Text>
        )}
        {drill.defaultDurationMinutes && (
          <Text style={styles.duration}>
            ~{drill.defaultDurationMinutes} min
          </Text>
        )}
      </View>
      <Switch
        value={completed}
        onValueChange={onToggle}
        trackColor={{ false: "#2A2A2A", true: "#39FF14" }}
        thumbColor={completed ? "#0A0A0A" : "#8E8E93"}
      />
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
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 8,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 6,
    lineHeight: 20,
  },
  duration: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "600",
  },
});
