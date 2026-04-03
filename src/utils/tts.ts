import * as Speech from 'expo-speech';

let isSpeaking = false;

export async function speak(text: string, rate: number = 0.85): Promise<void> {
  if (isSpeaking) {
    await Speech.stop();
    isSpeaking = false;
    return;
  }

  isSpeaking = true;
  Speech.speak(text, {
    language: 'en-US',
    rate,
    onDone: () => { isSpeaking = false; },
    onError: () => { isSpeaking = false; },
    onStopped: () => { isSpeaking = false; },
  });
}

export function stopSpeaking(): void {
  Speech.stop();
  isSpeaking = false;
}
