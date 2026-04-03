import { useState, useEffect, useCallback, useRef } from 'react';
import { getScenarioById, Scenario } from '../scenarios/data';
import { sendMessage, ChatMessage } from '../ai/gemini';
import { parseAIResponse } from '../ai/parser';
import { buildAssessmentPrompt, parseAssessmentResult, AssessmentResult } from '../levels/assessment';
import { levelUp } from '../levels/progress';
import * as queries from '../db/queries';
import { getProgress, incrementCorrectionCount, incrementUserMessageCount, incrementConversationsAtLevel, createAssessment } from '../db/queries';

export interface DisplayMessage {
  id: number;
  role: 'user' | 'ai';
  content: string;
  correction: string | null;
  newWord: string | null;
}

export function useChat(conversationId: number, scenarioType: string) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true); // start true to prevent double greeting
  const [isEnded, setIsEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [levelId, setLevelId] = useState<string>('A2');
  const [assessmentResult, setAssessmentResult] = useState<{ passed: boolean; feedback: string; level: string } | null>(null);
  const initializedRef = useRef(false);

  const isAssessment = scenarioType === 'assessment';

  const scenario: Scenario | null = scenarioType === 'free' || isAssessment
    ? null
    : getScenarioById(scenarioType) ?? null;

  // Load existing messages on mount, then send greeting if needed
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    (async () => {
      try {
        const progress = await getProgress();
        const currentLevelId = progress?.current_level ?? 'A2';
        setLevelId(currentLevelId);

        const rows = await queries.getMessages(conversationId);
        const loaded = rows.map((r) => ({
          id: r.id,
          role: r.role as 'user' | 'ai',
          content: r.content,
          correction: r.correction,
          newWord: r.new_word,
        }));

        if (loaded.length > 0) {
          // Resumed conversation — just load messages
          setMessages(loaded);
          // Check if conversation was already ended
          const conv = (await queries.getActiveConversations()).find(c => c.id === conversationId);
          if (!conv) setIsEnded(true);
          setIsLoading(false);
        } else {
          // New conversation — send initial AI greeting
          setIsLoading(true);

          const assessmentPrompt = isAssessment ? buildAssessmentPrompt(currentLevelId) : undefined;
          const greeting = await sendMessage(
            scenario,
            [],
            'Start the conversation. Greet the user and set the scene.',
            currentLevelId,
            assessmentPrompt
          );
          const parsed = parseAIResponse(greeting);

          // Save hidden "start" user message + AI greeting to DB
          // This ensures history always starts with user role for Gemini API
          await queries.addMessage(conversationId, 'user', '[conversation started]');
          const aiMsgId = await queries.addMessage(
            conversationId, 'ai', parsed.content, parsed.correction, parsed.newWord
          );

          if (parsed.newWord) {
            await saveWord(parsed.newWord, parsed.content, conversationId);
          }

          // Only show AI greeting to user (hide the system user message)
          setMessages([{
            id: aiMsgId, role: 'ai', content: parsed.content,
            correction: parsed.correction, newWord: parsed.newWord,
          }]);
          setIsLoading(false);
        }
      } catch (e: any) {
        setError(e.message);
        setIsLoading(false);
      }
    })();
  }, [conversationId]);

  const send = useCallback(async (text: string) => {
    if (isLoading || isEnded) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    setError(null);

    const wantsEnd = trimmed.toLowerCase() === 'end';

    try {
      // Save user message
      const userMsgId = await queries.addMessage(conversationId, 'user', trimmed);
      await incrementUserMessageCount(conversationId);
      const userMsg: DisplayMessage = {
        id: userMsgId, role: 'user', content: trimmed,
        correction: null, newWord: null,
      };
      setMessages((prev) => [...prev, userMsg]);

      setIsLoading(true);

      // Build history for API — get all DB messages
      const currentMessages = await queries.getMessages(conversationId);
      // Exclude the last message (current user message) since sendMessage adds it
      const history: ChatMessage[] = currentMessages.slice(0, -1).map((m) => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        text: m.content,
      }));

      // Check message count for auto-summary
      const msgCount = currentMessages.length;
      let userText = trimmed;
      if (wantsEnd && !isAssessment) {
        userText = 'end';
      } else if (msgCount >= 30 && !isAssessment) {
        // 30 total messages ≈ 15 exchanges
        userText = trimmed + '\n\n[This is message 15+. Please provide the conversation summary after your response.]';
      }

      const assessmentPrompt = isAssessment ? buildAssessmentPrompt(levelId) : undefined;
      const response = await sendMessage(scenario, history, userText, levelId, assessmentPrompt);
      const parsed = parseAIResponse(response);

      if (parsed.correction !== null) {
        await incrementCorrectionCount(conversationId);
      }

      const aiMsgId = await queries.addMessage(
        conversationId, 'ai', parsed.content, parsed.correction, parsed.newWord
      );

      if (parsed.newWord) {
        await saveWord(parsed.newWord, parsed.content, conversationId);
      }

      const aiMsg: DisplayMessage = {
        id: aiMsgId, role: 'ai', content: parsed.content,
        correction: parsed.correction, newWord: parsed.newWord,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Check for assessment result
      if (isAssessment) {
        const result = parseAssessmentResult(response);
        if (result) {
          await createAssessment(levelId, conversationId, result.passed, result.feedback);
          if (result.passed) {
            await levelUp();
          }
          setAssessmentResult(result);
          setIsEnded(true);
          await queries.endConversation(conversationId, parsed.content);
          await incrementConversationsAtLevel();
        }
      } else if (wantsEnd || msgCount >= 30) {
        setIsEnded(true);
        await queries.endConversation(conversationId, parsed.content);
        await incrementConversationsAtLevel();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, scenario, isLoading, isEnded, levelId, isAssessment]);

  return { messages, isLoading, isEnded, error, send, assessmentResult };
}

async function saveWord(newWordStr: string, context: string, conversationId: number): Promise<void> {
  // Try em-dash first (expected format), then spaced dash, then last resort hyphen
  // Use regex to find " — " or " — " pattern to avoid splitting hyphenated words like "self-taught"
  let word: string;
  let meaning: string;

  const emDashMatch = newWordStr.match(/^(.+?)\s*—\s*(.+)$/);
  if (emDashMatch) {
    word = emDashMatch[1].trim();
    meaning = emDashMatch[2].trim();
  } else {
    // Fallback: split on " - " (spaced hyphen) to avoid breaking "self-taught"
    const spacedHyphenIndex = newWordStr.indexOf(' - ');
    if (spacedHyphenIndex === -1) return;
    word = newWordStr.substring(0, spacedHyphenIndex).trim();
    meaning = newWordStr.substring(spacedHyphenIndex + 3).trim();
  }

  if (word && meaning) {
    await queries.addVocabulary(word, meaning, context, conversationId);
  }
}
