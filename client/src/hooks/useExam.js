import { useCallback } from 'react';
import { useExamStore } from '../store/examStore';
import { examService } from '../services/exam.service';

export const useExam = () => {
  const { 
    exams, 
    currentExam, 
    loading, 
    error, 
    setExams, 
    setCurrentExam, 
    setLoading, 
    setError,
    addExam,
    updateExam,
    deleteExam
  } = useExamStore();

  const fetchExams = useCallback(async (force = false) => {
    const existing = useExamStore.getState().exams;
    if (!existing || existing.length === 0 || force) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await examService.getExams();
      setExams(data.exams || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch exams');
      if (!existing || existing.length === 0) setExams([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setExams, setError]);

  const fetchExamById = useCallback(async (id) => {
    const current = useExamStore.getState().currentExam;
    if (!current || current.id !== id) {
      setLoading(true);
    }
    try {
      const data = await examService.getExamById(id);
      const examData = data.exam || data;
      setCurrentExam(examData);
      return examData;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch exam');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setCurrentExam, setError]);

  const createExam = useCallback(async (examData) => {
    setLoading(true);
    try {
      const data = await examService.createExam(examData);
      addExam(data.exam || data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, addExam, setError]);

  return {
    exams,
    currentExam,
    loading,
    error,
    fetchExams,
    fetchExamById,
    createExam,
    updateExam,
    deleteExam
  };
};
