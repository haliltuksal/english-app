import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useDashboard } from '../../src/hooks/useDashboard';
import { DashboardStats } from '../../src/components/DashboardStats';
import { speak } from '../../src/utils/tts';

export default function DashboardScreen() {
  const router = useRouter();
  const { data, isLoading } = useDashboard();

  const startSession = () => {
    router.push('/session/today');
  };

  if (isLoading || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Stats */}
      <DashboardStats
        streak={data.streak}
        totalWordsLearned={data.totalWordsLearned}
        completedSessions={data.completedSessions}
        averageScore={data.averageScore}
        currentLevel={data.currentLevel}
      />

      {/* Today's Session CTA */}
      {data.todayCompleted ? (
        <View style={styles.doneCard}>
          <Text style={styles.doneTitle}>Today's Session Complete!</Text>
          <Text style={styles.doneScore}>Score: {data.todayScore}%</Text>
          <TouchableOpacity style={styles.reviewButton} onPress={startSession}>
            <Text style={styles.reviewButtonText}>Review Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.startButton} onPress={startSession}>
          <Text style={styles.startButtonText}>Start Today's Session</Text>
          <Text style={styles.startButtonSub}>Learn new words + review</Text>
        </TouchableOpacity>
      )}

      {/* Weak Words */}
      {data.weakWords.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weak Words (need practice)</Text>
          {data.weakWords.map((w) => (
            <TouchableOpacity
              key={w.id}
              style={styles.weakWordRow}
              onPress={() => speak(w.word)}
            >
              <View style={styles.weakWordInfo}>
                <Text style={styles.weakWord}>{w.word}</Text>
                <Text style={styles.weakWordTranslation}>{w.translation}</Text>
              </View>
              <Text style={styles.weakWordRate}>
                {w.seen_count > 0 ? Math.round((w.correct_count / w.seen_count) * 100) : 0}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  content: { paddingBottom: 30 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#999' },
  startButton: {
    backgroundColor: '#007AFF', borderRadius: 16, padding: 20,
    marginHorizontal: 16, marginTop: 16, alignItems: 'center',
  },
  startButtonText: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  startButtonSub: { fontSize: 14, color: '#B3D9FF', marginTop: 4 },
  doneCard: {
    backgroundColor: '#E8F5E9', borderRadius: 16, padding: 20,
    marginHorizontal: 16, marginTop: 16, alignItems: 'center',
  },
  doneTitle: { fontSize: 18, fontWeight: '700', color: '#2E7D32' },
  doneScore: { fontSize: 24, fontWeight: '800', color: '#4CAF50', marginTop: 4 },
  reviewButton: {
    backgroundColor: '#4CAF50', borderRadius: 10, paddingHorizontal: 20,
    paddingVertical: 10, marginTop: 12,
  },
  reviewButtonText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 10 },
  weakWordRow: {
    backgroundColor: '#FFF', borderRadius: 10, padding: 14,
    marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderLeftWidth: 3, borderLeftColor: '#FF9800',
  },
  weakWordInfo: { flex: 1 },
  weakWord: { fontSize: 16, fontWeight: '600', color: '#333' },
  weakWordTranslation: { fontSize: 13, color: '#777', marginTop: 2 },
  weakWordRate: { fontSize: 16, fontWeight: '700', color: '#FF9800' },
});
