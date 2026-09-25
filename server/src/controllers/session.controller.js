const QRCode = require('qrcode');
const QuizSessionModel = require('../models/quizSession.model');
const QuizModel = require('../models/quiz.model');
const QuizParticipantModel = require('../models/quizParticipant.model');
const QuizAnswerModel = require('../models/quizAnswer.model');
const SessionEngine = require('../services/sessionEngine');
const RealtimeService = require('../services/realtimeService');
const logger = require('../utils/logger');

function getClientOrigin(req) {
  if (req.headers.origin) return req.headers.origin.replace(/\/+$/, '');
  if (req.headers.referer) {
    try {
      const url = new URL(req.headers.referer);
      return url.origin;
    } catch {
      // ignore
    }
  }
  return (process.env.CLIENT_URL || 'http://localhost:5174').replace(/\/+$/, '');
}

const SessionController = {
  /**
   * Create multiplayer session
   * POST /api/sessions
   */
  async create(req, res, next) {
    try {
      const hostId = req.user.id;
      const { quizId, settings } = req.body;

      if (!quizId) {
        return res.status(400).json({ error: 'quizId is required' });
      }

      const quiz = await QuizModel.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      const session = await QuizSessionModel.create({
        quizId,
        hostId,
        settings: settings || {},
      });

      // Construct join URL using request origin
      const clientUrl = getClientOrigin(req);
      const joinUrl = `${clientUrl}/join/${session.join_code}`;

      // Generate QR Code data URL
      let qrCode = '';
      try {
        qrCode = await QRCode.toDataURL(joinUrl, {
          errorCorrectionLevel: 'H',
          margin: 2,
          scale: 8,
          color: { dark: '#0f172a', light: '#ffffff' },
        });
      } catch (qrErr) {
        logger.warn('QRCode generation warning:', qrErr.message);
      }

      res.status(201).json({
        success: true,
        session: {
          ...session,
          joinUrl,
          qrCode,
        },
        quiz: {
          id: quiz.id,
          title: quiz.title,
          topic: quiz.topic,
          totalQuestions: (quiz.questions || []).length,
        },
        joinCode: session.join_code,
        joinUrl,
        qrCode,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get session details
   * GET /api/sessions/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const session = await QuizSessionModel.findById(id);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const quiz = await QuizModel.findById(session.quiz_id);
      const participants = await QuizParticipantModel.findBySession(id);
      const isHost = req.user && req.user.id === session.host_id;

      // Sanitize questions for student view
      let sanitizedQuestions = [];
      if (quiz && quiz.questions) {
        if (isHost) {
          sanitizedQuestions = quiz.questions;
        } else {
          // If student, only expose the currently active question (or completed ones in result mode)
          // and never expose correct answers or explanations!
          sanitizedQuestions = quiz.questions.map((q, idx) => {
            const isCurrent = idx === session.current_question_index;
            const isPast = idx < session.current_question_index;
            const canSeeDetails = isPast || session.status === 'FINISHED';

            return {
              id: q.id,
              index: idx,
              type: q.type,
              prompt: q.prompt,
              options: q.options,
              difficulty: q.difficulty,
              points: q.points,
              time_limit: q.time_limit,
              learning_objective: q.learning_objective,
              media_url: q.media_url,
              ...(canSeeDetails && {
                correct_answer: q.correct_answer,
                explanation: q.explanation,
              }),
            };
          });
        }
      }

      const clientUrl = getClientOrigin(req);
      const joinUrl = `${clientUrl}/join/${session.join_code}`;
      const qrCode = await QRCode.toDataURL(joinUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        scale: 8,
        color: { dark: '#0f172a', light: '#ffffff' },
      });

      res.json({
        success: true,
        session: {
          ...session,
          join_code: session.join_code,
          joinUrl,
          qrCode,
        },
        isHost,
        quiz: {
          id: quiz?.id,
          title: quiz?.title,
          topic: quiz?.topic,
          totalQuestions: quiz?.questions?.length || 0,
          questions: sanitizedQuestions,
        },
        participantsCount: participants.length,
        participants: participants.map((p) => ({
          id: p.id,
          nickname: p.nickname,
          avatar: p.avatar,
          score: p.current_score || 0,
          streak: p.streak || 0,
          status: p.status,
          xp: p.xp || 0,
          level: p.level || 1,
        })),
        joinCode: session.join_code,
        joinUrl,
        qrCode,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Look up session by join code
   * GET /api/sessions/by-code/:code
   */
  async getByCode(req, res, next) {
    try {
      const { code } = req.params;
      const session = await QuizSessionModel.findByJoinCode(code);

      if (!session) {
        return res.status(404).json({ error: 'Session not found. Please check your join code.' });
      }

      if (session.status === 'FINISHED') {
        return res.status(400).json({ error: 'This quiz session has already finished.' });
      }

      const quiz = await QuizModel.findById(session.quiz_id);
      const participants = await QuizParticipantModel.findBySession(session.id);

      res.json({
        success: true,
        session: {
          id: session.id,
          join_code: session.join_code,
          status: session.status,
          settings: session.settings,
        },
        quiz: {
          title: quiz?.title || 'AI Quiz Arena',
          topic: quiz?.topic || 'General',
          totalQuestions: quiz?.questions?.length || 0,
        },
        participantCount: participants.length,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Student join session
   * POST /api/sessions/:id/join
   */
  async join(req, res, next) {
    try {
      const { id } = req.params;
      const { nickname, avatar } = req.body;
      const studentId = req.user?.id || null;

      if (!nickname || nickname.trim().length === 0) {
        return res.status(400).json({ error: 'Nickname is required to join' });
      }

      const session = await QuizSessionModel.findById(id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.status === 'FINISHED') {
        return res.status(400).json({ error: 'This session has already ended' });
      }

      const participant = await QuizParticipantModel.join({
        sessionId: id,
        studentId,
        nickname: nickname.trim(),
        avatar: avatar || 'rocket',
      });

      // Broadcast PLAYER_JOINED to host and lobby
      await RealtimeService.broadcastPlayerJoined(id, participant);

      res.status(200).json({
        success: true,
        participant,
        session: {
          id: session.id,
          join_code: session.join_code,
          status: session.status,
          current_question_index: session.current_question_index,
          settings: session.settings,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Start session (Host only)
   * POST /api/sessions/:id/start
   */
  async start(req, res, next) {
    try {
      const { id } = req.params;
      const hostId = req.user.id;
      const result = await SessionEngine.startSession(id, hostId);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Pause/Resume session (Host only)
   * POST /api/sessions/:id/pause
   */
  async pause(req, res, next) {
    try {
      const { id } = req.params;
      const hostId = req.user.id;
      const updated = await SessionEngine.togglePause(id, hostId);
      res.json({ success: true, session: updated });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Advance to next question (Host only)
   * POST /api/sessions/:id/next
   */
  async next(req, res, next) {
    try {
      const { id } = req.params;
      const hostId = req.user.id;
      const result = await SessionEngine.nextQuestion(id, hostId);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  /**
   * End session (Host only)
   * POST /api/sessions/:id/end
   */
  async end(req, res, next) {
    try {
      const { id } = req.params;
      const hostId = req.user.id;
      const summary = await SessionEngine.endSession(id, hostId);
      res.json({ success: true, summary });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Submit answer
   * POST /api/sessions/:id/answer
   */
  async submitAnswer(req, res, next) {
    try {
      const { id } = req.params;
      const { participantId, questionId, answer } = req.body;

      if (!participantId || !questionId) {
        return res.status(400).json({ error: 'participantId and questionId are required' });
      }

      const result = await SessionEngine.submitAnswer({
        sessionId: id,
        participantId,
        questionId,
        answer,
      });

      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * Get leaderboard
   * GET /api/sessions/:id/leaderboard
   */
  async getLeaderboard(req, res, next) {
    try {
      const { id } = req.params;
      const leaderboard = await SessionEngine.getLeaderboard(id);
      res.json({ success: true, leaderboard });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get post-game results & analytics
   * GET /api/sessions/:id/results
   */
  async getResults(req, res, next) {
    try {
      const { id } = req.params;
      const session = await QuizSessionModel.findById(id);
      if (!session) return res.status(404).json({ error: 'Session not found' });

      const quiz = await QuizModel.findById(session.quiz_id);
      const participants = await QuizParticipantModel.findBySession(id);
      const allAnswers = await QuizAnswerModel.findBySession(id);

      // Question breakdown stats
      const questionBreakdown = (quiz?.questions || []).map((q) => {
        const qAnswers = allAnswers.filter((a) => a.question_id === q.id);
        const correctCount = qAnswers.filter((a) => a.is_correct).length;
        const total = qAnswers.length;
        const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
        const avgTimeMs = total > 0 ? Math.round(qAnswers.reduce((sum, a) => sum + (a.response_time || 0), 0) / total) : 0;

        return {
          id: q.id,
          prompt: q.prompt,
          type: q.type,
          difficulty: q.difficulty,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          totalResponses: total,
          correctCount,
          accuracy,
          avgResponseTimeSec: (avgTimeMs / 1000).toFixed(1),
        };
      });

      // Overall accuracy
      const totalAnswers = allAnswers.length;
      const totalCorrect = allAnswers.filter((a) => a.is_correct).length;
      const overallAccuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

      res.json({
        success: true,
        session: {
          id: session.id,
          status: session.status,
          started_at: session.started_at,
          ended_at: session.ended_at,
        },
        quiz: {
          id: quiz?.id,
          title: quiz?.title,
          topic: quiz?.topic,
          totalQuestions: quiz?.questions?.length || 0,
        },
        analytics: {
          totalParticipants: participants.length,
          totalAnswersSubmitted: totalAnswers,
          overallAccuracy,
          questionBreakdown,
        },
        leaderboard: participants.map((p, idx) => ({
          rank: idx + 1,
          id: p.id,
          nickname: p.nickname,
          avatar: p.avatar,
          score: p.current_score || 0,
          streak: p.max_streak || p.streak || 0,
          xp: p.xp || 0,
          level: p.level || 1,
          badges: p.badges || [],
        })),
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = SessionController;
