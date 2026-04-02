import { useState, useEffect, useCallback } from 'react';
import * as queries from '../db/queries';
import { VocabularyRow } from '../db/queries';
import { calculateNextReview } from '../utils/spaced-repetition';

export function useVocabulary() {
  const [allWords, setAllWords] = useState<VocabularyRow[]>([]);
  const [dueWords, setDueWords] = useState<VocabularyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const [all, due] = await Promise.all([
      queries.getAllVocabulary(),
      queries.getDueVocabulary(),
    ]);
    setAllWords(all);
    setDueWords(due);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const reviewWord = useCallback(async (word: VocabularyRow, correct: boolean) => {
    const result = calculateNextReview({
      repetitionCount: word.repetition_count,
      easeFactor: word.ease_factor,
      correct,
    });

    await queries.updateVocabularyReview(
      word.id,
      result.nextReviewAt,
      result.easeFactor,
      result.repetitionCount
    );

    await refresh();
  }, [refresh]);

  return { allWords, dueWords, isLoading, refresh, reviewWord };
}
