const supabase = require('../config/supabase');
const logger = require('../utils/logger');
const crypto = require('crypto');
const { store, persist } = require('./storeFallback');

function generateJoinCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const QuizSessionModel = {
  /**
   * Create a new multiplayer session.
   */
  async create({ quizId, hostId, settings = {} }) {
    const sessionId = crypto.randomUUID();
    const joinCode = generateJoinCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(); // 4 hours

    const record = {
      id: sessionId,
      quiz_id: quizId,
      host_id: hostId,
      join_code: joinCode,
      status: 'LOBBY',
      current_question_index: 0,
      question_started_at: null,
      started_at: null,
      ended_at: null,
      expires_at: expiresAt,
      settings: {
        adaptive: false,
        antigravityMode: false,
        streakBonus: true,
        showLeaderboardBetweenQuestions: true,
        ...settings,
      },
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    let session = null;
    if (process.env.NODE_ENV === 'test') {
      store.quiz_sessions.set(sessionId, record);
      return record;
    }

    try {
      const { data, error } = await supabase.from('quiz_sessions').insert(record).select().single();
      if (!error && data) session = data;
    } catch (err) {
      logger.warn(`Supabase quiz_sessions.insert fallback (${err.message})`);
    }

    if (!session) {
      store.quiz_sessions.set(sessionId, record);
      persist();
      session = record;
    }

    return session;
  },

  /**
   * Find session by ID.
   */
  async findById(sessionId) {
    let session = null;
    if (process.env.NODE_ENV !== 'test') {
      try {
        const { data, error } = await supabase.from('quiz_sessions').select('*').eq('id', sessionId).single();
        if (!error && data) session = data;
      } catch {
        // Fallback
      }
    }

    if (!session) {
      session = store.quiz_sessions.get(sessionId) || null;
    }

    return session;
  },

  /**
   * Find session by join code (case-insensitive).
   */
  async findByJoinCode(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    let session = null;

    if (process.env.NODE_ENV !== 'test') {
      try {
        const { data, error } = await supabase
          .from('quiz_sessions')
          .select('*')
          .ilike('join_code', cleanCode)
          .single();
        if (!error && data) session = data;
      } catch {
        // Fallback
      }
    }

    if (!session) {
      for (const s of store.quiz_sessions.values()) {
        if (s.join_code && s.join_code.toUpperCase() === cleanCode) {
          session = s;
          break;
        }
      }
    }

    return session;
  },

  /**
   * Update session record.
   */
  async update(sessionId, fields) {
    const updated = { ...fields, updated_at: new Date().toISOString() };

    if (process.env.NODE_ENV === 'test') {
      const existing = store.quiz_sessions.get(sessionId) || {};
      const merged = { ...existing, ...updated };
      store.quiz_sessions.set(sessionId, merged);
      return merged;
    }

    try {
      const { data, error } = await supabase.from('quiz_sessions').update(updated).eq('id', sessionId).select().single();
      if (!error && data) return data;
    } catch {
      // Fallback
    }

    const existing = store.quiz_sessions.get(sessionId);
    if (existing) {
      const merged = { ...existing, ...updated };
      store.quiz_sessions.set(sessionId, merged);
      persist();
      return merged;
    }

    return null;
  },

  /**
   * List sessions hosted by teacher.
   */
  async listByHost(hostId) {
    let sessions = [];
    try {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('host_id', hostId)
        .order('created_at', { ascending: false });
      if (!error && data) sessions = data;
    } catch {
      // Fallback
    }

    if (sessions.length === 0) {
      sessions = Array.from(store.quiz_sessions.values())
        .filter((s) => !hostId || s.host_id === hostId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return sessions;
  },
};

module.exports = QuizSessionModel;
