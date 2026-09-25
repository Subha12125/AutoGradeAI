/**
 * Server-Authoritative Scoring Engine
 * Ensures correctness dominates speed, rewards streaks, and prevents client-side score manipulation.
 */
const ScoringEngine = {
  /**
   * Evaluate if a participant's answer is correct.
   * @param {object} question - The authoritative question
   * @param {any} participantAnswer - The student's submitted answer
   * @returns {boolean}
   */
  isCorrect(question, participantAnswer) {
    if (participantAnswer === undefined || participantAnswer === null) {
      return false;
    }

    const type = (question.type || 'MCQ').toUpperCase();
    const correct = question.correct_answer;

    if (type === 'MCQ' || type === 'SCENARIO' || type === 'IMAGE_BASED') {
      const correctStr = String(correct).trim().toLowerCase();
      const studentStr = String(participantAnswer).trim().toLowerCase();
      return correctStr === studentStr;
    }

    if (type === 'TRUE_FALSE') {
      const c = String(correct).toLowerCase() === 'true';
      const s = String(participantAnswer).toLowerCase() === 'true';
      return c === s;
    }

    if (type === 'MULTI_SELECT') {
      if (!Array.isArray(correct) || !Array.isArray(participantAnswer)) {
        return false;
      }
      const normCorrect = correct.map((x) => String(x).trim().toLowerCase()).sort();
      const normStudent = participantAnswer.map((x) => String(x).trim().toLowerCase()).sort();
      if (normCorrect.length !== normStudent.length) return false;
      return normCorrect.every((val, idx) => val === normStudent[idx]);
    }

    if (type === 'ORDERING') {
      if (!Array.isArray(correct) || !Array.isArray(participantAnswer)) {
        return false;
      }
      if (correct.length !== participantAnswer.length) return false;
      return correct.every((item, idx) => String(item).trim().toLowerCase() === String(participantAnswer[idx]).trim().toLowerCase());
    }

    if (type === 'MATCHING') {
      // Pairs array: [{ left, right }]
      if (!Array.isArray(correct) || !Array.isArray(participantAnswer)) {
        return false;
      }
      if (correct.length !== participantAnswer.length) return false;
      // Map check
      const correctMap = new Map(correct.map((p) => [String(p.left).trim().toLowerCase(), String(p.right).trim().toLowerCase()]));
      for (const pair of participantAnswer) {
        const expected = correctMap.get(String(pair.left).trim().toLowerCase());
        if (!expected || expected !== String(pair.right).trim().toLowerCase()) {
          return false;
        }
      }
      return true;
    }

    if (type === 'FILL_BLANK') {
      const studentText = String(participantAnswer).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (Array.isArray(correct)) {
        return correct.some((ans) => String(ans).trim().toLowerCase().replace(/[^a-z0-9]/g, '') === studentText);
      }
      const correctText = String(correct).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      return studentText === correctText;
    }

    // Default string equality
    return String(correct).trim().toLowerCase() === String(participantAnswer).trim().toLowerCase();
  },

  /**
   * Calculate authoritative points awarded for a submission.
   * @param {object} params
   * @param {object} params.question - Authoritative question
   * @param {boolean} params.isCorrect - Answer correctness
   * @param {number} params.responseTimeMs - Measured time taken in milliseconds
   * @param {number} params.currentStreak - Participant's streak before this answer
   * @returns {{ pointsAwarded: number, newStreak: number, speedBonus: number, streakBonus: number, xpEarned: number }}
   */
  calculateScore({ question, isCorrect, responseTimeMs, currentStreak = 0 }) {
    if (!isCorrect) {
      return {
        pointsAwarded: 0,
        newStreak: 0,
        speedBonus: 0,
        streakBonus: 0,
        xpEarned: 10, // Small participation XP even for incorrect answers to encourage persistence
      };
    }

    const basePoints = parseInt(question.points, 10) || 100;
    const timeLimitMs = (parseInt(question.time_limit, 10) || 30) * 1000;
    const validResponseTime = Math.min(Math.max(responseTimeMs, 250), timeLimitMs);

    // Speed bonus: up to 50 points based on speed fraction
    const timeRemainingFraction = Math.max(0, 1 - validResponseTime / timeLimitMs);
    const speedBonus = Math.round(50 * Math.pow(timeRemainingFraction, 1.2));

    // Streak bonus
    const newStreak = currentStreak + 1;
    let streakBonus = 0;
    if (newStreak === 2) streakBonus = 15;
    else if (newStreak === 3) streakBonus = 30;
    else if (newStreak === 4) streakBonus = 50;
    else if (newStreak >= 5) streakBonus = 75;

    // Difficulty multiplier (Level 1..5)
    const diff = Math.min(Math.max(parseInt(question.difficulty, 10) || 2, 1), 5);
    const diffMultipliers = { 1: 1.0, 2: 1.05, 3: 1.15, 4: 1.3, 5: 1.5 };
    const multiplier = diffMultipliers[diff] || 1.0;

    const rawTotal = Math.round((basePoints + speedBonus + streakBonus) * multiplier);

    // XP calculation: 100 base + difficulty multiplier + streak bonus
    const xpEarned = Math.round(50 + rawTotal / 2);

    return {
      pointsAwarded: rawTotal,
      newStreak,
      speedBonus,
      streakBonus,
      xpEarned,
    };
  },
};

module.exports = ScoringEngine;
