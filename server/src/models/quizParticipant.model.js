const supabase = require('../config/supabase');
const logger = require('../utils/logger');
const crypto = require('crypto');
const { store, persist } = require('./storeFallback');

function sanitizeNickname(raw) {
  if (!raw) return 'Player';
  return String(raw)
    .replace(/[<>/"'&]/g, '')
    .trim()
    .substring(0, 30);
}

const QuizParticipantModel = {
  /**
   * Register a new participant or re-connect an existing one.
   */
  async join({ sessionId, studentId = null, nickname, avatar = 'rocket' }) {
    const cleanNick = sanitizeNickname(nickname);
    const existing = await this.findByNickname(sessionId, cleanNick);

    if (existing) {
      // Reconnection: update status to active and return
      await this.update(existing.id, { status: 'active' });
      return existing;
    }

    const participantId = crypto.randomUUID();
    const now = new Date().toISOString();

    const record = {
      id: participantId,
      session_id: sessionId,
      student_id: studentId,
      nickname: cleanNick,
      avatar: avatar || 'rocket',
      joined_at: now,
      status: 'active',
      current_score: 0,
      streak: 0,
      max_streak: 0,
      xp: 0,
      level: 1,
      badges: [],
      current_difficulty: 2,
      updated_at: now,
    };

    let participant = null;
    if (process.env.NODE_ENV === 'test') {
      store.quiz_participants.set(participantId, record);
      return record;
    }

    try {
      const { data, error } = await supabase.from('quiz_participants').insert(record).select().single();
      if (!error && data) participant = data;
    } catch (err) {
      logger.warn(`Supabase quiz_participants.insert fallback (${err.message})`);
    }

    if (!participant) {
      store.quiz_participants.set(participantId, record);
      persist();
      participant = record;
    }

    return participant;
  },

  async findById(participantId) {
    let participant = null;
    if (process.env.NODE_ENV !== 'test') {
      try {
        const { data, error } = await supabase.from('quiz_participants').select('*').eq('id', participantId).single();
        if (!error && data) participant = data;
      } catch {
        // Fallback
      }
    }

    if (!participant) {
      participant = store.quiz_participants.get(participantId) || null;
    }

    return participant;
  },

  async findByNickname(sessionId, nickname) {
    const clean = sanitizeNickname(nickname).toLowerCase();
    const all = await this.findBySession(sessionId);
    return all.find((p) => p.nickname && p.nickname.toLowerCase() === clean) || null;
  },

  async findBySession(sessionId) {
    let list = [];
    if (process.env.NODE_ENV !== 'test') {
      try {
        const { data, error } = await supabase
          .from('quiz_participants')
          .select('*')
          .eq('session_id', sessionId)
          .order('current_score', { ascending: false });
        if (!error && data) list = data;
      } catch {
        // Fallback
      }
    }

    if (list.length === 0) {
      list = Array.from(store.quiz_participants.values())
        .filter((p) => p.session_id === sessionId)
        .sort((a, b) => (b.current_score || 0) - (a.current_score || 0));
    }

    return list;
  },

  async update(participantId, fields) {
    const updated = { ...fields, updated_at: new Date().toISOString() };

    if (process.env.NODE_ENV === 'test') {
      const existing = store.quiz_participants.get(participantId) || {};
      const merged = { ...existing, ...updated };
      store.quiz_participants.set(participantId, merged);
      return merged;
    }

    try {
      const { data, error } = await supabase.from('quiz_participants').update(updated).eq('id', participantId).select().single();
      if (!error && data) return data;
    } catch {
      // Fallback
    }

    const existing = store.quiz_participants.get(participantId);
    if (existing) {
      const merged = { ...existing, ...updated };
      store.quiz_participants.set(participantId, merged);
      persist();
      return merged;
    }

    return null;
  },

  async updateScore(participantId, { pointsDelta, newStreak, xpDelta, badges, currentDifficulty }) {
    const participant = await this.findById(participantId);
    if (!participant) return null;

    const newScore = (participant.current_score || 0) + (pointsDelta || 0);
    const maxStreak = Math.max(participant.max_streak || 0, newStreak || 0);
    const newXp = (participant.xp || 0) + (xpDelta || 0);
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

    const fields = {
      current_score: newScore,
      streak: newStreak,
      max_streak: maxStreak,
      xp: newXp,
      level: newLevel,
      updated_at: new Date().toISOString(),
    };

    if (badges) fields.badges = badges;
    if (currentDifficulty) fields.current_difficulty = currentDifficulty;

    return await this.update(participantId, fields);
  },
};

module.exports = QuizParticipantModel;
