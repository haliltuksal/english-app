import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { speak } from '../utils/tts';

interface ChatBubbleProps {
  role: 'user' | 'ai';
  content: string;
  correction: string | null;
  newWord: string | null;
}

export function ChatBubble({ role, content, correction, newWord }: ChatBubbleProps) {
  const isUser = role === 'user';

  const speakWord = (text: string) => {
    const englishPart = text.split('—')[0].trim().split(' — ')[0].trim();
    speak(englishPart);
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.aiText]}>{content}</Text>
      </View>
      {!isUser && (
        <TouchableOpacity onPress={() => speak(content)} style={styles.speakButton}>
          <Text style={styles.speakButtonText}>🔊</Text>
        </TouchableOpacity>
      )}
      {!isUser && (correction || newWord) && (
        <View style={styles.metaContainer}>
          {correction && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>✏️ </Text>
              <Text style={styles.metaText}>{correction}</Text>
            </View>
          )}
          {newWord && (
            <TouchableOpacity style={styles.metaRow} onPress={() => speakWord(newWord)}>
              <Text style={styles.metaLabel}>💡 </Text>
              <Text style={styles.metaText}>{newWord}</Text>
              <Text style={styles.speakIcon}> 🔊</Text>
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
  metaContainer: {
    maxWidth: '80%', marginTop: 4, paddingHorizontal: 8, paddingVertical: 6,
    backgroundColor: '#FFF9E6', borderRadius: 8, borderWidth: 1, borderColor: '#F0E6CC',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  metaLabel: { fontSize: 13 },
  metaText: { fontSize: 13, color: '#555', flex: 1 },
  speakIcon: { fontSize: 13 },
  speakButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 2,
  },
  speakButtonText: {
    fontSize: 16,
  },
});
