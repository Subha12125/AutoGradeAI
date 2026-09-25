import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import QuizService from '../../services/quiz.service';

export const QuizResults = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session') || id;

  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResults();
  }, [sessionId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const res = await QuizService.getResults(sessionId);
      setResultsData(res);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-bold text-xs text-on-surface-variant">Computing Arena Analytics...</p>
      </div>
    );
  }

  if (error || !resultsData) {
    return (
      <div className="p-8 text-center space-y-4">
        <i className="ri-error-warning-line text-4xl text-error" />
        <p className="font-bold text-error">{error || 'Results not found'}</p>
        <button onClick={() => navigate('/teacher/quizzes')} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold">
          Back to Quizzes
        </button>
      </div>
    );
  }

  const { quiz, analytics, leaderboard } = resultsData;
  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8">
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
          <h1 className="text-2xl md:text-3xl font-black font-headline text-on-surface tracking-tight">
            Arena Results & Analytics
          </h1>
          <p className="text-xs text-on-surface-variant">
            {quiz.title} • {quiz.topic} • {analytics.totalParticipants} Participants
          </p>
        </div>

        <button
          onClick={() => navigate('/teacher/quizzes')}
          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary-container active:scale-95 transition-all cursor-pointer font-headline"
        >
          Return to Dashboard
        </button>
      </div>

      {/* Analytics High-Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl">
            <i className="ri-user-star-line" />
          </div>
          <div>
            <p className="text-2xl font-black text-on-surface font-headline">{analytics.totalParticipants}</p>
            <p className="text-xs text-on-surface-variant font-medium">Students Competed</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success text-2xl">
            <i className="ri-pie-chart-line" />
          </div>
          <div>
            <p className="text-2xl font-black text-on-surface font-headline">{analytics.overallAccuracy}%</p>
            <p className="text-xs text-on-surface-variant font-medium">Overall Accuracy</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary text-2xl">
            <i className="ri-questionnaire-line" />
          </div>
          <div>
            <p className="text-2xl font-black text-on-surface font-headline">{analytics.questionBreakdown?.length || 0}</p>
            <p className="text-xs text-on-surface-variant font-medium">Total Questions</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning text-2xl">
            <i className="ri-flashlight-line" />
          </div>
          <div>
            <p className="text-2xl font-black text-on-surface font-headline">{analytics.totalAnswersSubmitted}</p>
            <p className="text-xs text-on-surface-variant font-medium">Answers Recorded</p>
          </div>
        </div>
      </div>

      {/* Podium Showcase */}
      {top3.length > 0 && (
        <div className="bg-gradient-to-b from-surface-container-lowest to-surface-container p-6 sm:p-8 rounded-3xl border border-outline-variant/20 shadow-sm text-center space-y-6">
          <h2 className="text-xl font-black text-on-surface font-headline">Winner Podium</h2>
          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-xl mx-auto items-end pt-4">
            {/* 2nd Place */}
            {top3[1] && (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-300 text-slate-800 font-black text-lg mx-auto flex items-center justify-center shadow-md font-headline">
                  2
                </div>
                <p className="text-xs font-bold text-on-surface truncate">{top3[1].nickname}</p>
                <div className="bg-slate-300/30 rounded-t-2xl py-6 px-2 font-mono font-black text-sm text-slate-700 dark:text-slate-200">
                  {top3[1].score} pts
                </div>
              </div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <div className="space-y-2">
                <div className="w-16 h-16 rounded-full bg-amber-400 text-slate-950 font-black text-2xl mx-auto flex items-center justify-center shadow-xl border-4 border-white font-headline">
                  👑
                </div>
                <p className="text-sm font-black text-on-surface truncate font-headline">{top3[0].nickname}</p>
                <div className="bg-amber-400/30 rounded-t-2xl py-10 px-2 font-mono font-black text-base text-amber-800 dark:text-amber-200">
                  {top3[0].score} pts
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-700 text-white font-black text-lg mx-auto flex items-center justify-center shadow-md font-headline">
                  3
                </div>
                <p className="text-xs font-bold text-on-surface truncate">{top3[2].nickname}</p>
                <div className="bg-amber-700/20 rounded-t-2xl py-4 px-2 font-mono font-black text-sm text-amber-900 dark:text-amber-200">
                  {top3[2].score} pts
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Question Breakdown Analysis */}
      <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm space-y-4">
        <h2 className="text-base font-black text-on-surface font-headline">Question Accuracy Breakdown</h2>
        <div className="space-y-3">
          {(analytics.questionBreakdown || []).map((q, idx) => (
            <div key={q.id || idx} className="p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center font-headline">
                    {idx + 1}
                  </span>
                  <span className="text-[11px] font-bold uppercase text-secondary font-headline">
                    {q.type} • Level {q.difficulty || 2}
                  </span>
                </div>
                <p className="text-xs font-bold text-on-surface line-clamp-1">{q.prompt}</p>
                <p className="text-[11px] text-success font-semibold">Correct: {Array.isArray(q.correct_answer) ? q.correct_answer.join(', ') : String(q.correct_answer)}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-on-surface-variant">
                    {q.correctCount} / {q.totalResponses} Correct
                  </p>
                  <p className="text-[11px] text-on-surface-variant">Avg: {q.avgResponseTimeSec}s</p>
                </div>
                <div className="w-16 text-right">
                  <span className={`text-sm font-black font-mono ${q.accuracy >= 70 ? 'text-success' : q.accuracy >= 40 ? 'text-warning' : 'text-error'}`}>
                    {q.accuracy}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm space-y-4">
        <h2 className="text-base font-black text-on-surface font-headline">Participant Standings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-outline-variant/20 text-on-surface-variant font-bold">
                <th className="pb-3 pl-2">Rank</th>
                <th className="pb-3">Player</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Max Streak</th>
                <th className="pb-3">XP Level</th>
                <th className="pb-3">Badges Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {leaderboard.map((p, idx) => (
                <tr key={p.id} className="hover:bg-surface-container-high/20 transition-colors">
                  <td className="py-3 pl-2 font-mono font-black text-on-surface">#{idx + 1}</td>
                  <td className="py-3 font-bold text-on-surface">{p.nickname}</td>
                  <td className="py-3 font-mono font-black text-primary">{p.score} pts</td>
                  <td className="py-3 font-mono font-bold text-amber-500">{p.streak || 0}</td>
                  <td className="py-3 font-semibold text-on-surface">Level {p.level || 1} ({p.xp || 0} XP)</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {(p.badges || []).map((b, bIdx) => (
                        <span key={bIdx} className="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-[10px] font-bold">
                          {b.title || b.id || b}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
