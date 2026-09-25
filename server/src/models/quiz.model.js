const supabase = require('../config/supabase');
const logger = require('../utils/logger');
const crypto = require('crypto');
const { store, persist } = require('./storeFallback');

const QuizModel = {
  /**
   * Create a new quiz with its questions.
   */
  async create({ teacherId, title, description, topic, difficulty = 'medium', status = 'draft', settings = {}, questions = [] }) {
    const quizId = crypto.randomUUID();
    const now = new Date().toISOString();

    const quizRecord = {
      id: quizId,
      teacher_id: teacherId,
      title,
      description: description || '',
      topic,
      difficulty,
      status,
      settings,
      created_at: now,
      updated_at: now,
    };

    let savedQuiz = null;

    if (process.env.NODE_ENV === 'test') {
      store.quizzes.set(quizId, quizRecord);
      savedQuiz = quizRecord;
    } else {
      try {
        const { data, error } = await supabase.from('quizzes').insert(quizRecord).select().single();
        if (error) throw error;
        savedQuiz = data;
      } catch (err) {
        logger.warn(`Supabase quizzes.insert fallback (${err.message}). Using local store.`);
        store.quizzes.set(quizId, quizRecord);
        persist();
        savedQuiz = quizRecord;
      }
    }

    // Save questions
    if (questions && questions.length > 0) {
      await this.saveQuestions(quizId, questions);
    }

    return await this.findById(quizId);
  },

  /**
   * Save questions for a quiz.
   */
  async saveQuestions(quizId, questions = []) {
    const formatted = questions.map((q, idx) => ({
      id: q.id || crypto.randomUUID(),
      quiz_id: quizId,
      type: (q.type || 'MCQ').toUpperCase(),
      prompt: q.prompt,
      options: q.options || [],
      correct_answer: q.correct_answer,
      explanation: q.explanation || '',
      difficulty: parseInt(q.difficulty, 10) || 2,
      points: parseInt(q.points, 10) || 100,
      time_limit: parseInt(q.time_limit || q.timeLimit, 10) || 30,
      learning_objective: q.learning_objective || q.learningObjective || '',
      media_url: q.media_url || q.mediaUrl || null,
      metadata: q.metadata || {},
      order_index: idx,
      created_at: new Date().toISOString(),
    }));

    if (process.env.NODE_ENV === 'test') {
      formatted.forEach((q) => store.quiz_questions.set(q.id, q));
      return formatted;
    }

    try {
      const { error } = await supabase.from('quiz_questions').insert(formatted);
      if (error) throw error;
    } catch (err) {
      logger.warn(`Supabase quiz_questions.insert fallback (${err.message}). Using local store.`);
      formatted.forEach((q) => store.quiz_questions.set(q.id, q));
      persist();
    }

    return formatted;
  },

  /**
   * Find quiz by ID including all questions.
   */
  async findById(quizId) {
    let quiz = null;

    if (process.env.NODE_ENV !== 'test') {
      try {
        const { data, error } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
        if (!error && data) quiz = data;
      } catch {
        // Fallback
      }
    }

    if (!quiz) {
      quiz = store.quizzes.get(quizId) || null;
    }

    if (!quiz) return null;

    // Fetch questions
    let questions = [];
    if (process.env.NODE_ENV !== 'test') {
      try {
        const { data, error } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('order_index', { ascending: true });
        if (!error && data && data.length > 0) questions = data;
      } catch {
        // Fallback
      }
    }

    if (questions.length === 0) {
      questions = Array.from(store.quiz_questions.values())
        .filter((q) => q.quiz_id === quizId)
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    }

    return {
      ...quiz,
      questions,
    };
  },

  /**
   * Find all quizzes created by a teacher.
   */
  async findByTeacher(teacherId) {
    let quizzes = [];

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });
      if (!error && data) quizzes = data;
    } catch {
      // Fallback
    }

    if (quizzes.length === 0) {
      quizzes = Array.from(store.quizzes.values())
        .filter((q) => !teacherId || q.teacher_id === teacherId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Attach questions count
    return quizzes.map((q) => {
      const questionsCount = Array.from(store.quiz_questions.values()).filter((item) => item.quiz_id === q.id).length;
      return {
        ...q,
        questionsCount: q.questionsCount || questionsCount,
      };
    });
  },

  /**
   * Update quiz details.
   */
  async update(quizId, fields) {
    const updated = { ...fields, updated_at: new Date().toISOString() };

    try {
      const { data, error } = await supabase.from('quizzes').update(updated).eq('id', quizId).select().single();
      if (!error && data) return data;
    } catch {
      // Fallback
    }

    const existing = store.quizzes.get(quizId);
    if (existing) {
      const merged = { ...existing, ...updated };
      store.quizzes.set(quizId, merged);
      persist();
      return merged;
    }

    return null;
  },

  /**
   * Delete quiz and associated questions.
   */
  async delete(quizId) {
    try {
      await supabase.from('quiz_questions').delete().eq('quiz_id', quizId);
      await supabase.from('quizzes').delete().eq('id', quizId);
    } catch {
      // Fallback
    }

    store.quizzes.delete(quizId);
    for (const [id, q] of store.quiz_questions.entries()) {
      if (q.quiz_id === quizId) {
        store.quiz_questions.delete(id);
      }
    }
    persist();
    return true;
  },
};

module.exports = QuizModel;
