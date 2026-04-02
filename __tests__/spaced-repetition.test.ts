import { calculateNextReview } from '../src/utils/spaced-repetition';

describe('calculateNextReview', () => {
  const baseDate = new Date('2026-04-03T10:00:00Z');

  test('first correct review: interval = 1 day', () => {
    const result = calculateNextReview({
      repetitionCount: 0,
      easeFactor: 2.5,
      correct: true,
      now: baseDate,
    });
    expect(result.repetitionCount).toBe(1);
    expect(result.easeFactor).toBe(2.5);
    expect(result.nextReviewAt).toBe('2026-04-04T10:00:00.000Z');
  });

  test('second correct review: interval = 3 days', () => {
    const result = calculateNextReview({
      repetitionCount: 1,
      easeFactor: 2.5,
      correct: true,
      now: baseDate,
    });
    expect(result.repetitionCount).toBe(2);
    expect(result.nextReviewAt).toBe('2026-04-06T10:00:00.000Z');
  });

  test('third correct review: interval = 3 * 2.5 = 7.5 -> 8 days', () => {
    const result = calculateNextReview({
      repetitionCount: 2,
      easeFactor: 2.5,
      correct: true,
      now: baseDate,
    });
    expect(result.repetitionCount).toBe(3);
    expect(result.nextReviewAt).toBe('2026-04-11T10:00:00.000Z');
  });

  test('incorrect answer resets to 1 day, lowers ease factor', () => {
    const result = calculateNextReview({
      repetitionCount: 5,
      easeFactor: 2.5,
      correct: false,
      now: baseDate,
    });
    expect(result.repetitionCount).toBe(0);
    expect(result.easeFactor).toBe(2.3);
    expect(result.nextReviewAt).toBe('2026-04-04T10:00:00.000Z');
  });

  test('ease factor does not go below 1.3', () => {
    const result = calculateNextReview({
      repetitionCount: 3,
      easeFactor: 1.3,
      correct: false,
      now: baseDate,
    });
    expect(result.easeFactor).toBe(1.3);
  });
});
