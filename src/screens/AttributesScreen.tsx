// Attributes Screen - NBA 2K style player attributes (0-99)

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getShootingSets,
  getDrillCompletions,
  getPracticeDays,
  getGamificationState,
} from "../storage/storage";
import {
  calculateAttributes,
  PlayerAttributes,
} from "../utils/profileAttributes";
import { useTheme } from "../context/ThemeContext";

type AttributeKey = keyof PlayerAttributes;

const ATTRIBUTE_CONFIG: {
  key: AttributeKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  category: "Offense" | "Physical";
}[] = [
  { key: "threePointer", label: "Three Pointer", icon: "basketball", category: "Offense" },
  { key: "midrange", label: "Midrange", icon: "ellipse", category: "Offense" },
  { key: "layup", label: "Layup", icon: "arrow-up-circle", category: "Offense" },
  { key: "ballHandling", label: "Ball Handling", icon: "git-branch", category: "Offense" },
  { key: "freeThrow", label: "Free Throw", icon: "basketball-outline", category: "Offense" },
  { key: "conditioning", label: "Conditioning", icon: "fitness", category: "Physical" },
];

function AttributeBar({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  const maxRating = 99;
  const pct = Math.min(maxRating, Math.max(0, value)) / maxRating;
  const tier =
    value >= 90 ? "A+" : value >= 80 ? "A" : value >= 70 ? "B+" : value >= 60 ? "B" : value >= 50 ? "C+" : value >= 40 ? "C" : "D";

  return (
    <View style={styles.attrRow}>
      <View style={styles.attrLabelRow}>
        <Ionicons name={icon} size={18} color={color} style={styles.attrIcon} />
        <Text style={styles.attrLabel}>{label}</Text>
      </View>
      <View style={styles.attrBarContainer}>
        <View style={[styles.attrBarBg, { borderColor: color + "40" }]}>
          <View
            style={[
              styles.attrBarFill,
              {
                width: `${pct * 100}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
        <View style={styles.attrMeta}>
          <Text style={[styles.attrValue, { color }]}>{value}</Text>
          <Text style={[styles.attrTier, { color: color + "CC" }]}>{tier}</Text>
        </View>
      </View>
    </View>
  );
}

export const AttributesScreen: React.FC = () => {
  const { theme } = useTheme();
  const [attrs, setAttrs] = useState<PlayerAttributes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    setLoading(true);
    try {
      const [shootingSets, drillCompletions, practiceDays, gamification] =
        await Promise.all([
          getShootingSets(),
          getDrillCompletions(),
          getPracticeDays(),
          getGamificationState(),
        ]);
      const calculated = calculateAttributes(
        shootingSets,
        drillCompletions,
        practiceDays,
        gamification
      );
      setAttrs(calculated);
    } catch (e) {
      console.error("Failed to load attributes:", e);
      setAttrs({
        threePointer: 0,
        midrange: 0,
        layup: 0,
        ballHandling: 0,
        freeThrow: 0,
        conditioning: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading attributes...
        </Text>
      </View>
    );
  }

  if (!attrs) return null;

  const offenseAttrs = ATTRIBUTE_CONFIG.filter((a) => a.category === "Offense");
  const physicalAttrs = ATTRIBUTE_CONFIG.filter((a) => a.category === "Physical");

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="stats-chart" size={28} color={theme.primary} />
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.text }]}>Player Attributes</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              0–99 scale • Always room to improve
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>OFFENSE</Text>
        {offenseAttrs.map(({ key, label, icon }) => (
          <AttributeBar
            key={key}
            label={label}
            value={attrs[key]}
            icon={icon}
            color={theme.primary}
          />
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>PHYSICAL</Text>
        {physicalAttrs.map(({ key, label, icon }) => (
          <AttributeBar
            key={key}
            label={label}
            value={attrs[key]}
            icon={icon}
            color={theme.primary}
          />
        ))}
      </View>

      <View style={[styles.footer, { borderColor: theme.border }]}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Ratings update as you log workouts, shooting, and drills.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    marginBottom: 20,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.9,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  attrRow: {
    marginBottom: 14,
  },
  attrLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  attrIcon: {
    marginRight: 8,
  },
  attrLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  attrBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  attrBarBg: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  attrBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  attrMeta: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    minWidth: 44,
  },
  attrValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  attrTier: {
    fontSize: 12,
    fontWeight: "700",
  },
  footer: {
    paddingTop: 8,
    borderTopWidth: 1,
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
  },
});
