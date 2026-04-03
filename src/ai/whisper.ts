import { Audio } from 'expo-av';
import { getApiKey } from './gemini';

let recording: Audio.Recording | null = null;

export async function startRecording(): Promise<void> {
  const permission = await Audio.requestPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Microphone permission is required for voice input.');
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording: newRecording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  recording = newRecording;
}

export async function stopRecordingAndTranscribe(): Promise<string> {
  if (!recording) {
    throw new Error('No active recording.');
  }

  await recording.stopAndUnloadAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
  });

  const uri = recording.getURI();
  recording = null;

  if (!uri) {
    throw new Error('Recording failed — no audio file.');
  }

  return transcribeAudio(uri);
}

export function cancelRecording(): void {
  if (recording) {
    recording.stopAndUnloadAsync().catch(() => {});
    recording = null;
  }
}

export function isCurrentlyRecording(): boolean {
  return recording !== null;
}

async function transcribeAudio(uri: string): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('API key not set. Please add your Groq API key in Settings.');
  }

  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  } as any);
  formData.append('model', 'whisper-large-v3');
  formData.append('language', 'en');
  formData.append('response_format', 'json');

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Transcription failed: ${response.status}`);
  }

  const data = await response.json();
  return data.text?.trim() || '';
}
