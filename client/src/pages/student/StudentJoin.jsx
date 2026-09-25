import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuizService from '../../services/quiz.service';
import useArenaTheme from '../../hooks/useArenaTheme';
import ArenaThemeToggle from '../../components/common/ArenaThemeToggle';

const AVATARS = [
  { id: 'rocket', icon: 'ri-rocket-2-fill', color: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-400/50' },
  { id: 'fire', icon: 'ri-fire-fill', color: 'bg-amber-500/20 text-amber-400 border-amber-400/50' },
  { id: 'lightning', icon: 'ri-flashlight-fill', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-400/50' },
  { id: 'crown', icon: 'ri-vip-crown-fill', color: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/50' },
  { id: 'brain', icon: 'ri-brain-line', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-400/50' },
  { id: 'star', icon: 'ri-star-fill', color: 'bg-pink-500/20 text-pink-400 border-pink-400/50' },
];

export const StudentJoin = () => {
  const { code: routeCode } = useParams();
  const navigate = useNavigate();

  // Arena Color Tone controller (persisted Light / Dark)
  const { isDark, toggleTheme } = useArenaTheme('dark');

  const [code, setCode] = useState(routeCode || '');
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('rocket');
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (routeCode) {
      loadSessionByCode(routeCode);
    }
  }, [routeCode]);

  const loadSessionByCode = async (targetCode) => {
    try {
      setLoading(true);
      setError(null);
      const res = await QuizService.getSessionByCode(targetCode);
      setSessionInfo(res);
    } catch (err) {
      setError(err.response?.data?.error || 'Quiz session not found. Please check code.');
      setSessionInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (val) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8);
    setCode(clean);
    if (clean.length >= 6) {
      loadSessionByCode(clean);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('Please enter a player nickname.');
      return;
    }
    if (!sessionInfo?.session?.id) {
      setError('Please enter a valid active game code.');
      return;
    }

    try {
      setJoining(true);
      setError(null);
      const res = await QuizService.joinSession(sessionInfo.session.id, {
        nickname: nickname.trim(),
        avatar: selectedAvatar,
      });

      // Save participant in sessionStorage
      sessionStorage.setItem(`quiz_participant_${sessionInfo.session.id}`, JSON.stringify(res.participant));
      navigate(`/quiz/${sessionInfo.session.id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to join game');
      setJoining(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 relative font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#090a0f] text-slate-100 selection:bg-indigo-500' : 'bg-[#f8fafc] text-slate-900 selection:bg-indigo-200'
    }`}>
      {/* Top Floating Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ArenaThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest font-headline shadow-lg ${
            isDark ? 'bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 shadow-fuchsia-500/10' : 'bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-700 shadow-fuchsia-500/5'
          }`}>
            <i className="ri-gamepad-fill text-sm" />
            <span>AI Quiz Arena</span>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-black font-headline tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Join Live Game
          </h1>
          <p className={`text-xs sm:text-sm ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Enter your room code, pick your fighter avatar, and dominate the leaderboard!
          </p>
        </div>

        {/* Join Card */}
        <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-colors duration-300 ${
          isDark ? 'bg-white/[0.04] backdrop-blur-2xl border-white/10' : 'bg-white border-slate-200/90 shadow-slate-200/60'
        }`}>
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold flex items-center gap-2 animate-bounce">
              <i className="ri-error-warning-fill text-lg shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {sessionInfo && (
            <div className={`p-4 rounded-2xl border space-y-1 ${
              isDark
                ? 'bg-gradient-to-r from-fuchsia-500/15 via-primary/10 to-cyan-500/15 border-fuchsia-500/30'
                : 'bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              <span className={`text-[10px] font-black uppercase tracking-wider font-headline ${
                isDark ? 'text-cyan-300' : 'text-primary'
              }`}>
                Active Session Detected
              </span>
              <p className={`font-headline font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {sessionInfo.quiz?.title}
              </p>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {sessionInfo.quiz?.topic} • <span className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>{sessionInfo.participantCount} Players</span> In Lobby
              </p>
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            {/* Join Code Input */}
            <div className="space-y-1.5">
              <label className={`text-xs font-black uppercase tracking-wider font-headline ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Game Join Code
              </label>
              <input
                type="text"
                placeholder="e.g. X7K92P"
                value={code}
                maxLength={8}
                onChange={(e) => handleCodeChange(e.target.value)}
                className={`w-full px-4 py-3.5 rounded-2xl border-2 font-mono text-center text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400 focus:outline-none uppercase shadow-inner ${
                  isDark
                    ? 'bg-white/[0.05] border-fuchsia-500/40 focus:border-cyan-400 placeholder:text-slate-600'
                    : 'bg-slate-50 border-fuchsia-300 focus:border-primary placeholder:text-slate-400'
                }`}
              />
            </div>

            {/* Nickname Input */}
            <div className="space-y-1.5">
              <label className={`text-xs font-black uppercase tracking-wider font-headline ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Your Nickname
              </label>
              <input
                type="text"
                required
                maxLength={24}
                placeholder="Enter player name..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className={`w-full px-4 py-3.5 rounded-2xl border-2 text-sm font-bold focus:outline-none font-headline transition-colors ${
                  isDark
                    ? 'bg-white/[0.05] border-white/10 text-white focus:border-fuchsia-500 placeholder:text-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-primary focus:bg-white placeholder:text-slate-400'
                }`}
              />
            </div>

            {/* Avatar Picker */}
            <div className="space-y-2 pt-1">
              <label className={`text-xs font-black uppercase tracking-wider font-headline ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Choose Your Fighter
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map((av) => (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`h-12 rounded-2xl border-2 flex items-center justify-center text-xl transition-all cursor-pointer ${av.color} ${
                      selectedAvatar === av.id
                        ? isDark ? 'ring-2 ring-white scale-110 shadow-lg shadow-fuchsia-500/30 opacity-100' : 'ring-2 ring-slate-800 scale-110 shadow-lg shadow-slate-400/50 opacity-100'
                        : 'opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <i className={av.icon} />
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Join */}
            <button
              type="submit"
              disabled={joining || loading || !code}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-primary to-cyan-500 text-white font-black text-base shadow-[0_6px_0_#7e22ce] active:translate-y-1 active:shadow-[0_2px_0_#7e22ce] hover:brightness-110 transition-all cursor-pointer font-headline flex items-center justify-center gap-2 mt-4 disabled:opacity-40"
            >
              {joining ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-xl" />
                  <span>Entering Arena...</span>
                </>
              ) : (
                <>
                  <i className="ri-flashlight-fill text-yellow-300 text-xl" />
                  <span>Enter Lobby</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentJoin;
