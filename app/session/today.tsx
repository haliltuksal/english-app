import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useSession } from '../../src/hooks/useSession';
import { WordTeachCard } from '../../src/components/WordTeachCard';
import { QuizCard } from '../../src/components/QuizCard';
import { SessionProgress } from '../../src/components/SessionProgress';

export default function SessionScreen() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    session.initSession();
  }, []);

  if (session.phase === 'loading') {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Preparing your session...</Text>
      </View>
    );
  }

  if (session.phase === 'already_done') {
    return (
      <View style={styles.centered}>
        <Text style={styles.doneTitle}>Session Complete!</Text>
        {session.score > 0 && (
          <Text style={styles.doneScore}>Today's Score: {session.score}%</Text>
        )}
        {session.error && (
          <Text style={styles.errorText}>{session.error}</Text>
        )}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (session.phase === 'teaching') {
    const currentWord = session.words[session.currentIndex];
    return (
      <View style={styles.container}>
        <SessionProgress
          current={session.currentIndex + 1}
          total={session.words.length}
          phase="teaching"
        />
        <WordTeachCard
          word={currentWord.word}
          translation={currentWord.translation}
          isReview={currentWord.isReview}
          teaching={session.currentTeaching}
          isLoading={session.isLoadingTeaching}
          onNext={session.nextWord}
          currentIndex={session.currentIndex + 1}
          totalWords={session.words.length}
        />
      </View>
    );
  }

  if (session.phase === 'quiz') {
    const currentQuestion = session.quizQuestions[session.quizIndex];
    return (
      <View style={styles.container}>
        <SessionProgress
          current={session.quizIndex + 1}
          total={session.quizQuestions.length}
          phase="quiz"
        />
        <QuizCard
          question={currentQuestion}
          onAnswer={session.answerQuiz}
          questionIndex={session.quizIndex + 1}
          totalQuestions={session.quizQuestions.length}
        />
      </View>
    );
  }

  if (session.phase === 'results') {
    const correctCount = session.quizAnswers.filter(Boolean).length;
    const wrongCount = session.quizAnswers.length - correctCount;
    return (
      <View style={styles.centered}>
        <Text style={styles.resultsEmoji}>{session.score >= 80 ? 'Excellent!' : session.score >= 60 ? 'Good job!' : 'Keep practicing!'}</Text>
        <Text style={styles.resultsScore}>{session.score}%</Text>
        <Text style={styles.resultsDetail}>
          {correctCount} correct, {wrongCount} wrong out of {session.quizAnswers.length}
        </Text>
        <View style={styles.resultsStats}>
          <Text style={styles.resultsStat}>New words: {session.words.filter(w => !w.isReview).length}</Text>
          <Text style={styles.resultsStat}>Review words: {session.words.filter(w => w.isReview).length}</Text>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Error fallback
  return (
    <View style={styles.centered}>
      {session.error && <Text style={styles.errorText}>{session.error}</Text>}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F8F8F8' },
  loadingText: { fontSize: 16, color: '#999' },
  doneTitle: { fontSize: 22, fontWeight: '700', color: '#2E7D32' },
  doneScore: { fontSize: 28, fontWeight: '800', color: '#4CAF50', marginTop: 8 },
  errorText: { fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' },
  resultsEmoji: { fontSize: 28, fontWeight: '700', color: '#333', marginBottom: 8 },
  resultsScore: { fontSize: 64, fontWeight: '800', color: '#007AFF' },
  resultsDetail: { fontSize: 16, color: '#555', marginTop: 8 },
  resultsStats: { marginTop: 16, gap: 4, alignItems: 'center' },
  resultsStat: { fontSize: 14, color: '#777' },
  backButton: {
    backgroundColor: '#007AFF', borderRadius: 12, paddingHorizontal: 28,
    paddingVertical: 14, marginTop: 24,
  },
  backButtonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
