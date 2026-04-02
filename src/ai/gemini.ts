import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import * as SecureStore from 'expo-secure-store';
import { buildSystemPrompt } from './prompts';
import { Scenario } from '../scenarios/data';

const API_KEY_STORE = 'gemini_api_key';

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
  userMessage: string
): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('API key not set. Please add your Gemini API key in Settings.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const systemPrompt = buildSystemPrompt(scenario);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
  });

  const contents: Content[] = history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  const chat = model.startChat({
    history: contents,
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
