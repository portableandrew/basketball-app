import { useCallback, useEffect, useMemo, useState } from "react";
import { getPracticeDays, getShootingSets, getShotSpots } from "../storage/storage";
import {
  answerCoachQuestion,
  buildCoachAnalysis,
  CoachInsight,
  CoachSnapshot,
} from "../utils/jaysonCoach";

const DEFAULT_QUESTIONS = [
  "What should I focus on this week?",
  "Where is my biggest weakness?",
  "Am I improving lately?",
  "Give me a 30-minute shooting workout.",
  "How do I fix my corner 3?",
];

export function useJaysonCoach() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<CoachSnapshot | null>(null);
  const [insights, setInsights] = useState<CoachInsight[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState(DEFAULT_QUESTIONS[0]);
  const [reply, setReply] = useState<string>("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [sets, spots, practiceDays] = await Promise.all([
        getShootingSets(),
        getShotSpots(),
        getPracticeDays(),
      ]);

      const analysis = buildCoachAnalysis(sets, spots, practiceDays);
      setSnapshot(analysis.snapshot);
      setInsights(analysis.insights);
      setReply(answerCoachQuestion(selectedQuestion, analysis.snapshot, analysis.insights));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load coach data");
    } finally {
      setLoading(false);
    }
  }, [selectedQuestion]);

  useEffect(() => {
    load();
  }, [load]);

  const askQuestion = useCallback(
    (question: string) => {
      setSelectedQuestion(question);
      if (!snapshot) return;
      setReply(answerCoachQuestion(question, snapshot, insights));
    },
    [insights, snapshot]
  );

  return useMemo(
    () => ({
      loading,
      error,
      snapshot,
      insights,
      selectedQuestion,
      reply,
      questions: DEFAULT_QUESTIONS,
      askQuestion,
      refresh: load,
    }),
    [askQuestion, error, insights, load, loading, reply, selectedQuestion, snapshot]
  );
}
