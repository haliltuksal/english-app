import { useState, useEffect, useCallback } from 'react';
import { getScenarioById, Scenario } from '../scenarios/data';
import { sendMessage, ChatMessage } from '../ai/gemini';
import { parseAIResponse, ParsedResponse } from '../ai/parser';
import * as queries from '../db/queries';

export interface DisplayMessage {
  id: number;
  role: 'user' | 'ai';
  content: string;
  correction: string | null;
  newWord: string | null;
}

export function useChat(conversationId: number, scenarioType: string) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scenario: Scenario | null = scenarioType === 'free'
    ? null
    : getScenarioById(scenarioType) ?? null;

  // Load existing messages on mount
  useEffect(() => {
    (async () => {
      const rows = await queries.getMessages(conversationId);
      setMessages(rows.map((r) => ({
        id: r.id,
        role: r.role,
        content: r.content,
        correction: r.correction,
        newWord: r.new_word,
      })));
    })();
  }, [conversationId]);

  // Send initial AI greeting if no messages yet
  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      sendInitialGreeting();
    }
  }, []);

  const sendInitialGreeting = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const greeting = await sendMessage(scenario, [], 'Start the conversation. Greet the user and set the scene.');
      const parsed = parseAIResponse(greeting);
      const msgId = await queries.addMessage(
        conversationId, 'ai', parsed.content, parsed.correction, parsed.newWord
      );
      if (parsed.newWord) {
        await saveWord(parsed.newWord, parsed.content);
      }
      setMessages([{
        id: msgId, role: 'ai', content: parsed.content,
        correction: parsed.correction, newWord: parsed.newWord,
      }]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, scenario]);

  const send = useCallback(async (text: string) => {
    if (isLoading || isEnded) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    setError(null);

    const wantsEnd = trimmed.toLowerCase() === 'end';

    // Save user message
    const userMsgId = await queries.addMessage(conversationId, 'user', trimmed);
    const userMsg: DisplayMessage = {
      id: userMsgId, role: 'user', content: trimmed,
      correction: null, newWord: null,
    };
    setMessages((prev) => [...prev, userMsg]);

    setIsLoading(true);

    try {
      // Build history for API
      const currentMessages = await queries.getMessages(conversationId);
      const history: ChatMessage[] = currentMessages.slice(0, -1).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.role === 'user' ? m.content : `${m.content}${m.correction ? `\n---\nCorrection: ${m.correction}` : ''}${m.new_word ? `\nNew word: ${m.new_word}` : ''}`,
      }));

      // Check message count for auto-summary
      const msgCount = currentMessages.length;
      let userText = trimmed;
      if (wantsEnd || msgCount >= 15) {
        userText = wantsEnd ? trimmed : trimmed + '\n\n[This is message 15+. Please provide the conversation summary after your response.]';
      }

      const response = await sendMessage(scenario, history, userText);
      const parsed = parseAIResponse(response);

      const aiMsgId = await queries.addMessage(
        conversationId, 'ai', parsed.content, parsed.correction, parsed.newWord
      );

      if (parsed.newWord) {
        await saveWord(parsed.newWord, parsed.content);
      }

      const aiMsg: DisplayMessage = {
        id: aiMsgId, role: 'ai', content: parsed.content,
        correction: parsed.correction, newWord: parsed.newWord,
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (wantsEnd || msgCount >= 15) {
        setIsEnded(true);
        await queries.endConversation(conversationId, parsed.content);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, scenario, isLoading, isEnded]);

  return { messages, isLoading, isEnded, error, send };
}

async function saveWord(newWordStr: string, context: string): Promise<void> {
  const dashIndex = newWordStr.indexOf('—') !== -1
    ? newWordStr.indexOf('—')
    : newWordStr.indexOf(' — ') !== -1
      ? newWordStr.indexOf(' — ')
      : newWordStr.indexOf('-');

  if (dashIndex === -1) return;

  const word = newWordStr.substring(0, dashIndex).trim();
  const meaning = newWordStr.substring(dashIndex + 1).trim().replace(/^—\s*/, '');

  if (word && meaning) {
    await queries.addVocabulary(word, meaning, context, null);
  }
}
