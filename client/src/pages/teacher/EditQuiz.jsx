import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuizService from '../../services/quiz.service';

export const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const res = await QuizService.getQuiz(id);
      setQuiz(res.quiz);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await QuizService.updateQuiz(id, {
        title: quiz.title,
        description: quiz.description,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        questions: quiz.questions,
      });
      alert('Quiz updated successfully!');
      navigate('/teacher/quizzes');
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleHost = async () => {
    try {
      const res = await QuizService.createSession(id, {
        antigravityMode: true,
        streakBonus: true,
      });
      navigate(`/teacher/quizzes/${res.session.id}/host`);
    } catch (err) {
      alert(`Failed to host: ${err.message}`);
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...(quiz.questions || [])];
    updated[index] = { ...updated[index], [field]: value };
    setQuiz({ ...quiz, questions: updated });
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="p-8 text-center space-y-4">
        <i className="ri-error-warning-line text-4xl text-error" />
        <p className="font-bold text-error">{error || 'Quiz not found'}</p>
        <button
          onClick={() => navigate('/teacher/quizzes')}
          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
        >
          Return to Quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/teacher/quizzes')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary mb-2 cursor-pointer"
          >
            <i className="ri-arrow-left-line text-sm" />
            <span>Back to Quizzes</span>
          </button>
          <h1 className="text-2xl font-black font-headline text-on-surface tracking-tight">Edit Quiz Arena</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleHost}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <i className="ri-play-fill text-yellow-300" />
            <span>Host Arena</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary-container active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer font-headline"
          >
            {saving ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-save-line" />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Basic Info Card */}
      <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface">Quiz Title</label>
            <input
              type="text"
              value={quiz.title || ''}
              onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-sm font-semibold text-on-surface"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface">Topic</label>
            <input
              type="text"
              value={quiz.topic || ''}
              onChange={(e) => setQuiz({ ...quiz, topic: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-sm font-semibold text-on-surface"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-on-surface">Description</label>
          <textarea
            rows={2}
            value={quiz.description || ''}
            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface resize-none"
          />
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-on-surface font-headline">Questions ({quiz.questions?.length})</h2>
        {(quiz.questions || []).map((q, idx) => (
          <div key={q.id || idx} className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black font-headline">
                {idx + 1}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-secondary uppercase bg-secondary/10 px-2 py-0.5 rounded-md font-headline">
                  {q.type}
                </span>
                <span className="text-xs text-on-surface-variant font-mono">
                  Level {q.difficulty || 2}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface">Prompt</label>
              <textarea
                rows={2}
                value={q.prompt || ''}
                onChange={(e) => updateQuestion(idx, 'prompt', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-sm text-on-surface resize-none font-medium"
              />
            </div>

            {/* Options */}
            {Array.isArray(q.options) && q.options.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface">Options</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...q.options];
                          newOpts[oIdx] = e.target.value;
                          updateQuestion(idx, 'options', newOpts);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Correct Answer & Explanation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-success">Correct Answer</label>
                <input
                  type="text"
                  value={Array.isArray(q.correct_answer) ? q.correct_answer.join(', ') : String(q.correct_answer || '')}
                  onChange={(e) => updateQuestion(idx, 'correct_answer', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-success/5 border border-success/30 text-xs font-bold text-success"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface">Time Limit (seconds)</label>
                <input
                  type="number"
                  value={q.time_limit || 30}
                  onChange={(e) => updateQuestion(idx, 'time_limit', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditQuiz;
