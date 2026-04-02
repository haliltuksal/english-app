export interface ParsedResponse {
  content: string;
  correction: string | null;
  newWord: string | null;
}

export function parseAIResponse(raw: string): ParsedResponse {
  // Match --- separator with flexible whitespace (Gemini may add extra newlines)
  const separatorMatch = raw.match(/\n\s*---\s*\n/);

  if (!separatorMatch || separatorMatch.index === undefined) {
    return { content: raw.trim(), correction: null, newWord: null };
  }

  const content = raw.substring(0, separatorMatch.index).trim();
  const metaSection = raw.substring(separatorMatch.index + separatorMatch[0].length);

  let correction: string | null = null;
  let newWord: string | null = null;

  for (const line of metaSection.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('Correction:')) {
      const value = trimmed.substring('Correction:'.length).trim();
      correction = value.toLowerCase() === 'great!' ? null : value;
    } else if (trimmed.startsWith('New word:')) {
      newWord = trimmed.substring('New word:'.length).trim();
    } else if (trimmed.startsWith('**Correction:**')) {
      const value = trimmed.substring('**Correction:**'.length).trim();
      correction = value.toLowerCase() === 'great!' ? null : value;
    } else if (trimmed.startsWith('**New word:**')) {
      newWord = trimmed.substring('**New word:**'.length).trim();
    }
  }

  return { content, correction, newWord };
}
