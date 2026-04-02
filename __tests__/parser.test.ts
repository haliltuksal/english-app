import { parseAIResponse } from '../src/ai/parser';

describe('parseAIResponse', () => {
  test('parses full response with correction and new word', () => {
    const raw = `That sounds great! Tell me more about the project you worked on.
---
Correction: "I worked on fixing" (not "worked on fix")
New word: deadline — son teslim tarihi`;

    const result = parseAIResponse(raw);
    expect(result.content).toBe('That sounds great! Tell me more about the project you worked on.');
    expect(result.correction).toBe('"I worked on fixing" (not "worked on fix")');
    expect(result.newWord).toBe('deadline — son teslim tarihi');
  });

  test('parses response with Great! correction', () => {
    const raw = `Perfect explanation! What tools did you use?
---
Correction: Great!
New word: scalable — ölçeklenebilir`;

    const result = parseAIResponse(raw);
    expect(result.content).toBe('Perfect explanation! What tools did you use?');
    expect(result.correction).toBeNull();
    expect(result.newWord).toBe('scalable — ölçeklenebilir');
  });

  test('handles response without separator (fallback)', () => {
    const raw = 'Hello! How are you today?';
    const result = parseAIResponse(raw);
    expect(result.content).toBe('Hello! How are you today?');
    expect(result.correction).toBeNull();
    expect(result.newWord).toBeNull();
  });

  test('handles multiline content before separator', () => {
    const raw = `That's a good point.

I think we should discuss this further in the next meeting.
---
Correction: Great!
New word: agenda — gündem`;

    const result = parseAIResponse(raw);
    expect(result.content).toBe("That's a good point.\n\nI think we should discuss this further in the next meeting.");
    expect(result.newWord).toBe('agenda — gündem');
  });
});
