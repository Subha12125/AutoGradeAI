const supabase = require('../config/supabase');
const logger = require('../utils/logger');

// Cache of subscribed session channels
const activeChannels = new Map();

/**
 * Realtime Service using Supabase Realtime Broadcast & Presence
 */
const RealtimeService = {
  /**
   * Get or create a Supabase Realtime channel for a quiz session.
   * @param {string} sessionId
   * @returns {import('@supabase/supabase-js').RealtimeChannel}
   */
  getChannel(sessionId) {
    const channelName = `quiz:${sessionId}`;
    if (activeChannels.has(sessionId)) {
      return activeChannels.get(sessionId);
    }

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: true, self: false },
        presence: { key: 'server' },
      },
    });

    channel.subscribe((status) => {
      logger.info(`Realtime channel [${channelName}] status: ${status}`);
    });

    activeChannels.set(sessionId, channel);
    return channel;
  },

  /**
   * Broadcast an event to all clients on session channel.
   * @param {string} sessionId
   * @param {string} event - Event name
   * @param {object} payload - Event payload
   */
  async broadcast(sessionId, event, payload) {
    if (process.env.NODE_ENV === 'test') {
      return 'ok';
    }
    try {
      const channel = this.getChannel(sessionId);
      const res = await channel.send({
        type: 'broadcast',
        event,
        payload: {
          sessionId,
          timestamp: new Date().toISOString(),
          ...payload,
        },
      });
      logger.debug(`Broadcast ${event} to quiz:${sessionId}: ${res}`);
      return res;
    } catch (err) {
      logger.error(`Broadcast error for ${event} on quiz:${sessionId}:`, err.message);
    }
  },

  async broadcastPlayerJoined(sessionId, participant) {
    return this.broadcast(sessionId, 'PLAYER_JOINED', {
      participant: {
        id: participant.id,
        nickname: participant.nickname,
        avatar: participant.avatar,
        joined_at: participant.joined_at,
        score: participant.current_score || 0,
      },
    });
  },

  async broadcastPlayerLeft(sessionId, participantId) {
    return this.broadcast(sessionId, 'PLAYER_LEFT', { participantId });
  },

  async broadcastGameStarted(sessionId, sessionInfo) {
    return this.broadcast(sessionId, 'GAME_STARTED', {
      sessionId,
      startedAt: sessionInfo.started_at,
      totalQuestions: sessionInfo.totalQuestions,
    });
  },

  async broadcastQuestionStarted(sessionId, question) {
    // SECURITY: CRITICAL: Never broadcast correct answers or explanations to student clients!
    const sanitizedQuestion = {
      id: question.id,
      index: question.order_index,
      type: question.type,
      prompt: question.prompt,
      options: question.options,
      difficulty: question.difficulty,
      points: question.points,
      timeLimit: question.time_limit,
      learningObjective: question.learning_objective,
      mediaUrl: question.media_url,
      startedAt: new Date().toISOString(),
    };

    return this.broadcast(sessionId, 'QUESTION_STARTED', {
      question: sanitizedQuestion,
    });
  },

  async broadcastAnswerSubmitted(sessionId, { participantId, responseCount, totalParticipants }) {
    return this.broadcast(sessionId, 'ANSWER_SUBMITTED', {
      participantId,
      responseCount,
      totalParticipants,
    });
  },

  async broadcastQuestionEnded(sessionId, { questionId, correctAnswer, explanation, stats }) {
    return this.broadcast(sessionId, 'QUESTION_ENDED', {
      questionId,
      correctAnswer,
      explanation,
      stats, // e.g. { totalResponses: 12, correctCount: 9, optionBreakdown: { 'A': 9, 'B': 2... } }
    });
  },

  async broadcastLeaderboardUpdated(sessionId, leaderboard) {
    return this.broadcast(sessionId, 'LEADERBOARD_UPDATED', {
      leaderboard,
    });
  },

  async broadcastGameFinished(sessionId, finalSummary) {
    return this.broadcast(sessionId, 'GAME_FINISHED', {
      finalSummary,
    });
  },

  /**
   * Clean up channel when session terminates.
   */
  async closeSessionChannel(sessionId) {
    if (activeChannels.has(sessionId)) {
      const channel = activeChannels.get(sessionId);
      await supabase.removeChannel(channel);
      activeChannels.delete(sessionId);
    }
  },
};

module.exports = RealtimeService;
