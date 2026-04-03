import { useState, useCallback } from 'react';
import { WordRow, UserWordWithWord, getNewWordsForLevel, getDueReviewWords, getSeenWordIds, createUserWord, updateUserWordReview, createDailySession, completeSession, getTodaySession } from '../db/word-queries';
import { getProgress } from '../db/queries';
import { teachWord, generateQuiz, checkAnswer, QuizQuestion, TeachingContent } from '../ai/teach';
import { calculateNextReview } from '../utils/spaced-repetition';

export type SessionPhase = 'loading' | 'teaching' | 'quiz' | 'results' | 'already_done';

export interface SessionWord {
  wordId: number;
  word: string;
  translation: string;
  difficulty: string;
  isReview: boolean;
  teaching?: TeachingContent;
}

export interface SessionState {
  phase: SessionPhase;
  words: SessionWord[];
  currentIndex: number;
  currentTeaching: TeachingContent | null;
  isLoadingTeaching: boolean;
  quizQuestions: QuizQuestion[];
  quizIndex: number;
  quizAnswers: boolean[];
  score: number;
  sessionId: number | null;
  error: string | null;
}

export function useSession() {
  const [state, setState] = useState<SessionState>({
    phase: 'loading',
    words: [],
    currentIndex: 0,
    currentTeaching: null,
    isLoadingTeaching: false,
    quizQuestions: [],
    quizIndex: 0,
    quizAnswers: [],
    score: 0,
    sessionId: null,
    error: null,
  });

  const initSession = useCallback(async () => {
    try {
      // Check if today's session already exists and is completed
      const existing = await getTodaySession();
      if (existing && existing.completed) {
        setState(s => ({ ...s, phase: 'already_done', score: existing.quiz_score ?? 0 }));
        return;
      }

      // Get user's current level
      const progress = await getProgress();
      const level = progress?.current_level ?? 'A2';

      // Get words already seen
      const seenIds = await getSeenWordIds();

      // Get review words (due for spaced repetition)
      const reviewWords = await getDueReviewWords(5);

      // Get new words for current level
      const newWordCount = 15 - reviewWords.length;
      const newWords = await getNewWordsForLevel(level, seenIds, Math.max(newWordCount, 5));

      const sessionWords: SessionWord[] = [
        ...newWords.map(w => ({
          wordId: w.id, word: w.word, translation: w.translation,
          difficulty: w.difficulty, isReview: false,
        })),
        ...reviewWords.map(w => ({
          wordId: w.word_id, word: w.word, translation: w.translation,
          difficulty: w.difficulty, isReview: true,
        })),
      ];

      if (sessionWords.length === 0) {
        setState(s => ({ ...s, phase: 'already_done', error: 'No words available for your level.' }));
        return;
      }

      // Create user_words entries for new words
      for (const w of sessionWords) {
        if (!w.isReview) {
          await createUserWord(w.wordId);
        }
      }

      // Create session in DB
      const wordIds = sessionWords.map(w => w.wordId);
      const sessionId = await createDailySession(
        wordIds,
        newWords.length,
        reviewWords.length
      );

      setState(s => ({
        ...s,
        phase: 'teaching',
        words: sessionWords,
        currentIndex: 0,
        sessionId,
        error: null,
      }));

      // Load teaching for first word
      await loadTeaching(sessionWords[0], 0);
    } catch (e: any) {
      setState(s => ({ ...s, error: e.message, phase: 'loading' }));
    }
  }, []);

  const loadTeaching = async (word: SessionWord, index: number) => {
    setState(s => ({ ...s, isLoadingTeaching: true, currentTeaching: null }));
    try {
      const teaching = await teachWord(word.word, word.translation, word.difficulty);
      setState(s => ({
        ...s,
        currentTeaching: teaching,
        isLoadingTeaching: false,
        currentIndex: index,
      }));
    } catch (e: any) {
      // Fallback teaching if AI fails
      setState(s => ({
        ...s,
        currentTeaching: {
          definition: `${word.word} means "${word.translation}" in Turkish.`,
          example: '',
          pronunciationTip: '',
          memoryTrick: '',
        },
        isLoadingTeaching: false,
        currentIndex: index,
      }));
    }
  };

  const nextWord = useCallback(async () => {
    const nextIdx = state.currentIndex + 1;
    if (nextIdx >= state.words.length) {
      // Teaching phase done, start quiz
      const allTranslations = state.words.map(w => w.translation);
      const quizWords = state.words.map(w => ({ word: w.word, translation: w.translation }));
      const questions = await generateQuiz(quizWords, allTranslations);
      setState(s => ({
        ...s,
        phase: 'quiz',
        quizQuestions: questions,
        quizIndex: 0,
        quizAnswers: [],
      }));
    } else {
      await loadTeaching(state.words[nextIdx], nextIdx);
    }
  }, [state.currentIndex, state.words]);

  const answerQuiz = useCallback(async (answer: string) => {
    const question = state.quizQuestions[state.quizIndex];
    const correct = checkAnswer(question, answer);
    const newAnswers = [...state.quizAnswers, correct];

    // Find the word for this question and update stats
    const wordEntry = state.words[state.quizIndex];
    if (wordEntry) {
      const review = calculateNextReview({
        repetitionCount: correct ? 1 : 0,
        easeFactor: 2.5,
        correct,
      });
      await updateUserWordReview(
        wordEntry.wordId, correct, review.nextReviewAt, review.easeFactor
      );
    }

    const nextQuizIdx = state.quizIndex + 1;
    if (nextQuizIdx >= state.quizQuestions.length) {
      // Quiz done
      const correctCount = newAnswers.filter(Boolean).length;
      const score = Math.round((correctCount / newAnswers.length) * 100);

      if (state.sessionId) {
        await completeSession(state.sessionId, score);
      }

      setState(s => ({
        ...s,
        quizAnswers: newAnswers,
        score,
        phase: 'results',
      }));
    } else {
      setState(s => ({
        ...s,
        quizAnswers: newAnswers,
        quizIndex: nextQuizIdx,
      }));
    }
  }, [state.quizQuestions, state.quizIndex, state.quizAnswers, state.words, state.sessionId]);

  return {
    ...state,
    initSession,
    nextWord,
    answerQuiz,
  };
}
