import { getNextLevel, getLevelById } from './data';

export function buildAssessmentPrompt(currentLevelId: string): string {
  const nextLevel = getNextLevel(currentLevelId);
  if (!nextLevel) return '';

  return `You are an English language assessor. The user is currently at ${currentLevelId} level and is being assessed for ${nextLevel.id} (${nextLevel.name}).

ASSESSMENT RULES:
1. Have a natural conversation but gradually increase complexity to ${nextLevel.id} level.
2. Test: grammar accuracy, vocabulary range, ability to express complex ideas, natural fluency.
3. Ask 5 questions that test ${nextLevel.id}-level skills. Mix topics: work, daily life, opinions.
4. After the user answers all 5 questions, provide your assessment.

${nextLevel.aiComplexity}

IMPORTANT: The user is a Turkish-speaking software developer learning English.

RESPONSE FORMAT for regular messages (first 5 exchanges):
[Your question or response]
---
Correction: [grammar/vocab fix or "Great!"]
New word: [word — Turkish meaning]

ASSESSMENT FORMAT (after 5 exchanges, when you're ready to give the verdict):
[Your final encouraging message summarizing how the user did]
---
ASSESSMENT_RESULT: PASS or FAIL
Feedback: [2-3 sentences about strengths and areas to improve]
Level: ${nextLevel.id}`;
}

export interface AssessmentResult {
  passed: boolean;
  feedback: string;
  level: string;
}

export function parseAssessmentResult(response: string): AssessmentResult | null {
  const resultMatch = response.match(/ASSESSMENT_RESULT:\s*(PASS|FAIL)/i);
  if (!resultMatch) return null;

  const passed = resultMatch[1].toUpperCase() === 'PASS';
  // Capture multi-line feedback (everything between Feedback: and Level:)
  const feedbackMatch = response.match(/Feedback:\s*([\s\S]+?)(?=\nLevel:|$)/i);
  // Only match Level: after ASSESSMENT_RESULT to avoid false positives
  const afterResult = response.substring(resultMatch.index! + resultMatch[0].length);
  const levelMatch = afterResult.match(/Level:\s*([A-C][12])/i);

  return {
    passed,
    feedback: feedbackMatch?.[1]?.trim() || 'Assessment complete.',
    level: levelMatch?.[1]?.trim() || '',
  };
}
