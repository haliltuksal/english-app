interface ReviewInput {
  repetitionCount: number;
  easeFactor: number;
  correct: boolean;
  now?: Date;
}

interface ReviewResult {
  repetitionCount: number;
  easeFactor: number;
  nextReviewAt: string;
}

export function calculateNextReview(input: ReviewInput): ReviewResult {
  const now = input.now ?? new Date();
  let { repetitionCount, easeFactor } = input;

  if (input.correct) {
    repetitionCount += 1;
  } else {
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    repetitionCount = 0;
  }

  let intervalDays: number;
  if (repetitionCount <= 1) {
    intervalDays = 1;
  } else if (repetitionCount === 2) {
    intervalDays = 3;
  } else {
    let prev = 3;
    for (let i = 3; i <= repetitionCount; i++) {
      prev = Math.round(prev * easeFactor);
    }
    intervalDays = prev;
  }

  const nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    repetitionCount,
    easeFactor,
    nextReviewAt: nextDate.toISOString(),
  };
}
