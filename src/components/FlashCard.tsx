import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import { useState } from 'react';

interface FlashCardProps {
  word: string;
  turkishMeaning: string;
  exampleSentence: string | null;
  onCorrect: () => void;
  onIncorrect: () => void;
}

export function FlashCard({ word, turkishMeaning, exampleSentence, onCorrect, onIncorrect }: FlashCardProps) {
  const [revealed, setRevealed] = useState(false);

  const speak = () => {
    Speech.speak(word, { language: 'en-US', rate: 0.8 });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={speak}>
        <Text style={styles.word}>{word} 🔊</Text>
      </TouchableOpacity>
      {exampleSentence && <Text style={styles.example}>"{exampleSentence}"</Text>}
      {!revealed ? (
        <TouchableOpacity style={styles.revealButton} onPress={() => setRevealed(true)}>
          <Text style={styles.revealButtonText}>Show Meaning</Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.meaning}>{turkishMeaning}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.incorrectButton]} onPress={onIncorrect}>
              <Text style={styles.buttonText}>Bilmiyordum ❌</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.correctButton]} onPress={onCorrect}>
              <Text style={styles.buttonText}>Biliyordum ✅</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 24, marginHorizontal: 16,
    marginVertical: 8, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  word: { fontSize: 28, fontWeight: '700', color: '#333', marginBottom: 8 },
  example: { fontSize: 15, color: '#777', fontStyle: 'italic', textAlign: 'center', marginBottom: 16 },
  meaning: { fontSize: 22, fontWeight: '600', color: '#007AFF', marginVertical: 16 },
  revealButton: { marginTop: 16, backgroundColor: '#007AFF', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 },
  revealButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  button: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  incorrectButton: { backgroundColor: '#FFEBEE' },
  correctButton: { backgroundColor: '#E8F5E9' },
  buttonText: { fontSize: 14, fontWeight: '600' },
});
