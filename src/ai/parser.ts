export interface ParsedResponse {
  content: string;
  correction: string | null;
  newWord: string | null;
}

export function parseAIResponse(raw: string): ParsedResponse {
  const separatorIndex = raw.indexOf('\n---\n');

  if (separatorIndex === -1) {
    return { content: raw.trim(), correction: null, newWord: null };
  }

  const content = raw.substring(0, separatorIndex).trim();
  const metaSection = raw.substring(separatorIndex + 5);

  let correction: string | null = null;
  let newWord: string | null = null;

  for (const line of metaSection.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('Correction:')) {
      const value = trimmed.substring('Correction:'.length).trim();
      correction = value.toLowerCase() === 'great!' ? null : value;
    } else if (trimmed.startsWith('New word:')) {
      newWord = trimmed.substring('New word:'.length).trim();
    }
  }

  return { content, correction, newWord };
}
