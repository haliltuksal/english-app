import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getAllUserWords, UserWordWithWord } from '../../src/db/word-queries';
import { speak } from '../../src/utils/tts';

export default function VocabularyScreen() {
  const [words, setWords] = useState<UserWordWithWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setIsLoading(true);
        const w = await getAllUserWords();
        setWords(w);
        setIsLoading(false);
      })();
    }, [])
  );

  if (words.length === 0 && !isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No words learned yet. Start a session!</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={words}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => {
        const rate = item.seen_count > 0 ? Math.round((item.correct_count / item.seen_count) * 100) : 0;
        const rateColor = rate >= 80 ? '#4CAF50' : rate >= 60 ? '#FF9800' : '#F44336';
        return (
          <TouchableOpacity style={styles.wordRow} onPress={() => speak(item.word)}>
            <View style={styles.wordInfo}>
              <Text style={styles.wordText}>{item.word}</Text>
              <Text style={styles.translationText}>{item.translation}</Text>
              <Text style={styles.metaText}>
                Seen {item.seen_count}x | {item.difficulty}
              </Text>
            </View>
            <View style={styles.statsCol}>
              <Text style={[styles.rateText, { color: rateColor }]}>{rate}%</Text>
              <Text style={styles.statsLabel}>success</Text>
            </View>
          </TouchableOpacity>
        );
      }}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  list: { paddingVertical: 8, paddingBottom: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 15, color: '#999', textAlign: 'center' },
  wordRow: {
    backgroundColor: '#FFF', borderRadius: 10, padding: 14,
    marginHorizontal: 12, marginVertical: 4,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  wordInfo: { flex: 1 },
  wordText: { fontSize: 17, fontWeight: '600', color: '#333' },
  translationText: { fontSize: 14, color: '#007AFF', marginTop: 2 },
  metaText: { fontSize: 12, color: '#999', marginTop: 4 },
  statsCol: { alignItems: 'center', marginLeft: 12 },
  rateText: { fontSize: 20, fontWeight: '700' },
  statsLabel: { fontSize: 11, color: '#999', marginTop: 2 },
});
