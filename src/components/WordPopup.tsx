import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { translateWord } from '../ai/translate';
import { speak } from '../utils/tts';
import * as queries from '../db/queries';

interface WordPopupProps {
  word: string | null;
  sentenceContext: string;
  conversationId: number;
  onClose: () => void;
}

export function WordPopup({ word, sentenceContext, conversationId, onClose }: WordPopupProps) {
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (word) {
      lookup();
      setSaved(false);
      setError(null);
    }
  }, [word]);

  const lookup = async () => {
    if (!word) return;
    setIsLoading(true);
    setMeaning('');
    setExample('');
    try {
      const result = await translateWord(word, sentenceContext);
      setMeaning(result.meaning);
      setExample(result.example);
    } catch (e: any) {
      setError('Could not translate. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveToVocabulary = async () => {
    if (!word || !meaning) return;
    await queries.addVocabulary(word, meaning, example || sentenceContext, conversationId);
    setSaved(true);
  };

  if (!word) return null;

  return (
    <Modal transparent animationType="fade" visible={!!word} onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.popup} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => speak(word)}>
              <Text style={styles.word}>{word} [hear]</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>X</Text>
            </TouchableOpacity>
          </View>

          {isLoading && (
            <ActivityIndicator size="small" color="#007AFF" style={styles.loader} />
          )}

          {error && <Text style={styles.error}>{error}</Text>}

          {meaning && !isLoading && (
            <>
              <Text style={styles.meaningLabel}>Turkish</Text>
              <Text style={styles.meaning}>{meaning}</Text>

              {example ? (
                <>
                  <Text style={styles.exampleLabel}>Example</Text>
                  <Text style={styles.example}>{example}</Text>
                </>
              ) : null}

              <TouchableOpacity
                style={[styles.saveButton, saved && styles.saveButtonSaved]}
                onPress={saveToVocabulary}
                disabled={saved}
              >
                <Text style={[styles.saveButtonText, saved && styles.saveButtonTextSaved]}>
                  {saved ? 'Saved!' : 'Save to Vocabulary'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  popup: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20,
    width: '100%', maxWidth: 340,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  word: { fontSize: 22, fontWeight: '700', color: '#333' },
  closeButton: { fontSize: 18, fontWeight: '700', color: '#999', padding: 4 },
  loader: { marginVertical: 16 },
  error: { fontSize: 14, color: '#D32F2F', marginVertical: 8 },
  meaningLabel: { fontSize: 12, fontWeight: '600', color: '#999', textTransform: 'uppercase', marginTop: 4 },
  meaning: { fontSize: 18, fontWeight: '600', color: '#007AFF', marginTop: 4, marginBottom: 8 },
  exampleLabel: { fontSize: 12, fontWeight: '600', color: '#999', textTransform: 'uppercase', marginTop: 4 },
  example: { fontSize: 14, color: '#555', fontStyle: 'italic', marginTop: 4, marginBottom: 12, lineHeight: 20 },
  saveButton: {
    backgroundColor: '#007AFF', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 8,
  },
  saveButtonSaved: { backgroundColor: '#E8F5E9' },
  saveButtonText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  saveButtonTextSaved: { color: '#4CAF50' },
});
