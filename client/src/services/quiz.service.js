import api from './api';

export const QuizService = {
  // AI generation
  generateQuiz: async (params) => {
    const response = await api.post('/quizzes/generate', params);
    return response.data;
  },

  regenerateQuestion: async (params) => {
    const response = await api.post('/quizzes/regenerate-question', params);
    return response.data;
  },

  // Quizzes CRUD
  createQuiz: async (quizData) => {
    const response = await api.post('/quizzes', quizData);
    return response.data;
  },

  getQuizzes: async () => {
    const response = await api.get('/quizzes');
    return response.data;
  },

  getQuiz: async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  },

  updateQuiz: async (quizId, quizData) => {
    const response = await api.put(`/quizzes/${quizId}`, quizData);
    return response.data;
  },

  deleteQuiz: async (quizId) => {
    const response = await api.delete(`/quizzes/${quizId}`);
    return response.data;
  },

  // Multiplayer Sessions
  createSession: async (quizId, settings = {}) => {
    const response = await api.post('/sessions', { quizId, settings });
    return response.data;
  },

  getSession: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },

  getSessionByCode: async (code) => {
    const response = await api.get(`/sessions/by-code/${code}`);
    return response.data;
  },

  joinSession: async (sessionId, { nickname, avatar }) => {
    const response = await api.post(`/sessions/${sessionId}/join`, { nickname, avatar });
    return response.data;
  },

  startSession: async (sessionId) => {
    const response = await api.post(`/sessions/${sessionId}/start`);
    return response.data;
  },

  pauseSession: async (sessionId) => {
    const response = await api.post(`/sessions/${sessionId}/pause`);
    return response.data;
  },

  nextQuestion: async (sessionId) => {
    const response = await api.post(`/sessions/${sessionId}/next`);
    return response.data;
  },

  endSession: async (sessionId) => {
    const response = await api.post(`/sessions/${sessionId}/end`);
    return response.data;
  },

  submitAnswer: async (sessionId, { participantId, questionId, answer }) => {
    const response = await api.post(`/sessions/${sessionId}/answer`, {
      participantId,
      questionId,
      answer,
    });
    return response.data;
  },

  getLeaderboard: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}/leaderboard`);
    return response.data;
  },

  getResults: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}/results`);
    return response.data;
  },
};

export default QuizService;
