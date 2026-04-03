import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getSessionStreak, getLearnedWordCount, getWeakWords, getTodaySession, getCompletedSessionCount, getAverageQuizScore, UserWordWithWord } from '../db/word-queries';
import { getProgress } from '../db/queries';
import { seedWordBank } from '../data/wordbank';

export interface DashboardData {
  streak: number;
  totalWordsLearned: number;
  weakWords: UserWordWithWord[];
  todayCompleted: boolean;
  todayScore: number | null;
  currentLevel: string;
  completedSessions: number;
  averageScore: number;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      // Ensure word bank is seeded
      await seedWordBank();

      const [streak, totalWords, weakWords, todaySession, progress, completedSessions, avgScore] = await Promise.all([
        getSessionStreak(),
        getLearnedWordCount(),
        getWeakWords(10),
        getTodaySession(),
        getProgress(),
        getCompletedSessionCount(),
        getAverageQuizScore(),
      ]);

      setData({
        streak,
        totalWordsLearned: totalWords,
        weakWords,
        todayCompleted: todaySession?.completed === 1,
        todayScore: todaySession?.quiz_score ?? null,
        currentLevel: progress?.current_level ?? 'A2',
        completedSessions,
        averageScore: Math.round(avgScore),
      });
    } catch (e) {
      // Silently fail, will retry on focus
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { refresh(); }, [refresh])
  );

  return { data, isLoading, refresh };
}
