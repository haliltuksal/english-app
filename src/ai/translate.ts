import { getApiKey } from './gemini';

export async function translateWord(word: string, sentenceContext: string): Promise<{ meaning: string; example: string }> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('API key not set.');
  }

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
          content: 'You are a concise English-Turkish dictionary. Respond ONLY in the exact format requested. No extra text.',
        },
        {
          role: 'user',
          content: `Word: "${word}"
Context: "${sentenceContext}"

Respond in exactly this format (2 lines only):
meaning: [Turkish meaning of the word as used in this context]
example: [One short example sentence using this word]`,
        },
      ],
      temperature: 0.3,
      max_tokens: 100,
    }),
  });

  if (!response.ok) {
    throw new Error('Translation failed.');
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim() ?? '';
  if (!text) throw new Error('Empty translation response.');

  const meaningMatch = text.match(/meaning:\s*(.+)/i);
  const exampleMatch = text.match(/example:\s*(.+)/i);

  return {
    meaning: meaningMatch?.[1]?.trim() || 'Translation not available',
    example: exampleMatch?.[1]?.trim() || '',
  };
}
