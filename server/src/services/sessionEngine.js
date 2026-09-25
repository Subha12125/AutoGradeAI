const QuizSessionModel = require('../models/quizSession.model');
const QuizModel = require('../models/quiz.model');
const QuizParticipantModel = require('../models/quizParticipant.model');
const QuizAnswerModel = require('../models/quizAnswer.model');
const RealtimeService = require('./realtimeService');
const ScoringEngine = require('./scoringEngine');
const AdaptiveEngine = require('./adaptiveEngine');
const { GamificationEngine } = require('./gamificationEngine');
const logger = require('../utils/logger');

// In-memory active session timers: sessionId -> NodeJS.Timeout
const sessionTimers = new Map();

/**
 * Server-Authoritative Quiz Session Engine
 */
const SessionEngine = {
  /**
   * Start a multiplayer quiz session.
   */
  async startSession(sessionId, hostId) {
    const session = await QuizSessionModel.findById(sessionId);
    if (!session) {
      const err = new Error('Session not found');
      err.statusCode = 404;
      throw err;
    }

    if (session.host_id && hostId && String(session.host_id) !== String(hostId)) {
      const err = new Error('Unauthorized: only the host can start this session');
      err.statusCode = 403;
      throw err;
    }

    if (session.status !== 'LOBBY' && session.status !== 'PAUSED') {
      const err = new Error(`Cannot start session in status: ${session.status}`);
      err.statusCode = 400;
      throw err;
    }

    let quiz = await QuizModel.findById(session.quiz_id);

    // Self-healing: if session quiz has no questions, find questions from other quizzes by same teacher or matching title/topic
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      const teacherQuizzes = await QuizModel.findByTeacher(session.host_id);
      for (const tq of teacherQuizzes) {
        if (tq.id !== session.quiz_id) {
          const fullQuiz = await QuizModel.findById(tq.id);
          if (fullQuiz && fullQuiz.questions && fullQuiz.questions.length > 0) {
            logger.info(`Self-healing quiz session ${sessionId}: copying ${fullQuiz.questions.length} questions from quiz ${fullQuiz.id}`);
            await QuizModel.saveQuestions(session.quiz_id, fullQuiz.questions);
            quiz = await QuizModel.findById(session.quiz_id);
            break;
          }
        }
      }
    }

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      const err = new Error('Quiz has no questions to play. Please add or generate questions before launching.');
      err.statusCode = 400;
      throw err;
    }

    const now = new Date().toISOString();
    await QuizSessionModel.update(sessionId, {
      status: 'STARTING',
      started_at: session.started_at || now,
      current_question_index: 0,
    });

    await RealtimeService.broadcastGameStarted(sessionId, {
      started_at: now,
      totalQuestions: quiz.questions.length,
    });

    // Short 3-second countdown before activating the first question
    setTimeout(async () => {
      try {
        await this.activateQuestion(sessionId, 0);
      } catch (err) {
        logger.error(`Error activating question 0 for session ${sessionId}:`, err.message);
      }
    }, 3000);

    return { success: true, status: 'STARTING' };
  },

  /**
   * Transition to a specific question and begin the authoritative timer.
   */
  async activateQuestion(sessionId, questionIndex) {
    const session = await QuizSessionModel.findById(sessionId);
    if (!session) return;
    const quiz = await QuizModel.findById(session.quiz_id);
    if (!quiz || !quiz.questions || !quiz.questions[questionIndex]) return;

    const question = quiz.questions[questionIndex];
    const now = new Date();

    await QuizSessionModel.update(sessionId, {
      status: 'QUESTION_ACTIVE',
      current_question_index: questionIndex,
      question_started_at: now.toISOString(),
    });

    // Clear any previous timer
    if (sessionTimers.has(sessionId)) {
      clearTimeout(sessionTimers.get(sessionId));
      sessionTimers.delete(sessionId);
    }

    // Broadcast question (sanitized without answer)
    await RealtimeService.broadcastQuestionStarted(sessionId, {
      ...question,
      order_index: questionIndex,
    });

    // Schedule authoritative server-side auto-lock when time expires (+ 1.5s grace period)
    const timeLimitMs = (question.time_limit || 30) * 1000 + 1500;
    const timer = setTimeout(async () => {
      try {
        await this.lockQuestion(sessionId, questionIndex);
      } catch (err) {
        logger.error(`Auto-lock error for session ${sessionId}:`, err.message);
      }
    }, timeLimitMs);
    if (timer.unref) timer.unref();

    sessionTimers.set(sessionId, timer);
  },

  /**
   * Lock question when time expires or all players answered.
   */
  async lockQuestion(sessionId, questionIndex) {
    // Clear timer
    if (sessionTimers.has(sessionId)) {
      clearTimeout(sessionTimers.get(sessionId));
      sessionTimers.delete(sessionId);
    }

    const session = await QuizSessionModel.findById(sessionId);
    if (!session || session.status !== 'QUESTION_ACTIVE') return;

    const quiz = await QuizModel.findById(session.quiz_id);
    const question = quiz?.questions?.[questionIndex];
    if (!question) return;

    await QuizSessionModel.update(sessionId, {
      status: 'QUESTION_LOCKED',
    });

    // Calculate response statistics
    const answers = await QuizAnswerModel.findByQuestion(sessionId, question.id);
    const participants = await QuizParticipantModel.findBySession(sessionId);

    const stats = {
      totalParticipants: participants.length,
      totalResponses: answers.length,
      correctCount: answers.filter((a) => a.is_correct).length,
      optionBreakdown: {},
    };

    if (Array.isArray(question.options)) {
      question.options.forEach((opt) => (stats.optionBreakdown[opt] = 0));
    }
    answers.forEach((ans) => {
      const key = String(ans.answer);
      stats.optionBreakdown[key] = (stats.optionBreakdown[key] || 0) + 1;
    });

    // Broadcast question end with authoritative correct answer & explanation
    await RealtimeService.broadcastQuestionEnded(sessionId, {
      questionId: question.id,
      correctAnswer: question.correct_answer,
      explanation: question.explanation,
      stats,
    });

    // Broadcast updated leaderboard
    const updatedLeaderboard = await this.getLeaderboard(sessionId);
    await RealtimeService.broadcastLeaderboardUpdated(sessionId, updatedLeaderboard);

    await QuizSessionModel.update(sessionId, { status: 'RESULT' });
  },

  /**
   * Submit an answer by a participant with full security validation.
   */
  async submitAnswer({ sessionId, participantId, questionId, answer }) {
    const session = await QuizSessionModel.findById(sessionId);
    if (!session) throw new Error('Session not found');

    // Anti-duplicate check
    const existingSubmission = await QuizAnswerModel.findSubmission(sessionId, participantId, questionId);
    if (existingSubmission) {
      throw new Error('You have already submitted an answer for this question');
    }

    if (session.status !== 'QUESTION_ACTIVE') {
      throw new Error(`Submissions not accepted in session state: ${session.status}`);
    }

    const quiz = await QuizModel.findById(session.quiz_id);
    const currentQ = quiz?.questions?.[session.current_question_index];
    if (!currentQ || currentQ.id !== questionId) {
      throw new Error('Question is not the currently active question');
    }

    const participant = await QuizParticipantModel.findById(participantId);
    if (!participant || participant.session_id !== sessionId) {
      throw new Error('Participant does not belong to this session');
    }

    // Timing validation
    const startedAt = new Date(session.question_started_at).getTime();
    const now = Date.now();
    const elapsedMs = Math.max(0, now - startedAt);
    const maxAllowedMs = (currentQ.time_limit || 30) * 1000 + 2500; // 2.5s network jitter tolerance

    if (elapsedMs > maxAllowedMs) {
      throw new Error('Time window for this question has expired');
    }

    // Evaluate answer correctness & score
    const isCorrect = ScoringEngine.isCorrect(currentQ, answer);
    const scoreResult = ScoringEngine.calculateScore({
      question: currentQ,
      isCorrect,
      responseTimeMs: elapsedMs,
      currentStreak: participant.streak || 0,
    });

    // Check adaptive difficulty rules
    let nextDifficulty = participant.current_difficulty || 2;
    if (session.settings?.adaptive) {
      const pastAnswers = await QuizAnswerModel.findByParticipant(sessionId, participantId);
      const evalDiff = AdaptiveEngine.evaluateDifficulty({
        currentDifficulty: participant.current_difficulty || 2,
        recentAnswers: [
          ...pastAnswers.map((a) => ({
            isCorrect: a.is_correct,
            responseTimeMs: a.response_time,
            timeLimitMs: 30000,
          })),
          { isCorrect, responseTimeMs: elapsedMs, timeLimitMs: (currentQ.time_limit || 30) * 1000 },
        ],
      });
      nextDifficulty = evalDiff.nextDifficulty;
    }

    // Persist answer
    await QuizAnswerModel.record({
      sessionId,
      participantId,
      questionId,
      answer,
      isCorrect,
      responseTime: elapsedMs,
      pointsAwarded: scoreResult.pointsAwarded,
    });

    // Update participant authoritative score and streak
    const updatedParticipant = await QuizParticipantModel.updateScore(participantId, {
      pointsDelta: scoreResult.pointsAwarded,
      newStreak: scoreResult.newStreak,
      xpDelta: scoreResult.xpEarned,
      currentDifficulty: nextDifficulty,
    });

    // Broadcast live answer submitted count (without exposing individual answer)
    const allAnswers = await QuizAnswerModel.findByQuestion(sessionId, questionId);
    const allParticipants = await QuizParticipantModel.findBySession(sessionId);

    await RealtimeService.broadcastAnswerSubmitted(sessionId, {
      participantId,
      responseCount: allAnswers.length,
      totalParticipants: allParticipants.length,
    });

    // Check if ALL participants have answered early -> lock early
    if (allParticipants.length > 0 && allAnswers.length >= allParticipants.length) {
      setTimeout(() => {
        this.lockQuestion(sessionId, session.current_question_index);
      }, 500);
    }

    return {
      success: true,
      isCorrect,
      pointsAwarded: scoreResult.pointsAwarded,
      speedBonus: scoreResult.speedBonus,
      streakBonus: scoreResult.streakBonus,
      newStreak: scoreResult.newStreak,
      currentScore: updatedParticipant.current_score,
      xpEarned: scoreResult.xpEarned,
    };
  },

  /**
   * Advance to the next question or complete the game.
   */
  async nextQuestion(sessionId, hostId) {
    const session = await QuizSessionModel.findById(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.host_id !== hostId) throw new Error('Unauthorized');

    const quiz = await QuizModel.findById(session.quiz_id);
    const nextIdx = (session.current_question_index || 0) + 1;

    if (nextIdx >= (quiz?.questions?.length || 0)) {
      return await this.endSession(sessionId, hostId);
    }

    await this.activateQuestion(sessionId, nextIdx);
    return { success: true, current_question_index: nextIdx };
  },

  /**
   * Pause/resume game session.
   */
  async togglePause(sessionId, hostId) {
    const session = await QuizSessionModel.findById(sessionId);
    if (!session || session.host_id !== hostId) throw new Error('Unauthorized');

    if (session.status === 'PAUSED') {
      return await this.activateQuestion(sessionId, session.current_question_index);
    } else {
      if (sessionTimers.has(sessionId)) {
        clearTimeout(sessionTimers.get(sessionId));
        sessionTimers.delete(sessionId);
      }
      return await QuizSessionModel.update(sessionId, { status: 'PAUSED' });
    }
  },

  /**
   * End quiz session and compute final analytics & gamification badges.
   */
  async endSession(sessionId, hostId) {
    const session = await QuizSessionModel.findById(sessionId);
    if (!session) throw new Error('Session not found');
    if (hostId && session.host_id !== hostId) throw new Error('Unauthorized');

    if (sessionTimers.has(sessionId)) {
      clearTimeout(sessionTimers.get(sessionId));
      sessionTimers.delete(sessionId);
    }

    const quiz = await QuizModel.findById(session.quiz_id);
    const participants = await QuizParticipantModel.findBySession(sessionId);
    const allAnswers = await QuizAnswerModel.findBySession(sessionId);

    // Evaluate badges and performance summaries for each participant
    const finalLeaderboard = [];

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      const pAnswers = allAnswers.filter((a) => a.participant_id === p.id);
      const badges = GamificationEngine.evaluateBadges({
        participant: p,
        answers: pAnswers,
        questions: quiz?.questions || [],
      });
      const topicMastery = GamificationEngine.calculateTopicMastery(pAnswers, quiz?.questions || []);

      await QuizParticipantModel.update(p.id, {
        badges,
        status: 'finished',
      });

      finalLeaderboard.push({
        rank: i + 1,
        id: p.id,
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.current_score || 0,
        streak: p.max_streak || p.streak || 0,
        xp: p.xp || 0,
        level: p.level || 1,
        badges,
        accuracy: pAnswers.length > 0 ? Math.round((pAnswers.filter((a) => a.is_correct).length / pAnswers.length) * 100) : 0,
        topicMastery,
      });
    }

    // Sort descending by score
    finalLeaderboard.sort((a, b) => b.score - a.score);
    finalLeaderboard.forEach((p, idx) => (p.rank = idx + 1));

    const finalSummary = {
      sessionId,
      quizTitle: quiz?.title || 'AI Quiz Arena',
      topic: quiz?.topic || 'General',
      totalQuestions: quiz?.questions?.length || 0,
      totalParticipants: participants.length,
      podium: finalLeaderboard.slice(0, 3),
      leaderboard: finalLeaderboard,
      endedAt: new Date().toISOString(),
    };

    await QuizSessionModel.update(sessionId, {
      status: 'FINISHED',
      ended_at: new Date().toISOString(),
    });

    await RealtimeService.broadcastGameFinished(sessionId, finalSummary);
    await RealtimeService.closeSessionChannel(sessionId);

    return finalSummary;
  },

  /**
   * Get current live leaderboard.
   */
  async getLeaderboard(sessionId) {
    const participants = await QuizParticipantModel.findBySession(sessionId);
    return participants.map((p, idx) => ({
      rank: idx + 1,
      id: p.id,
      nickname: p.nickname,
      avatar: p.avatar,
      score: p.current_score || 0,
      streak: p.streak || 0,
      maxStreak: p.max_streak || 0,
      xp: p.xp || 0,
      level: p.level || 1,
      badges: p.badges || [],
      difficulty: p.current_difficulty || 2,
    }));
  },
};

module.exports = SessionEngine;
