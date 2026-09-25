const supabase = require('../config/supabase');
const logger = require('../utils/logger');
const crypto = require('crypto');
const { store, persist } = require('./storeFallback');

const QuizAnswerModel = {
  /**
   * Record a participant's answer submission.
   */
  async record({ sessionId, participantId, questionId, answer, isCorrect, responseTime = 0, pointsAwarded = 0 }) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const record = {
      id,
      session_id: sessionId,
      participant_id: participantId,
      question_id: questionId,
      answer,
      is_correct: !!isCorrect,
      response_time: parseInt(responseTime, 10) || 0,
      points_awarded: parseInt(pointsAwarded, 10) || 0,
      submitted_at: now,
    };

    let saved = null;
    if (process.env.NODE_ENV === 'test') {
      store.quiz_answers.set(id, record);
      return record;
    }

    try {
      const { data, error } = await supabase.from('quiz_answers').insert(record).select().single();
      if (!error && data) saved = data;
    } catch (err) {
      logger.warn(`Supabase quiz_answers.insert fallback (${err.message})`);
    }

    if (!saved) {
      store.quiz_answers.set(id, record);
      persist();
      saved = record;
    }

    return saved;
  },

  /**
   * Find if participant already answered this question in this session.
   */
  async findSubmission(sessionId, participantId, questionId) {
    if (process.env.NODE_ENV !== 'test') {
      try {
        const { data, error } = await supabase
          .from('quiz_answers')
          .select('*')
          .eq('session_id', sessionId)
          .eq('participant_id', participantId)
          .eq('question_id', questionId)
          .single();
        if (!error && data) return data;
      } catch {
        // Fallback
      }
    }

    for (const a of store.quiz_answers.values()) {
      if (a.session_id === sessionId && a.participant_id === participantId && a.question_id === questionId) {
        return a;
      }
    }

    return null;
  },

  /**
   * Get all answers for a question in a session (for response distribution).
   */
  async findByQuestion(sessionId, questionId) {
    if (process.env.NODE_ENV !== 'test') {
      try {
        const { data, error } = await supabase
          .from('quiz_answers')
          .select('*')
          .eq('session_id', sessionId)
          .eq('question_id', questionId);
        if (!error && data) return data;
      } catch {
        // Fallback
      }
    }

    return Array.from(store.quiz_answers.values()).filter(
      (a) => a.session_id === sessionId && a.question_id === questionId
    );
  },

  /**
   * Get all answers for a session.
   */
  async findBySession(sessionId) {
    if (process.env.NODE_ENV !== 'test') {
      try {
        const { data, error } = await supabase
          .from('quiz_answers')
          .select('*')
          .eq('session_id', sessionId);
        if (!error && data) return data;
      } catch {
        // Fallback
      }
    }

    return Array.from(store.quiz_answers.values()).filter((a) => a.session_id === sessionId);
  },

  /**
   * Get all answers submitted by a participant in a session.
   */
  async findByParticipant(sessionId, participantId) {
    if (process.env.NODE_ENV !== 'test') {
      try {
        const { data, error } = await supabase
          .from('quiz_answers')
          .select('*')
          .eq('session_id', sessionId)
          .eq('participant_id', participantId);
        if (!error && data) return data;
      } catch {
        // Fallback
      }
    }

    return Array.from(store.quiz_answers.values()).filter(
      (a) => a.session_id === sessionId && a.participant_id === participantId
    );
  },
};

module.exports = QuizAnswerModel;
