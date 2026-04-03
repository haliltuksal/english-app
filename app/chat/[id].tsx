import { View, TextInput, FlatList, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useRef } from 'react';
import { ChatBubble } from '../../src/components/ChatBubble';
import { useChat } from '../../src/hooks/useChat';
import { startRecording, stopRecordingAndTranscribe, cancelRecording } from '../../src/ai/whisper';

export default function ChatScreen() {
  const { id, scenario } = useLocalSearchParams<{ id: string; scenario: string }>();
  const conversationId = parseInt(id, 10);
  const scenarioType = scenario ?? 'free';

  const { messages, isLoading, isEnded, error, send } = useChat(conversationId, scenarioType);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    send(inputText);
    setInputText('');
  };

  const handleMicPress = async () => {
    if (isRecording) {
      // Stop and transcribe
      setIsRecording(false);
      setIsTranscribing(true);
      try {
        const text = await stopRecordingAndTranscribe();
        if (text.trim()) {
          send(text.trim());
        }
      } catch (e: any) {
        // Show transcription in input if it fails
        cancelRecording();
      } finally {
        setIsTranscribing(false);
      }
    } else {
      // Start recording
      try {
        await startRecording();
        setIsRecording(true);
      } catch (e: any) {
        // Permission denied or other error
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText} numberOfLines={3}>{error}</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ChatBubble
            role={item.role}
            content={item.content}
            correction={item.correction}
            newWord={item.newWord}
          />
        )}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {(isLoading || isTranscribing) && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>{isTranscribing ? 'Transcribing...' : 'Typing...'}</Text>
        </View>
      )}

      {isEnded ? (
        <View style={styles.endedBanner}>
          <Text style={styles.endedText}>Conversation ended. Great practice! 🎉</Text>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micButtonRecording]}
            onPress={handleMicPress}
            disabled={isLoading || isTranscribing}
          >
            <Text style={styles.micButtonText}>{isRecording ? '⏹' : '🎤'}</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={isRecording ? 'Recording...' : 'Type or tap 🎤'}
            placeholderTextColor="#999"
            multiline
            editable={!isLoading && !isRecording}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  messageList: { paddingVertical: 12, flexGrow: 1, justifyContent: 'flex-end' },
  inputContainer: {
    flexDirection: 'row', padding: 8, paddingBottom: 12, backgroundColor: '#FFF',
    borderTopWidth: 1, borderTopColor: '#E0E0E0', alignItems: 'flex-end',
  },
  micButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0',
    justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  micButtonRecording: {
    backgroundColor: '#FF3B30',
  },
  micButtonText: { fontSize: 20 },
  input: {
    flex: 1, backgroundColor: '#F0F0F0', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, maxHeight: 100,
  },
  sendButton: { backgroundColor: '#007AFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginLeft: 8 },
  sendButtonDisabled: { backgroundColor: '#B0C4DE' },
  sendButtonText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  typingIndicator: { paddingHorizontal: 20, paddingVertical: 8 },
  typingText: { color: '#999', fontStyle: 'italic' },
  errorBanner: { backgroundColor: '#FFEBEE', padding: 10 },
  errorText: { color: '#D32F2F', fontSize: 13, textAlign: 'center' },
  endedBanner: { backgroundColor: '#E8F5E9', padding: 16, alignItems: 'center' },
  endedText: { fontSize: 15, fontWeight: '600', color: '#2E7D32' },
});
