import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { speak } from '../utils/tts';

interface WordTeachCardProps {
  word: string;
  translation: string;
  isReview: boolean;
  teaching: {
    definition: string;
    example: string;
    pronunciationTip: string;
    memoryTrick: string;
  } | null;
  isLoading: boolean;
  onNext: () => void;
  currentIndex: number;
  totalWords: number;
}

export function WordTeachCard({
  word,
  translation,
  isReview,
  teaching,
  isLoading,
  onNext,
  currentIndex,
  totalWords,
}: WordTeachCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.progress}>
          {currentIndex} / {totalWords}
        </Text>
        <View style={[styles.badge, isReview ? styles.badgeReview : styles.badgeNew]}>
          <Text style={styles.badgeText}>{isReview ? 'Review' : 'New'}</Text>
        </View>
      </View>

      <Text style={styles.word}>{word}</Text>
      <Text style={styles.translation}>{translation}</Text>

      <TouchableOpacity style={styles.listenButton} onPress={() => speak(word)}>
        <Text style={styles.listenButtonText}>Listen</Text>
      </TouchableOpacity>

      <View style={styles.teachingArea}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : teaching ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Definition</Text>
              <Text style={styles.sectionText}>{teaching.definition}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Example</Text>
              <Text style={[styles.sectionText, styles.italic]}>{teaching.example}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Pronunciation Tip</Text>
              <Text style={styles.sectionText}>{teaching.pronunciationTip}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Memory Trick</Text>
              <Text style={styles.sectionText}>{teaching.memoryTrick}</Text>
            </View>
          </>
        ) : null}
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={onNext}>
        <Text style={styles.nextButtonText}>Got it →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeNew: {
    backgroundColor: '#E3F2FD',
  },
  badgeReview: {
    backgroundColor: '#FFF3E0',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  word: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  translation: {
    fontSize: 18,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  listenButton: {
    alignSelf: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  listenButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  teachingArea: {
    minHeight: 80,
    marginBottom: 20,
  },
  loader: {
    marginVertical: 24,
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#333',
    lineHeight: 22,
  },
  italic: {
    fontStyle: 'italic',
    color: '#555',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
