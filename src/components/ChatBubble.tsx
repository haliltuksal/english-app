import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { speak } from '../utils/tts';

interface ChatBubbleProps {
  role: 'user' | 'ai';
  content: string;
  correction: string | null;
  newWord: string | null;
  onWordTap?: (word: string, context: string) => void;
}

export function ChatBubble({ role, content, correction, newWord, onWordTap }: ChatBubbleProps) {
  const isUser = role === 'user';

  const speakWord = (text: string) => {
    const englishPart = text.split('—')[0].trim().split(' — ')[0].trim();
    speak(englishPart);
  };

  const renderTappableText = (text: string, textStyle: any) => {
    const words = text.split(/(\s+)/);
    return (
      <Text style={textStyle}>
        {words.map((segment, i) => {
          const cleanWord = segment.replace(/[^a-zA-Z'-]/g, '');
          if (cleanWord.length > 0 && onWordTap && !isUser) {
            return (
              <Text
                key={i}
                onPress={() => onWordTap(cleanWord, text)}
                style={styles.tappableWord}
              >
                {segment}
              </Text>
            );
          }
          return <Text key={i}>{segment}</Text>;
        })}
      </Text>
    );
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {renderTappableText(content, [styles.text, isUser ? styles.userText : styles.aiText])}
        {!isUser && (
          <View style={styles.listenRow}>
            <TouchableOpacity onPress={() => speak(content, 0.85)} style={styles.listenButton}>
              <Text style={styles.listenButtonText}>Listen</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => speak(content, 1.7)} style={styles.listenButton}>
              <Text style={styles.listenButtonText}>x2</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {!isUser && (correction || newWord) && (
        <View style={styles.metaContainer}>
          {correction && (
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Correction: {correction}</Text>
            </View>
          )}
          {newWord && (
            <TouchableOpacity style={styles.metaRow} onPress={() => speakWord(newWord)}>
              <Text style={styles.metaText}>New word: {newWord}</Text>
              <Text style={styles.listenSmall}> [hear]</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 4, paddingHorizontal: 12 },
  userContainer: { alignItems: 'flex-end' },
  aiContainer: { alignItems: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble: { backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#E9E9EB', borderBottomLeftRadius: 4 },
  text: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#FFF' },
  aiText: { color: '#333' },
  tappableWord: { textDecorationLine: 'underline', textDecorationStyle: 'dotted', textDecorationColor: '#AAA' },
  listenRow: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginTop: 6,
  },
  listenButton: {
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 10,
  },
  listenButtonText: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
  metaContainer: {
    maxWidth: '80%', marginTop: 4, paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: '#FFF9E6', borderRadius: 8, borderWidth: 1, borderColor: '#F0E6CC',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  metaText: { fontSize: 13, color: '#555', flex: 1 },
  listenSmall: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
});
