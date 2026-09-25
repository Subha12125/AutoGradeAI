const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const QuizValidatorService = require('../../src/services/quizValidatorService');
const ScoringEngine = require('../../src/services/scoringEngine');
const AdaptiveEngine = require('../../src/services/adaptiveEngine');
const { GamificationEngine } = require('../../src/services/gamificationEngine');

describe('AI Quiz Arena - Unit Tests', () => {
  // 1. AI Schema Validation
  describe('Schema Validation', () => {
    it('should validate a properly structured quiz', () => {
      const validQuiz = {
        title: 'Distributed Consensus Quiz',
        topic: 'Computer Science',
        difficulty: 'medium',
        questions: [
          {
            prompt: 'Which protocol utilizes term numbers and leader leases?',
            type: 'MCQ',
            options: ['Raft', 'Paxos', 'Two-Phase Commit', 'Gossip'],
            correct_answer: 'Raft',
            difficulty: 3,
            points: 100,
            time_limit: 30,
            explanation: 'Raft divides time into terms with single elected leaders.',
          },
        ],
      };

      const result = QuizValidatorService.validateQuiz(validQuiz);
      assert.equal(result.isValid, true);
      assert.equal(result.errors.length, 0);
      assert.equal(result.sanitizedQuiz.questions[0].correct_answer, 'Raft');
    });

    it('should catch invalid AI output with missing fields', () => {
      const invalidQuiz = {
        title: '',
        questions: [
          {
            prompt: 'Too short',
            type: 'UNKNOWN_TYPE',
          },
        ],
      };

      const result = QuizValidatorService.validateQuiz(invalidQuiz);
      assert.equal(result.isValid, false);
      assert.ok(result.errors.length > 0);
    });

    it('should detect duplicate questions', () => {
      const duplicateQuiz = {
        title: 'Duplicate Check',
        topic: 'Math',
        questions: [
          {
            prompt: 'What is the derivative of sin(x)?',
            type: 'MCQ',
            options: ['cos(x)', '-cos(x)', 'tan(x)', 'sec(x)'],
            correct_answer: 'cos(x)',
          },
          {
            prompt: 'What is the derivative of sin(x)?',
            type: 'MCQ',
            options: ['cos(x)', '-cos(x)', 'tan(x)', 'sec(x)'],
            correct_answer: 'cos(x)',
          },
        ],
      };

      const result = QuizValidatorService.validateQuiz(duplicateQuiz);
      assert.equal(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('duplicate')));
    });

    it('should enforce answer consistency for MCQ', () => {
      const inconsistentQuiz = {
        title: 'Answer Check',
        topic: 'Physics',
        questions: [
          {
            prompt: 'What is the speed of light in vacuum?',
            type: 'MCQ',
            options: ['100 m/s', '300,000 km/s', '1,000 km/h'],
            correct_answer: 'Non-existent Option',
          },
        ],
      };

      const result = QuizValidatorService.validateQuiz(inconsistentQuiz);
      assert.equal(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('does not match any provided option')));
    });
  });

  // 2. Server-Authoritative Scoring
  describe('Scoring Engine', () => {
    const sampleQuestion = {
      type: 'MCQ',
      correct_answer: 'Option A',
      points: 100,
      time_limit: 30,
      difficulty: 3,
    };

    it('should award 0 points and reset streak on incorrect answer', () => {
      const score = ScoringEngine.calculateScore({
        question: sampleQuestion,
        isCorrect: false,
        responseTimeMs: 2500,
        currentStreak: 4,
      });

      assert.equal(score.pointsAwarded, 0);
      assert.equal(score.newStreak, 0);
      assert.equal(score.speedBonus, 0);
      assert.ok(score.xpEarned > 0, 'Should award small participation XP');
    });

    it('should award base points + speed bonus + streak bonus on correct answer', () => {
      const score = ScoringEngine.calculateScore({
        question: sampleQuestion,
        isCorrect: true,
        responseTimeMs: 2000, // Very fast: 2s of 30s
        currentStreak: 2,
      });

      assert.ok(score.pointsAwarded > 100);
      assert.equal(score.newStreak, 3);
      assert.ok(score.speedBonus > 30, 'Fast response should earn high speed bonus');
      assert.equal(score.streakBonus, 30);
    });

    it('should ensure correctness is more impactful than speed', () => {
      const correctSlow = ScoringEngine.calculateScore({
        question: sampleQuestion,
        isCorrect: true,
        responseTimeMs: 28000, // Almost out of time
        currentStreak: 0,
      });

      const incorrectFast = ScoringEngine.calculateScore({
        question: sampleQuestion,
        isCorrect: false,
        responseTimeMs: 500, // Lightning fast
        currentStreak: 5,
      });

      assert.ok(correctSlow.pointsAwarded > incorrectFast.pointsAwarded);
      assert.equal(incorrectFast.pointsAwarded, 0);
    });

    it('should evaluate multi-select correctly', () => {
      const multiQ = {
        type: 'MULTI_SELECT',
        correct_answer: ['Alpha', 'Beta'],
      };

      assert.equal(ScoringEngine.isCorrect(multiQ, ['Beta', 'Alpha']), true);
      assert.equal(ScoringEngine.isCorrect(multiQ, ['Alpha']), false);
      assert.equal(ScoringEngine.isCorrect(multiQ, ['Alpha', 'Beta', 'Gamma']), false);
    });

    it('should evaluate True/False correctly', () => {
      const tfQ = { type: 'TRUE_FALSE', correct_answer: 'True' };
      assert.equal(ScoringEngine.isCorrect(tfQ, 'True'), true);
      assert.equal(ScoringEngine.isCorrect(tfQ, 'true'), true);
      assert.equal(ScoringEngine.isCorrect(tfQ, 'False'), false);
    });
  });

  // 3. Adaptive Difficulty Rules Engine
  describe('Adaptive Engine', () => {
    it('should promote difficulty after 3 consecutive fast correct answers', () => {
      const result = AdaptiveEngine.evaluateDifficulty({
        currentDifficulty: 2,
        recentAnswers: [
          { isCorrect: true, responseTimeMs: 4000, timeLimitMs: 30000 },
          { isCorrect: true, responseTimeMs: 5000, timeLimitMs: 30000 },
          { isCorrect: true, responseTimeMs: 4500, timeLimitMs: 30000 },
        ],
      });

      assert.equal(result.nextDifficulty, 3);
      assert.ok(result.reason.includes('Promoted'));
    });

    it('should demote difficulty after 2 consecutive incorrect answers', () => {
      const result = AdaptiveEngine.evaluateDifficulty({
        currentDifficulty: 3,
        recentAnswers: [
          { isCorrect: false, responseTimeMs: 12000, timeLimitMs: 30000 },
          { isCorrect: false, responseTimeMs: 15000, timeLimitMs: 30000 },
        ],
      });

      assert.equal(result.nextDifficulty, 2);
    });

    it('should bound difficulty between levels 1 and 5', () => {
      const lowBound = AdaptiveEngine.evaluateDifficulty({
        currentDifficulty: 1,
        recentAnswers: [
          { isCorrect: false, responseTimeMs: 10000, timeLimitMs: 30000 },
          { isCorrect: false, responseTimeMs: 10000, timeLimitMs: 30000 },
        ],
      });
      assert.equal(lowBound.nextDifficulty, 1);
    });
  });

  // 4. Gamification Badges
  describe('Gamification Engine', () => {
    it('should award SPEED_DEMON badge when answered correctly in under 3 seconds', () => {
      const badges = GamificationEngine.evaluateBadges({
        participant: { id: 'p1', badges: [] },
        answers: [{ is_correct: true, response_time: 2100 }],
        questions: [{ id: 'q1', difficulty: 2 }],
      });

      assert.ok(badges.some((b) => b.id === 'SPEED_DEMON'));
    });

    it('should award PERFECT_ROUND badge when 100% accurate', () => {
      const badges = GamificationEngine.evaluateBadges({
        participant: { id: 'p1', badges: [] },
        answers: [
          { is_correct: true, response_time: 5000 },
          { is_correct: true, response_time: 6000 },
          { is_correct: true, response_time: 7000 },
        ],
        questions: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }],
      });

      assert.ok(badges.some((b) => b.id === 'PERFECT_ROUND'));
    });
  });
});
