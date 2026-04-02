import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useVocabulary } from '../../src/hooks/useVocabulary';
import { FlashCard } from '../../src/components/FlashCard';
import { VocabularyRow } from '../../src/db/queries';

type Mode = 'list' | 'review';

export default function VocabularyScreen() {
  const { allWords, dueWords, isLoading, refresh, reviewWord } = useVocabulary();
  const [mode, setMode] = useState<Mode>('list');
  const [reviewIndex, setReviewIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      refresh();
      setReviewIndex(0);
    }, [])
  );

  const handleReview = async (word: VocabularyRow, correct: boolean) => {
    await reviewWord(word, correct);
    setReviewIndex((prev) => prev + 1);
  };

  if (mode === 'review') {
    if (reviewIndex >= dueWords.length) {
      return (
        <View style={styles.centered}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneText}>All done! No more words to review.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => { setMode('list'); setReviewIndex(0); }}>
            <Text style={styles.backButtonText}>Back to List</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentWord = dueWords[reviewIndex];
    return (
      <View style={styles.centered}>
        <Text style={styles.reviewProgress}>
          {reviewIndex + 1} / {dueWords.length}
        </Text>
        <FlashCard
          word={currentWord.word}
          turkishMeaning={currentWord.turkish_meaning}
          exampleSentence={currentWord.example_sentence}
          onCorrect={() => handleReview(currentWord, true)}
          onIncorrect={() => handleReview(currentWord, false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {dueWords.length > 0 && (
        <TouchableOpacity
          style={styles.reviewBanner}
          onPress={() => { setMode('review'); setReviewIndex(0); }}
        >
          <Text style={styles.reviewBannerText}>
            📝 {dueWords.length} words to review — Start
          </Text>
        </TouchableOpacity>
      )}

      {allWords.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No words yet. Start a conversation to build your vocabulary!</Text>
        </View>
      ) : (
        <FlatList
          data={allWords}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.wordRow}>
              <Text style={styles.wordText}>{item.word}</Text>
              <Text style={styles.meaningText}>{item.turkish_meaning}</Text>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F8F8', padding: 20 },
  list: { paddingBottom: 20 },
  reviewBanner: { backgroundColor: '#FF9800', padding: 14, margin: 12, borderRadius: 12, alignItems: 'center' },
  reviewBannerText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  wordRow: {
    backgroundColor: '#FFF', padding: 14, marginHorizontal: 12, marginVertical: 4,
    borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  wordText: { fontSize: 16, fontWeight: '600', color: '#333' },
  meaningText: { fontSize: 14, color: '#777' },
  emptyText: { fontSize: 15, color: '#999', textAlign: 'center' },
  doneEmoji: { fontSize: 48, marginBottom: 12 },
  doneText: { fontSize: 18, fontWeight: '600', color: '#333' },
  backButton: { marginTop: 16, backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backButtonText: { color: '#FFF', fontWeight: '600' },
  reviewProgress: { fontSize: 14, color: '#999', marginBottom: 12 },
});
