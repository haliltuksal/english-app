import { buildSystemPrompt } from '../src/ai/prompts';

describe('buildSystemPrompt', () => {
  test('builds prompt for a scenario', () => {
    const prompt = buildSystemPrompt({
      id: 'standup',
      title: 'Daily Standup',
      description: 'Report your progress',
      category: 'work',
      difficulty: 'easy',
      aiRole: 'a friendly tech lead running the daily standup',
      context: 'You are leading a daily standup meeting.',
    });

    expect(prompt).toContain('a friendly tech lead running the daily standup');
    expect(prompt).toContain('Turkish');
    expect(prompt).toContain('Correction');
    expect(prompt).toContain('New word');
  });

  test('builds prompt for free chat (no scenario)', () => {
    const prompt = buildSystemPrompt(null);
    expect(prompt).toContain('English conversation partner');
    expect(prompt).toContain('Turkish');
    expect(prompt).toContain('Correction');
    expect(prompt).toContain('New word');
  });
});
