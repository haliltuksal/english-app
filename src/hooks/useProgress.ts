import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getLevelProgress, LevelProgress } from '../levels/progress';

export function useProgress() {
  const [progress, setProgress] = useState<LevelProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const p = await getLevelProgress();
      setProgress(p);
    } catch {
      // DB not ready yet, will retry on next focus
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { refresh(); }, [refresh])
  );

  return { progress, isLoading, refresh };
}
