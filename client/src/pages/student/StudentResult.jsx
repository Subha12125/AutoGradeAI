import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import QuizService from '../../services/quiz.service';
import useArenaTheme from '../../hooks/useArenaTheme';
import ArenaThemeToggle from '../../components/common/ArenaThemeToggle';

export const StudentResult = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // Arena Color Tone controller (persisted Light / Dark)
  const { isDark, toggleTheme } = useArenaTheme('dark');

  const [resultsData, setResultsData] = useState(null);
  const [participant, setParticipant] = useState(() => {
    try {
      const stored = sessionStorage.getItem(`quiz_participant_${sessionId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [sessionId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const res = await QuizService.getResults(sessionId);
      setResultsData(res);

      // Trigger celebratory confetti blast
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#F59E0B', '#10B981', '#38BDF8', '#EC4899', '#A855F7'],
      });
    } catch (err) {
      console.error('Error loading results:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center space-y-4 ${
        isDark ? 'bg-[#090514] text-white' : 'bg-[#F4F6FB] text-slate-800'
      }`}>
        <div className="w-16 h-16 rounded-full border-4 border-fuchsia-500/20 border-t-fuchsia-500 animate-spin" />
        <p className={`font-black text-sm uppercase tracking-widest font-headline animate-pulse ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Tallying Final Standings...
        </p>
      </div>
    );
  }

  const myRankEntry = resultsData?.leaderboard?.find((p) => p.id === participant?.id) || {
    rank: 1,
    score: participant?.current_score || 0,
    streak: participant?.streak || 0,
    level: 1,
    xp: 150,
    badges: [],
  };

  const isWinner = myRankEntry.rank === 1;

  return (
    <div className={`min-h-screen flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans transition-colors duration-300 ${
      isDark ? 'bg-[#090a0f] text-slate-100 selection:bg-indigo-500' : 'bg-[#f8fafc] text-slate-900 selection:bg-indigo-200'
    }`}>
      {/* Top Floating Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ArenaThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
      </div>

      <div className="max-w-md w-full mx-auto space-y-6 pt-6 relative z-10">
        {/* Celebration Trophy Header */}
        <div className="text-center space-y-3">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-400 blur-lg animate-pulse opacity-75" />
            <div className={`relative w-full h-full rounded-full border-2 border-amber-400/50 flex items-center justify-center text-5xl shadow-2xl ${
              isDark ? 'bg-[#130A2A]' : 'bg-white shadow-amber-500/10'
            }`}>
              <i className="ri-trophy-fill text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 to-yellow-500" />
            </div>
          </div>

          <div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest font-headline ${
              isDark ? 'bg-amber-400/20 border border-amber-400/30 text-amber-300' : 'bg-amber-50 border border-amber-300 text-amber-700'
            }`}>
              <span>{isWinner ? '🏆 VICTORY ROYALE!' : 'ARENA COMPLETED'}</span>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-black font-headline tracking-tight mt-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Final Standings
            </h1>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {resultsData?.quiz?.title || 'Multiplayer Quiz Arena'}
            </p>
          </div>
        </div>

        {/* Player Result Summary Card */}
        <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center transition-colors duration-300 ${
          isDark ? 'bg-white/[0.04] backdrop-blur-2xl border-white/10' : 'bg-white border-slate-200/90 shadow-slate-200/60'
        }`}>
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 p-0.5 shadow-lg shadow-amber-400/25">
              <div className={`w-full h-full rounded-[14px] flex items-center justify-center text-2xl font-black font-headline ${
                isDark ? 'bg-[#130A2A] text-amber-300' : 'bg-white text-amber-600'
              }`}>
                #{myRankEntry.rank}
              </div>
            </div>
            <div className="text-left">
              <p className={`text-lg font-black font-headline ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {participant?.nickname || 'Player'}
              </p>
              <p className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <span className="text-amber-500 font-bold text-sm">{myRankEntry.score}</span> Points • Max Streak: <span className="text-orange-500 font-bold">{myRankEntry.streak}🔥</span>
              </p>
            </div>
          </div>

          {/* Gamification Stats Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className={`p-4 rounded-2xl border space-y-1 ${
              isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              <span className={`text-[10px] font-black uppercase font-headline ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>XP Earned</span>
              <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 font-mono">
                +{myRankEntry.xp || 150} XP
              </p>
              <p className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Rank Tier: Level {myRankEntry.level || 1}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-1 ${
              isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              <span className={`text-[10px] font-black uppercase font-headline ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>Accuracy</span>
              <p className="text-xl font-black text-emerald-500 font-mono">
                {resultsData?.analytics?.overallAccuracy || 80}%
              </p>
              <p className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Topic Mastery
              </p>
            </div>
          </div>

          {/* Badges Earned */}
          {Array.isArray(myRankEntry.badges) && myRankEntry.badges.length > 0 && (
            <div className={`space-y-2 pt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <p className={`text-xs font-black uppercase tracking-wider font-headline ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Achievements Unlocked
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {myRankEntry.badges.map((b, idx) => (
                  <div
                    key={idx}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 font-headline shadow-md ${
                      isDark ? 'bg-fuchsia-500/20 border-fuchsia-400/40 text-fuchsia-300' : 'bg-fuchsia-50 border-fuchsia-300 text-fuchsia-700'
                    }`}
                  >
                    <i className="ri-medal-fill text-amber-400" />
                    <span>{b.title || b.id || b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate('/')}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-primary to-cyan-500 text-white font-black text-base shadow-[0_6px_0_#7e22ce] active:translate-y-1 active:shadow-[0_2px_0_#7e22ce] hover:brightness-110 transition-all cursor-pointer font-headline"
        >
          Return to Arena Home
        </button>
      </div>

      <footer className={`text-center text-[10px] font-mono py-4 relative z-10 ${
        isDark ? 'text-slate-600' : 'text-slate-400'
      }`}>
        AI QUIZ ARENA • MULTIPLAYER BATTLE ROYALE
      </footer>
    </div>
  );
};

export default StudentResult;
