/**
 * Deterministic Adaptive Difficulty Rules Engine
 * Adjusts question difficulty in real-time based on student accuracy & response speed
 * without making synchronous LLM calls during live gameplay.
 */
const AdaptiveEngine = {
  /**
   * Determine new difficulty level based on answer history.
   * @param {object} params
   * @param {number} params.currentDifficulty - Current difficulty (1..5)
   * @param {Array<{ isCorrect: boolean, responseTimeMs: number, timeLimitMs: number }>} params.recentAnswers
   * @returns {{ nextDifficulty: number, reason: string }}
   */
  evaluateDifficulty({ currentDifficulty = 2, recentAnswers = [] }) {
    if (recentAnswers.length === 0) {
      return { nextDifficulty: currentDifficulty, reason: 'Initial baseline' };
    }

    const last3 = recentAnswers.slice(-3);
    const last2 = recentAnswers.slice(-2);

    // Rule 1: 3 consecutive correct answers quickly -> Increase difficulty
    if (last3.length === 3 && last3.every((a) => a.isCorrect)) {
      const avgSpeedFraction = last3.reduce((acc, a) => acc + (a.responseTimeMs / (a.timeLimitMs || 30000)), 0) / 3;
      if (avgSpeedFraction < 0.65 && currentDifficulty < 5) {
        return {
          nextDifficulty: Math.min(5, currentDifficulty + 1),
          reason: 'High accuracy and quick responses - Promoted to higher difficulty level!',
        };
      }
    }

    // Rule 2: 2 consecutive incorrect answers -> Decrease difficulty
    if (last2.length === 2 && last2.every((a) => !a.isCorrect) && currentDifficulty > 1) {
      return {
        nextDifficulty: Math.max(1, currentDifficulty - 1),
        reason: 'Adjusting to foundational difficulty level to support learning.',
      };
    }

    return { nextDifficulty: currentDifficulty, reason: 'Maintained current difficulty level.' };
  },

  /**
   * Select next question for a participant from the available question pool.
   * @param {Array<object>} availableQuestions - Questions not yet answered by student
   * @param {number} targetDifficulty - Ideal difficulty (1..5)
   * @returns {object|null}
   */
  selectQuestion(availableQuestions, targetDifficulty = 2) {
    if (!availableQuestions || availableQuestions.length === 0) return null;

    // Try exact match
    const exactMatches = availableQuestions.filter((q) => (q.difficulty || 2) === targetDifficulty);
    if (exactMatches.length > 0) {
      return exactMatches[Math.floor(Math.random() * exactMatches.length)];
    }

    // Find closest difficulty
    const sorted = [...availableQuestions].sort((a, b) => {
      const diffA = Math.abs((a.difficulty || 2) - targetDifficulty);
      const diffB = Math.abs((b.difficulty || 2) - targetDifficulty);
      return diffA - diffB;
    });

    return sorted[0];
  },
};

module.exports = AdaptiveEngine;
