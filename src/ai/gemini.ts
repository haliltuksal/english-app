import * as SecureStore from 'expo-secure-store';
import { buildSystemPrompt } from './prompts';
import { Scenario } from '../scenarios/data';

const API_KEY_STORE = 'groq_api_key';

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(API_KEY_STORE);
}

export async function setApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORE, key);
}

export async function deleteApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORE);
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function sendMessage(
  scenario: Scenario | null,
  history: ChatMessage[],
  userMessage: string,
  levelId: string = 'A2',
  systemPromptOverride?: string
): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('API key not set. Please add your Groq API key in Settings.');
  }

  const systemPrompt = systemPromptOverride || buildSystemPrompt(scenario, levelId);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
    { role: 'user', content: userMessage },
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message || `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
