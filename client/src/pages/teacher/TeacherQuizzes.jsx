import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizService from '../../services/quiz.service';

export const TeacherQuizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [hostingId, setHostingId] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await QuizService.getQuizzes();
      setQuizzes(res.quizzes || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleHost = async (quizId) => {
    try {
      setHostingId(quizId);
      const res = await QuizService.createSession(quizId, {
        antigravityMode: true,
        adaptive: false,
        streakBonus: true,
      });
      navigate(`/teacher/quizzes/${res.session.id}/host`);
    } catch (err) {
      alert(`Failed to start session: ${err.response?.data?.error || err.message}`);
      setHostingId(null);
    }
  };

  const handleDelete = async (quizId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await QuizService.deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (err) {
      alert(`Failed to delete quiz: ${err.message}`);
    }
  };

  const filteredQuizzes = quizzes.filter(
    (q) =>
      (q.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (q.topic || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 p-6 rounded-3xl border border-primary/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider mb-2 font-headline">
            <i className="ri-gamepad-line text-sm" />
            <span>Multiplayer AI Quiz Arena</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-headline text-on-surface tracking-tight">
            AI Quiz Arena
          </h1>
          <p className="text-sm text-on-surface-variant max-w-xl mt-1">
            Transform traditional quizzes into live real-time classroom games with AI question generation, QR codes, streaks, and 3D Antigravity mode.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => navigate('/teacher/quizzes/create')}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/25 hover:bg-primary-container active:scale-95 transition-all cursor-pointer font-headline"
          >
            <i className="ri-sparkling-fill text-lg text-yellow-300" />
            <span>Generate AI Quiz</span>
          </button>
        </div>

        {/* Decorative backdrop shapes */}
        <i className="ri-rocket-2-line absolute -right-6 -bottom-8 text-9xl text-primary/10 pointer-events-none" />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl">
            <i className="ri-questionnaire-line" />
          </div>
          <div>
            <p className="text-2xl font-black text-on-surface font-headline">{quizzes.length}</p>
            <p className="text-xs text-on-surface-variant font-medium">Total Quizzes</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary text-2xl">
            <i className="ri-flashlight-line" />
          </div>
          <div>
            <p className="text-2xl font-black text-on-surface font-headline">
              {quizzes.reduce((acc, q) => acc + (q.questionsCount || (q.questions || []).length || 0), 0)}
            </p>
            <p className="text-xs text-on-surface-variant font-medium">Questions Bank</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary text-2xl">
            <i className="ri-qr-code-line" />
          </div>
          <div>
            <p className="text-2xl font-black text-on-surface font-headline">Instant</p>
            <p className="text-xs text-on-surface-variant font-medium">QR Join & Leaderboards</p>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base" />
          <input
            type="text"
            placeholder="Search by topic or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
          />
        </div>

        <button
          onClick={loadQuizzes}
          className="px-3.5 py-2 rounded-xl bg-surface-container-high text-on-surface font-semibold text-xs hover:bg-surface-container-highest transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <i className="ri-refresh-line" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Quizzes List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-on-surface-variant">Loading your quiz arena...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-error/10 border border-error/20 text-center space-y-3">
          <i className="ri-error-warning-line text-3xl text-error" />
          <p className="text-sm font-bold text-error">{error}</p>
          <button
            onClick={loadQuizzes}
            className="px-4 py-2 bg-error text-white text-xs font-bold rounded-xl"
          >
            Retry
          </button>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="py-16 text-center bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant/40 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl mx-auto">
            <i className="ri-sparkles-line" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface font-headline">No quizzes found</h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
              Ready to challenge your students? Generate your first multiplayer quiz with Google Gemini in 10 seconds.
            </p>
          </div>
          <button
            onClick={() => navigate('/teacher/quizzes/create')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary-container transition-all cursor-pointer"
          >
            <i className="ri-add-line" />
            <span>Create AI Quiz</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map((quiz) => {
            const count = quiz.questionsCount || (quiz.questions || []).length || 0;
            return (
              <div
                key={quiz.id}
                className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-5 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-black uppercase tracking-wider font-headline">
                      {quiz.topic || 'General'}
                    </span>
                    <span className="text-xs font-semibold text-on-surface-variant capitalize px-2 py-0.5 rounded-md bg-surface-container-high">
                      {quiz.difficulty || 'Medium'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-headline font-black text-base text-on-surface tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                      {quiz.description || 'Interactive multiplayer assessment generated with AI.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-on-surface-variant pt-2 border-t border-outline-variant/10">
                    <span className="flex items-center gap-1 font-semibold">
                      <i className="ri-question-line text-primary" />
                      {count} {count === 1 ? 'Question' : 'Questions'}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-calendar-line text-on-surface-variant" />
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-outline-variant/10 flex items-center gap-2">
                  <button
                    onClick={() => handleHost(quiz.id)}
                    disabled={hostingId === quiz.id}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-md shadow-primary/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {hostingId === quiz.id ? (
                      <i className="ri-loader-4-line animate-spin text-sm" />
                    ) : (
                      <i className="ri-play-fill text-sm text-yellow-300" />
                    )}
                    <span>Host Live Arena</span>
                  </button>

                  <button
                    onClick={() => navigate(`/teacher/quizzes/${quiz.id}/edit`)}
                    className="p-2.5 rounded-xl bg-surface-container-high text-on-surface hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    title="Edit Quiz"
                  >
                    <i className="ri-edit-line text-base" />
                  </button>

                  <button
                    onClick={() => handleDelete(quiz.id, quiz.title)}
                    className="p-2.5 rounded-xl bg-surface-container-high text-on-surface hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                    title="Delete Quiz"
                  >
                    <i className="ri-delete-bin-line text-base" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherQuizzes;
