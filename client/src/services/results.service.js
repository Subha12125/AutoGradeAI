import api from './api';

export const resultsService = {
  getExamResults: async (examId) => {
    const response = await api.get(`/results/${examId}`);
    return response.data;
  },

  getStudentResult: async (examId, studentId) => {
    const response = await api.get(`/results/${examId}/student/${studentId}`);
    return response.data;
  },

  exportResults: async (examId, format = 'csv') => {
    const response = await api.get(`/results/${examId}/export/${format}`, {
      responseType: 'blob'
    });
    return response.data;
  },
};
