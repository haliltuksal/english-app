import * as Speech from 'expo-speech';

let isSpeaking = false;

export async function speak(text: string): Promise<void> {
  if (isSpeaking) {
    await Speech.stop();
    isSpeaking = false;
    return;
  }

  isSpeaking = true;
  Speech.speak(text, {
    language: 'en-US',
    rate: 0.85,
    onDone: () => { isSpeaking = false; },
    onError: () => { isSpeaking = false; },
    onStopped: () => { isSpeaking = false; },
  });
}

export function stopSpeaking(): void {
  Speech.stop();
  isSpeaking = false;
}
