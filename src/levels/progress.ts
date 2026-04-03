import { getLevelById, getNextLevel, Level } from './data';
import * as queries from '../db/queries';

export interface LevelProgress {
  currentLevel: Level;
  nextLevel: Level | undefined;
  conversationsCompleted: number;
  conversationsRequired: number;
  correctionRate: number;
  maxCorrectionRate: number;
  vocabMastered: number;
  vocabRequired: number;
  canTakeAssessment: boolean;
  isMaxLevel: boolean;
}

export async function getLevelProgress(): Promise<LevelProgress> {
  const progress = await queries.getProgress();
  const currentLevel = getLevelById(progress.current_level) ?? getLevelById('A2')!;
  const nextLevel = getNextLevel(progress.current_level);
  const correctionRate = await queries.getCorrectionRateAtLevel(progress.current_level, 10);
  const vocabMastered = await queries.getMasteredVocabCount();

  const isMaxLevel = !nextLevel;
  const meetsConversations = progress.conversations_at_level >= currentLevel.conversationsRequired;
  const meetsCorrectionRate = correctionRate <= currentLevel.maxCorrectionRate;
  const meetsVocab = vocabMastered >= currentLevel.vocabMasteredRequired;

  return {
    currentLevel,
    nextLevel,
    conversationsCompleted: progress.conversations_at_level,
    conversationsRequired: currentLevel.conversationsRequired,
    correctionRate,
    maxCorrectionRate: currentLevel.maxCorrectionRate,
    vocabMastered,
    vocabRequired: currentLevel.vocabMasteredRequired,
    canTakeAssessment: !isMaxLevel && meetsConversations && meetsCorrectionRate && meetsVocab,
    isMaxLevel,
  };
}

export async function levelUp(): Promise<string> {
  const progress = await queries.getProgress();
  const nextLevel = getNextLevel(progress.current_level);
  if (!nextLevel) throw new Error('Already at max level');
  await queries.updateLevel(nextLevel.id);
  return nextLevel.id;
}
