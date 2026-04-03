import { View, TextInput, FlatList, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { ChatBubble } from '../../src/components/ChatBubble';
import { WordPopup } from '../../src/components/WordPopup';
import { useChat } from '../../src/hooks/useChat';
import { startRecording, stopRecordingAndTranscribe, cancelRecording } from '../../src/ai/whisper';

export default function ChatScreen() {
  const { id, scenario } = useLocalSearchParams<{ id: string; scenario: string }>();
  const router = useRouter();
  const conversationId = parseInt(id, 10);
  const scenarioType = scenario ?? 'free';

  const { messages, isLoading, isEnded, error, send, assessmentResult } = useChat(conversationId, scenarioType);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [lookupWord, setLookupWord] = useState<string | null>(null);
  const [lookupContext, setLookupContext] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleWordTap = (word: string, context: string) => {
    setLookupWord(word);
    setLookupContext(context);
  };

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    send(inputText);
    setInputText('');
  };

  const handleMicPress = async () => {
    setVoiceError(null);
    if (isRecording) {
      setIsRecording(false);
      setIsTranscribing(true);
      try {
        const text = await stopRecordingAndTranscribe();
        if (text.trim()) {
          send(text.trim());
        } else {
          setVoiceError('Could not hear anything. Try again.');
        }
      } catch (e: any) {
        cancelRecording();
        setVoiceError(e.message || 'Voice input failed. Try typing instead.');
      } finally {
        setIsTranscribing(false);
      }
    } else {
      try {
        await startRecording();
        setIsRecording(true);
      } catch (e: any) {
        setVoiceError(e.message || 'Microphone not available.');
      }
    }
  };

  const renderEndBanner = () => {
    if (assessmentResult) {
      if (assessmentResult.passed) {
        return (
          <View style={styles.assessPassBanner}>
            <Text style={styles.assessPassTitle}>Level Up! You've reached {assessmentResult.level}!</Text>
            <Text style={styles.assessPassFeedback}>{assessmentResult.feedback}</Text>
            <TouchableOpacity style={styles.assessButton} onPress={() => router.back()}>
              <Text style={styles.assessButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        );
      } else {
        return (
          <View style={styles.assessFailBanner}>
            <Text style={styles.assessFailTitle}>Keep Practicing!</Text>
            <Text style={styles.assessFailFeedback}>{assessmentResult.feedback}</Text>
            <TouchableOpacity style={styles.assessButton} onPress={() => router.back()}>
              <Text style={styles.assessButtonText}>Keep Practicing</Text>
            </TouchableOpacity>
          </View>
        );
      }
    }

    return (
      <View style={styles.endedBanner}>
        <Text style={styles.endedText}>Conversation ended. Great practice!</Text>
      </View>
    );
  };

  return (<>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {(error || voiceError) && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText} numberOfLines={3}>{error || voiceError}</Text>
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
            onWordTap={handleWordTap}
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
        renderEndBanner()
      ) : (
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micButtonRecording]}
            onPress={handleMicPress}
            disabled={isLoading || isTranscribing}
          >
            <Text style={[styles.micButtonText, isRecording && styles.micButtonTextRecording]}>
              {isRecording ? 'Stop' : 'Mic'}
            </Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={isRecording ? 'Listening...' : 'Type or tap Mic'}
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
    <WordPopup
      word={lookupWord}
      sentenceContext={lookupContext}
      conversationId={conversationId}
      onClose={() => setLookupWord(null)}
    />
  </>
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
  micButtonText: { fontSize: 12, fontWeight: '700', color: '#555' },
  micButtonTextRecording: { color: '#FFF' },
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
  assessPassBanner: {
    backgroundColor: '#E8F5E9', padding: 20, alignItems: 'center', gap: 10,
  },
  assessPassTitle: {
    fontSize: 20, fontWeight: '700', color: '#2E7D32',
  },
  assessPassFeedback: {
    fontSize: 14, color: '#333', textAlign: 'center', lineHeight: 20,
  },
  assessFailBanner: {
    backgroundColor: '#FFF8E1', padding: 20, alignItems: 'center', gap: 10,
  },
  assessFailTitle: {
    fontSize: 18, fontWeight: '700', color: '#F57F17',
  },
  assessFailFeedback: {
    fontSize: 14, color: '#333', textAlign: 'center', lineHeight: 20,
  },
  assessButton: {
    backgroundColor: '#007AFF', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12, marginTop: 4,
  },
  assessButtonText: {
    color: '#FFF', fontWeight: '700', fontSize: 16,
  },
});
