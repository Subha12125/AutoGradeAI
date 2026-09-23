import { useCallback } from 'react';
import { useEvaluationStore } from '../store/evaluationStore';
import { evaluationService } from '../services/evaluation.service';

export const useEvaluation = () => {
  const { 
    evaluations, 
    progress, 
    isEvaluating, 
    error,
    setEvaluations,
    setProgress,
    setEvaluating,
    setError,
    updateEvaluationStatus
  } = useEvaluationStore();

  const startEvaluation = useCallback(async (examId, files) => {
    setEvaluating(true);
    setProgress(0);
    try {
      const data = await evaluationService.startEvaluation(examId, files);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Evaluation failed to start');
      throw err;
    } finally {
      setEvaluating(false);
    }
  }, [setEvaluating, setProgress, setError]);

  const fetchResults = useCallback(async (examId) => {
    setEvaluating(true);
    try {
      const data = await evaluationService.getEvaluationResults(examId);
      setEvaluations(data.results || []);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch results');
    } finally {
      setEvaluating(false);
    }
  }, [setEvaluating, setEvaluations, setError]);

  const fetchStatus = useCallback(async (examId) => {
    try {
      const data = await evaluationService.getEvaluationStatus(examId);
      if (data.counts) {
        const total = data.total || 1;
        const completed = (data.counts.completed || 0) + (data.counts.failed || 0);
        setProgress(Math.round((completed / total) * 100));
      }
      setEvaluations(data.evaluations || []);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch status');
    }
  }, [setEvaluations, setProgress, setError]);

  return {
    evaluations,
    progress,
    isEvaluating,
    loading: isEvaluating,
    error,
    setProgress,
    setEvaluations,
    startEvaluation,
    fetchResults,
    fetchStatus,
    updateEvaluationStatus
  };
};
