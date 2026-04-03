import { getApiKey } from './gemini';

interface TeachingContent {
  definition: string;      // Simple English definition
  example: string;         // Example sentence using the word
  pronunciationTip: string; // How to pronounce it
  memoryTrick: string;     // Mnemonic connecting to Turkish
}

export async function teachWord(word: string, translation: string, difficulty: string): Promise<TeachingContent> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('API key not set.');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an English teacher for Turkish speakers. The student is at ${difficulty} CEFR level. Teach vocabulary in a clear, memorable way. Respond ONLY in the exact JSON format requested.`,
        },
        {
          role: 'user',
          content: `Teach me the English word "${word}" (Turkish: ${translation}).

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
{
  "definition": "simple English definition (1-2 sentences, use ${difficulty}-appropriate language)",
  "example": "one clear example sentence using the word in a real-world context",
  "pronunciationTip": "phonetic hint for Turkish speakers (e.g., 'sounds like dey-ta-beys')",
  "memoryTrick": "a mnemonic or memory trick connecting the English word to something in Turkish or a vivid image (be creative and fun)"
}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Teaching failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim() ?? '';

  try {
    // Try to parse JSON directly
    const parsed = JSON.parse(text);
    return {
      definition: parsed.definition || 'Definition not available.',
      example: parsed.example || '',
      pronunciationTip: parsed.pronunciationTip || '',
      memoryTrick: parsed.memoryTrick || '',
    };
  } catch {
    // Fallback: try to extract from text if not valid JSON
    return {
      definition: extractField(text, 'definition') || 'Definition not available.',
      example: extractField(text, 'example') || '',
      pronunciationTip: extractField(text, 'pronunciationTip') || '',
      memoryTrick: extractField(text, 'memoryTrick') || '',
    };
  }
}

function extractField(text: string, field: string): string {
  const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]*)"`, 'i');
  const match = text.match(regex);
  return match?.[1] || '';
}

// --- Quiz Generation ---

export interface QuizQuestion {
  type: 'multiple_choice' | 'fill_blank';
  question: string;
  correctAnswer: string;
  options?: string[];      // For multiple choice (4 options)
  hint?: string;           // For fill-in-blank
}

export async function generateQuiz(
  words: { word: string; translation: string }[],
  allKnownTranslations: string[]
): Promise<QuizQuestion[]> {
  const questions: QuizQuestion[] = [];

  for (const w of words) {
    // Alternate between multiple choice and fill-in-blank
    if (questions.length % 2 === 0) {
      // Multiple choice: "What is the Turkish meaning of X?"
      const wrongOptions = allKnownTranslations
        .filter((t) => t !== w.translation)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // If not enough wrong options, generate generic ones
      while (wrongOptions.length < 3) {
        wrongOptions.push(`[wrong option ${wrongOptions.length + 1}]`);
      }

      const options = [...wrongOptions, w.translation].sort(() => Math.random() - 0.5);

      questions.push({
        type: 'multiple_choice',
        question: `What is the Turkish meaning of "${w.word}"?`,
        correctAnswer: w.translation,
        options,
      });
    } else {
      // Fill in the blank
      questions.push({
        type: 'fill_blank',
        question: `Write the English word for: "${w.translation}"`,
        correctAnswer: w.word.toLowerCase(),
        hint: `${w.word[0]}${'_'.repeat(w.word.length - 1)}`,
      });
    }
  }

  return questions;
}

export function checkAnswer(question: QuizQuestion, answer: string): boolean {
  if (question.type === 'multiple_choice') {
    return answer === question.correctAnswer;
  }
  // Fill in blank: case-insensitive, trim whitespace
  return answer.trim().toLowerCase() === question.correctAnswer.toLowerCase();
}
