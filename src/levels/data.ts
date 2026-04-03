export interface Level {
  id: string;
  name: string;
  description: string;
  conversationsRequired: number;
  maxCorrectionRate: number;
  vocabMasteredRequired: number;
  aiComplexity: string;
}

export const levels: Level[] = [
  {
    id: 'A1',
    name: 'Beginner',
    description: 'Basic words and simple sentences',
    conversationsRequired: 5,
    maxCorrectionRate: 0.6,
    vocabMasteredRequired: 30,
    aiComplexity: 'Use very simple, short sentences with basic vocabulary. Speak slowly and clearly. Correct all mistakes gently. Avoid idioms and complex grammar.',
  },
  {
    id: 'A2',
    name: 'Elementary',
    description: 'Everyday topics and simple conversations',
    conversationsRequired: 10,
    maxCorrectionRate: 0.4,
    vocabMasteredRequired: 100,
    aiComplexity: 'Use simple, clear sentences about everyday topics. Introduce common phrases and expressions. Correct mistakes with brief explanations.',
  },
  {
    id: 'B1',
    name: 'Intermediate',
    description: 'Work topics and natural conversation',
    conversationsRequired: 15,
    maxCorrectionRate: 0.3,
    vocabMasteredRequired: 300,
    aiComplexity: 'Use natural English with moderate complexity. Include common idioms and phrasal verbs. Discuss work and technical topics. Correct grammar and suggest better word choices.',
  },
  {
    id: 'B2',
    name: 'Upper-Intermediate',
    description: 'Complex discussions and professional English',
    conversationsRequired: 20,
    maxCorrectionRate: 0.2,
    vocabMasteredRequired: 600,
    aiComplexity: 'Use complex sentence structures and varied vocabulary. Include idioms, collocations, and nuanced expressions. Discuss abstract and technical topics in depth. Only correct significant errors and suggest more natural alternatives.',
  },
  {
    id: 'C1',
    name: 'Advanced',
    description: 'Professional and academic discussions',
    conversationsRequired: 25,
    maxCorrectionRate: 0.15,
    vocabMasteredRequired: 1000,
    aiComplexity: 'Use sophisticated, native-level English. Include advanced vocabulary, complex grammar, and cultural references. Focus on nuance, tone, and register. Only correct subtle errors.',
  },
  {
    id: 'C2',
    name: 'Mastery',
    description: 'Native-level fluency',
    conversationsRequired: 0,
    maxCorrectionRate: 0.1,
    vocabMasteredRequired: 0,
    aiComplexity: 'Treat the user as a near-native speaker. Use the full range of English including rare vocabulary, complex rhetoric, and subtle humor. Challenge them with debates and nuanced arguments. Only flag the most subtle errors.',
  },
];

export function getLevelById(id: string): Level | undefined {
  return levels.find((l) => l.id === id);
}

export function getNextLevel(currentId: string): Level | undefined {
  const idx = levels.findIndex((l) => l.id === currentId);
  return idx >= 0 && idx < levels.length - 1 ? levels[idx + 1] : undefined;
}
