import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useJaysonCoach } from "../hooks/useJaysonCoach";
import { formatPercent } from "../utils/number";
import { useTheme } from "../context/ThemeContext";

export const JaysonScreen: React.FC = () => {
  const { theme } = useTheme();
  const { loading, error, snapshot, insights, questions, selectedQuestion, reply, askQuestion, refresh } =
    useJaysonCoach();

  if (loading && !snapshot) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading coach report...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.headerTopRow}>
          <Text style={[styles.title, { color: theme.text }]}>Jayson Coach</Text>
          <Ionicons name="chatbubble-ellipses" size={24} color={theme.primary} />
        </View>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Game-speed feedback from your tracked workouts.
        </Text>
      </View>

      {error ? (
        <View style={[styles.errorCard, { backgroundColor: "#3A1D1D", borderColor: "#8B3A3A" }]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {snapshot ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Performance Snapshot</Text>
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Overall FG</Text>
              <Text style={[styles.metricValue, { color: theme.text }]}>{formatPercent(snapshot.overallFg)}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>7-Day Trend</Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: snapshot.trendDelta >= 0 ? "#39FF14" : "#FF6B35" },
                ]}
              >
                {snapshot.trendDelta >= 0 ? "+" : ""}
                {snapshot.trendDelta.toFixed(1)}%
              </Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Shot Volume</Text>
              <Text style={[styles.metricValue, { color: theme.text }]}>{snapshot.totalAttempts}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Streak</Text>
              <Text style={[styles.metricValue, { color: theme.text }]}>{snapshot.streakDays} days</Text>
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Coach Insights</Text>
        {insights.map((insight) => {
          const badgeColor =
            insight.priority === "high" ? "#FF6B35" : insight.priority === "positive" ? "#39FF14" : "#FFD700";
          return (
            <View key={insight.id} style={[styles.insightCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.insightHeader}>
                <Text style={[styles.insightTitle, { color: theme.text }]}>{insight.title}</Text>
                <View style={[styles.priorityPill, { backgroundColor: badgeColor + "22", borderColor: badgeColor }]}>
                  <Text style={[styles.priorityText, { color: badgeColor }]}>{insight.priority}</Text>
                </View>
              </View>
              <Text style={[styles.insightBody, { color: theme.textSecondary }]}>{insight.body}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Ask Jayson</Text>
        <View style={styles.questionWrap}>
          {questions.map((question) => (
            <TouchableOpacity
              key={question}
              style={[
                styles.questionButton,
                {
                  backgroundColor: selectedQuestion === question ? theme.primary : theme.card,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => askQuestion(question)}
            >
              <Text
                style={[
                  styles.questionText,
                  { color: selectedQuestion === question ? "#0A0A0A" : theme.text },
                ]}
              >
                {question}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[styles.replyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.replyLabel, { color: theme.textSecondary }]}>Coach Reply</Text>
          <Text style={[styles.replyText, { color: theme.text }]}>{reply}</Text>
        </View>
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
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "600",
  },
  headerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  summaryCard: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  insightCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  insightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  insightBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  priorityPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  priorityText: {
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  questionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  questionButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  questionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  replyCard: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  replyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  errorText: {
    color: "#FFD3D3",
    fontSize: 13,
    fontWeight: "600",
  },
});
