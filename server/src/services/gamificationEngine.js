/**
 * Gamification Engine
 * Handles XP leveling, badges, streaks, mastery calculations, and personal milestones.
 */
const BADGE_DEFINITIONS = {
  SPEED_DEMON: {
    id: 'SPEED_DEMON',
    title: 'Speed Demon',
    description: 'Answered a question correctly in under 3 seconds',
    icon: 'ri-flashlight-fill',
    color: '#f59e0b',
  },
  PERFECT_ROUND: {
    id: 'PERFECT_ROUND',
    title: 'Perfect Round',
    description: 'Achieved 100% accuracy across all questions',
    icon: 'ri-trophy-fill',
    color: '#10b981',
  },
  COMEBACK_KID: {
    id: 'COMEBACK_KID',
    title: 'The Comeback',
    description: 'Scored correct answer directly after consecutive misses',
    icon: 'ri-fire-fill',
    color: '#ef4444',
  },
  KNOWLEDGE_MASTER: {
    id: 'KNOWLEDGE_MASTER',
    title: 'Knowledge Master',
    description: 'Solved level 4 or level 5 challenge questions',
    icon: 'ri-medal-fill',
    color: '#7c3aed',
  },
  STREAK_7: {
    id: 'STREAK_7',
    title: '7 Question Streak',
    description: 'Maintained 7 consecutive correct answers',
    icon: 'ri-sparkles-fill',
    color: '#06b6d4',
  },
  PERSONAL_BEST: {
    id: 'PERSONAL_BEST',
    title: 'Personal Best',
    description: 'Achieved a top personal score record',
    icon: 'ri-star-fill',
    color: '#ec4899',
  },
  ACCURACY_CHAMPION: {
    id: 'ACCURACY_CHAMPION',
    title: 'Sharpshooter',
    description: 'Finished with at least 85% overall accuracy',
    icon: 'ri-focus-3-line',
    color: '#3b82f6',
  },
};

const GamificationEngine = {
  /**
   * Calculate player level from XP.
   * @param {number} xp
   * @returns {number} Level (1, 2, 3...)
   */
  calculateLevel(xp) {
    if (!xp || xp <= 0) return 1;
    // Level 1: 0..199, Level 2: 200..499, Level 3: 500..999, etc.
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  },

  /**
   * Evaluate achievements and badges for a participant.
   * @param {object} params
   * @param {object} params.participant
   * @param {Array<object>} params.answers
   * @param {Array<object>} params.questions
   * @returns {Array<object>} Unlocked badges
   */
  evaluateBadges({ participant, answers = [], questions = [] }) {
    const unlocked = new Map();
    const existingBadges = participant.badges || [];
    existingBadges.forEach((b) => unlocked.set(b.id || b, BADGE_DEFINITIONS[b.id || b] || b));

    if (answers.length === 0) {
      return Array.from(unlocked.values());
    }

    const correctAnswers = answers.filter((a) => a.is_correct);
    const accuracy = answers.length > 0 ? (correctAnswers.length / answers.length) * 100 : 0;

    // 1. SPEED DEMON (Correct answer < 3000ms)
    const hasSpeedDemon = correctAnswers.some((a) => (a.response_time || 0) < 3000 && (a.response_time || 0) > 0);
    if (hasSpeedDemon) {
      unlocked.set('SPEED_DEMON', BADGE_DEFINITIONS.SPEED_DEMON);
    }

    // 2. PERFECT ROUND (100% accuracy, min 3 questions)
    if (answers.length >= 3 && correctAnswers.length === answers.length) {
      unlocked.set('PERFECT_ROUND', BADGE_DEFINITIONS.PERFECT_ROUND);
    }

    // 3. COMEBACK (Wrong then wrong then right)
    for (let i = 2; i < answers.length; i++) {
      if (!answers[i - 2].is_correct && !answers[i - 1].is_correct && answers[i].is_correct) {
        unlocked.set('COMEBACK_KID', BADGE_DEFINITIONS.COMEBACK_KID);
        break;
      }
    }

    // 4. KNOWLEDGE MASTER (Correct question with difficulty >= 4)
    const questionMap = new Map(questions.map((q) => [q.id, q]));
    const hasMaster = correctAnswers.some((a) => {
      const q = questionMap.get(a.question_id);
      return q && (q.difficulty >= 4 || q.difficulty === 5);
    });
    if (hasMaster) {
      unlocked.set('KNOWLEDGE_MASTER', BADGE_DEFINITIONS.KNOWLEDGE_MASTER);
    }

    // 5. STREAK 7
    if ((participant.max_streak || participant.streak || 0) >= 7) {
      unlocked.set('STREAK_7', BADGE_DEFINITIONS.STREAK_7);
    }

    // 6. ACCURACY CHAMPION (>= 85% accuracy on 4+ questions)
    if (answers.length >= 4 && accuracy >= 85) {
      unlocked.set('ACCURACY_CHAMPION', BADGE_DEFINITIONS.ACCURACY_CHAMPION);
    }

    // 7. PERSONAL BEST
    if ((participant.current_score || 0) > 300) {
      unlocked.set('PERSONAL_BEST', BADGE_DEFINITIONS.PERSONAL_BEST);
    }

    return Array.from(unlocked.values());
  },

  /**
   * Compute topic mastery percentage (0..100%).
   */
  calculateTopicMastery(answers = [], questions = []) {
    if (answers.length === 0) return 0;
    const questionMap = new Map(questions.map((q) => [q.id, q]));
    let totalWeight = 0;
    let earnedWeight = 0;

    answers.forEach((ans) => {
      const q = questionMap.get(ans.question_id);
      const weight = (q?.difficulty || 2) * 20;
      totalWeight += weight;
      if (ans.is_correct) {
        earnedWeight += weight;
      }
    });

    if (totalWeight === 0) return 0;
    return Math.min(100, Math.round((earnedWeight / totalWeight) * 100));
  },
};

module.exports = { GamificationEngine, BADGE_DEFINITIONS };
