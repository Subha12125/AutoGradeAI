import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import QuizService from '../../services/quiz.service';
import useQuizRealtime from '../../hooks/useQuizRealtime';
import useArenaTheme from '../../hooks/useArenaTheme';
import ArenaThemeToggle from '../../components/common/ArenaThemeToggle';
import AntigravityArena from '../../components/antigravity/AntigravityArena';

// Gen-Z Kahoot-style 3D Vibrant Button Themes
const OPTION_STYLES = [
  {
    bg: 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600',
    border: 'border-rose-400/40',
    shadow: 'shadow-[0_6px_0_#9f1239] active:shadow-[0_2px_0_#9f1239]',
    icon: '▲',
    labelBg: 'bg-rose-950/60 text-rose-200 border-rose-400/40',
    glow: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.4)]',
  },
  {
    bg: 'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600',
    border: 'border-sky-400/40',
    shadow: 'shadow-[0_6px_0_#1e3a8a] active:shadow-[0_2px_0_#1e3a8a]',
    icon: '◆',
    labelBg: 'bg-blue-950/60 text-blue-200 border-blue-400/40',
    glow: 'hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]',
  },
  {
    bg: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500',
    border: 'border-amber-300/40',
    shadow: 'shadow-[0_6px_0_#9a3412] active:shadow-[0_2px_0_#9a3412]',
    icon: '●',
    labelBg: 'bg-amber-950/60 text-amber-100 border-amber-300/40',
    glow: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]',
  },
  {
    bg: 'bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600',
    border: 'border-emerald-300/40',
    shadow: 'shadow-[0_6px_0_#065f46] active:shadow-[0_2px_0_#065f46]',
    icon: '■',
    labelBg: 'bg-emerald-950/60 text-emerald-100 border-emerald-300/40',
    glow: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]',
  },
];

export const StudentArena = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // Arena Color Tone controller (persisted Light / Dark)
  const { isDark, toggleTheme } = useArenaTheme('dark');

  // Participant info stored in sessionStorage
  const [participant, setParticipant] = useState(() => {
    try {
      const stored = sessionStorage.getItem(`quiz_participant_${sessionId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [session, setSession] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [gameStatus, setGameStatus] = useState('LOBBY'); // LOBBY, STARTING, QUESTION_ACTIVE, QUESTION_LOCKED, RESULT, FINISHED
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Student answer interaction state
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalTime, setTotalTime] = useState(30);
  const [leaderboard, setLeaderboard] = useState([]);
  const [show3DArena, setShow3DArena] = useState(false);

  // Sound / vibration trigger helper
  const triggerHaptic = () => {
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(40);
    }
  };

  const showToast = (msg, duration = 3000) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), duration);
  };

  // Re-fetch participant and session info on mount
  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const res = await QuizService.getSession(sessionId);
      setSession(res.session);
      setQuiz(res.quiz);
      const currentStatus = res.session.status || 'LOBBY';
      setGameStatus(currentStatus);

      // Only set active question if game is active or locked
      if (currentStatus !== 'LOBBY' && res.quiz?.questions && res.quiz.questions[res.session.current_question_index]) {
        const q = res.quiz.questions[res.session.current_question_index];
        setActiveQuestion(q);
        const limit = q.time_limit || 30;
        setTimeLeft(limit);
        setTotalTime(limit);
      } else if (currentStatus === 'LOBBY') {
        setActiveQuestion(null);
      }

      // Check if participant is registered
      if (!participant) {
        navigate(`/join/${res.session.join_code}`);
        return;
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  // Periodic resilient polling sync (every 2.5s) to guarantee server-authoritative state
  useEffect(() => {
    if (gameStatus === 'FINISHED') return;
    const pollInterval = setInterval(async () => {
      try {
        const res = await QuizService.getSession(sessionId);
        if (res.session?.status && res.session.status !== gameStatus) {
          setGameStatus(res.session.status);
          if (res.session.status === 'QUESTION_ACTIVE' && res.quiz?.questions?.[res.session.current_question_index]) {
            const q = res.quiz.questions[res.session.current_question_index];
            setActiveQuestion(q);
            const limit = q.time_limit || 30;
            setTimeLeft(limit);
            setTotalTime(limit);
            setSelectedAnswer(null);
            setIsSubmitted(false);
            setFeedback(null);
          } else if (res.session.status === 'LOBBY') {
            setActiveQuestion(null);
            setIsSubmitted(false);
            setFeedback(null);
          }
        }
      } catch {
        // silent sync
      }
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [sessionId, gameStatus]);

  // Realtime channel hooks
  useQuizRealtime(
    sessionId,
    {
      onGameStarted: () => {
        setGameStatus('STARTING');
        triggerHaptic();
      },
      onQuestionStarted: ({ question }) => {
        setGameStatus('QUESTION_ACTIVE');
        setActiveQuestion(question);
        setSelectedAnswer(null);
        setIsSubmitted(false);
        setFeedback(null);
        const limit = question.timeLimit || 30;
        setTimeLeft(limit);
        setTotalTime(limit);
        triggerHaptic();
      },
      onQuestionEnded: ({ correctAnswer, explanation }) => {
        setGameStatus('QUESTION_LOCKED');
        setActiveQuestion((prev) => ({
          ...prev,
          correct_answer: correctAnswer,
          explanation,
        }));
        triggerHaptic();
      },
      onLeaderboardUpdated: ({ leaderboard: lb }) => {
        setLeaderboard(lb);
        const me = lb.find((p) => p.id === participant?.id);
        if (me) {
          setParticipant((prev) => ({
            ...prev,
            current_score: me.score,
            streak: me.streak,
            xp: me.xp,
            level: me.level,
          }));
        }
      },
      onGameFinished: () => {
        setGameStatus('FINISHED');
        navigate(`/quiz/${sessionId}/result`);
      },
    },
    participant
  );

  // Authoritative Countdown timer
  useEffect(() => {
    if (gameStatus !== 'QUESTION_ACTIVE') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStatus, activeQuestion?.id]);

  // Answer Submission Handler
  const handleSubmitAnswer = async (answerPayload) => {
    if (isSubmitted || submitting) return;

    if (gameStatus !== 'QUESTION_ACTIVE') {
      showToast('Game is not currently accepting answers. Waiting for host!');
      return;
    }

    if (!activeQuestion) return;

    triggerHaptic();

    try {
      setSubmitting(true);
      const res = await QuizService.submitAnswer(sessionId, {
        participantId: participant.id,
        questionId: activeQuestion.id,
        answer: answerPayload,
      });

      setIsSubmitted(true);
      setFeedback(res);
      setParticipant((prev) => ({
        ...prev,
        current_score: res.currentScore,
        streak: res.newStreak,
      }));

      // Explosive confetti if correct!
      if (res.isCorrect) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.75 },
          colors: ['#10B981', '#38BDF8', '#F59E0B', '#EC4899', '#A855F7'],
        });
      }
    } catch (err) {
      showToast(err.response?.data?.error || err.message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMultiSelect = (option) => {
    const current = Array.isArray(selectedAnswer) ? selectedAnswer : [];
    if (current.includes(option)) {
      setSelectedAnswer(current.filter((o) => o !== option));
    } else {
      setSelectedAnswer([...current, option]);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center space-y-4 ${
          isDark ? 'bg-[#090514] text-white' : 'bg-[#F4F6FB] text-slate-900'
        }`}
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-fuchsia-500/20 border-t-fuchsia-500 animate-spin" />
          <i className="ri-gamepad-fill text-2xl text-fuchsia-500 absolute inset-0 flex items-center justify-center animate-pulse" />
        </div>
        <p className="font-black text-sm uppercase tracking-widest text-slate-400 font-headline animate-pulse">
          Entering Quiz Arena...
        </p>
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 ${
          isDark ? 'bg-[#090514] text-white' : 'bg-[#F4F6FB] text-slate-900'
        }`}
      >
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 text-rose-500 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-rose-500/20">
          <i className="ri-error-warning-line" />
        </div>
        <p className="font-black text-rose-500 text-base">{error || 'Session link expired or invalid'}</p>
        <button
          onClick={() => navigate('/join/' + (session?.join_code || ''))}
          className="px-6 py-3 bg-gradient-to-r from-primary to-fuchsia-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-primary/30 font-headline active:scale-95 transition-all"
        >
          Join Game Lobby
        </button>
      </div>
    );
  }

  const myRank = leaderboard.findIndex((p) => p.id === participant.id) + 1;
  const timeProgressPercent = Math.max(0, Math.min(100, (timeLeft / (totalTime || 30)) * 100));

  return (
    <div
      className={`min-h-screen flex flex-col justify-between relative overflow-hidden font-sans transition-colors duration-300 ${
        isDark
          ? 'bg-[#090a0f] text-slate-100 selection:bg-indigo-500'
          : 'bg-[#f8fafc] text-slate-900 selection:bg-indigo-500'
      }`}
    >

      {/* Floating In-App Toast */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <i className="ri-alarm-warning-fill text-yellow-300 text-base" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Mobile Arena Header Bar */}
      <header
        className={`px-4 py-3 sticky top-0 z-30 flex items-center justify-between backdrop-blur-xl border-b transition-colors duration-300 ${
          isDark ? 'bg-[#0E0824]/90 border-white/10 text-white' : 'bg-white/90 border-slate-200/90 shadow-sm text-slate-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-cyan-500 p-0.5 shadow-md shadow-fuchsia-500/25">
            <div
              className={`w-full h-full rounded-[14px] flex items-center justify-center text-lg ${
                isDark ? 'bg-[#0E0824] text-white' : 'bg-white text-slate-900'
              }`}
            >
              <i className="ri-rocket-2-fill text-fuchsia-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className={`text-sm font-black truncate font-headline ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {participant.nickname}
              </p>
              {myRank > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-500 border border-amber-400/30">
                  #{myRank}
                </span>
              )}
            </div>
            <p className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Score: <span className="text-amber-500 font-bold">{participant.current_score || 0}</span> pts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Flame Streak Indicator */}
          {(participant.streak || 0) >= 2 && (
            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-500 px-2.5 py-1 rounded-full text-xs font-black animate-pulse font-headline">
              <i className="ri-fire-fill text-sm" />
              <span>{participant.streak}X</span>
            </div>
          )}

          {/* Arena Color Tone Toggle (Light / Dark Mode) */}
          <ArenaThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

          {/* 3D Antigravity Arena Toggle */}
          <button
            onClick={() => setShow3DArena(!show3DArena)}
            className={`p-2 sm:px-3 sm:py-2 rounded-2xl border text-xs font-black transition-all cursor-pointer flex items-center gap-1 font-headline ${
              show3DArena
                ? 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-md shadow-fuchsia-600/30'
                : isDark
                ? 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-sm'
            }`}
            title="Toggle 3D Antigravity Arena"
          >
            <i className="ri-shape-2-line text-sm" />
            <span className="hidden sm:inline">3D</span>
          </button>
        </div>
      </header>

      {/* Main Game Screen View */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center relative z-10 space-y-5">
        {/* Optional 3D View */}
        {show3DArena && (
          <AntigravityArena
            topic={quiz?.topic || 'Science'}
            participants={leaderboard.length > 0 ? leaderboard : [participant]}
            currentParticipantId={participant.id}
            activeQuestion={activeQuestion}
          />
        )}

        {/* 1. LOBBY WAITING STATE */}
        {gameStatus === 'LOBBY' && (
          <div
            className={`backdrop-blur-2xl rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden transition-colors duration-300 ${
              isDark ? 'bg-white/[0.04] border border-white/10' : 'bg-white border border-slate-200/90 shadow-slate-200/60'
            }`}
          >
            {/* Holographic Avatar Card */}
            <div className="relative mx-auto w-28 h-28">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-amber-400 animate-spin blur-md opacity-75" />
              <div
                className={`relative w-full h-full rounded-full border-2 flex items-center justify-center text-5xl shadow-2xl ${
                  isDark ? 'bg-[#130A2A] border-white/30' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <i className="ri-gamepad-fill text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-fuchsia-500" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-500 text-[11px] font-black uppercase tracking-wider font-headline">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>You Are Locked In</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-black font-headline tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {quiz?.title || 'Multiplayer AI Arena'}
              </h2>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Topic: <span className="text-cyan-500 font-bold">{quiz?.topic}</span>
              </p>
            </div>

            {/* Equalizer Wave */}
            <div
              className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 border transition-colors ${
                isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 h-6">
                <span className="w-1.5 bg-fuchsia-500 rounded-full animate-bounce [animation-delay:0ms] h-full" />
                <span className="w-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:150ms] h-4" />
                <span className="w-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms] h-full" />
                <span className="w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:450ms] h-3" />
                <span className="w-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:600ms] h-5" />
              </div>
              <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Waiting for the teacher to launch... Get ready to cook! 🔥
              </p>
            </div>
          </div>
        )}

        {/* 2. STARTING COUNTDOWN STATE */}
        {gameStatus === 'STARTING' && (
          <div className="text-center space-y-4 py-16 animate-fadeIn">
            <span className="px-4 py-1.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-500 text-xs font-black uppercase tracking-widest font-headline animate-pulse">
              ⚡ GET READY!
            </span>
            <h1 className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 font-headline animate-bounce">
              3... 2... 1...
            </h1>
            <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Game launching right now!
            </p>
          </div>
        )}

        {/* 3. QUESTION ACTIVE / SUBMISSION STATE */}
        {(gameStatus === 'QUESTION_ACTIVE' || gameStatus === 'QUESTION_LOCKED' || gameStatus === 'RESULT') && activeQuestion && (
          <div className="space-y-4 animate-fadeIn">
            {/* Top Timer Bar with Laser Glow */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black font-headline px-1">
                <span className={`tracking-wider ${isDark ? 'text-fuchsia-300' : 'text-fuchsia-600'}`}>
                  QUESTION {(activeQuestion.order_index ?? 0) + 1}
                </span>
                <span
                  className={`font-mono text-sm font-black flex items-center gap-1 ${
                    timeLeft <= 5 ? 'text-rose-500 animate-ping' : timeLeft <= 10 ? 'text-amber-500' : 'text-cyan-500'
                  }`}
                >
                  <i className="ri-timer-flash-line" />
                  <span>{timeLeft}s</span>
                </span>
              </div>

              {/* Progress Bar Track */}
              <div
                className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${
                  isDark ? 'bg-white/10 border-white/10' : 'bg-slate-200 border-slate-300'
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    timeLeft <= 5
                      ? 'bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_12px_#f43f5e]'
                      : timeLeft <= 10
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_12px_#f59e0b]'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_12px_#06b6d4]'
                  }`}
                  style={{ width: `${timeProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Prompt Card */}
            <div
              className={`backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 relative overflow-hidden transition-colors ${
                isDark ? 'bg-white/[0.04] border border-white/10' : 'bg-white border border-slate-200/90 shadow-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 font-headline">
                  {activeQuestion.type}
                </span>
                <span className={`text-[10px] font-bold uppercase font-headline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Difficulty Level {activeQuestion.difficulty || 2} • 100 Base PTS
                </span>
              </div>

              {activeQuestion.media_url && (
                <div className={`rounded-2xl overflow-hidden max-h-52 border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <img src={activeQuestion.media_url} alt="Question diagram" className="w-full h-full object-cover" />
                </div>
              )}

              <h2 className={`text-lg sm:text-xl font-black leading-snug font-headline ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {activeQuestion.prompt}
              </h2>
            </div>

            {/* High-Dopamine Feedback Banner */}
            {feedback && (
              <div
                className={`p-5 rounded-3xl border-2 text-center space-y-1.5 shadow-2xl animate-bounce ${
                  feedback.isCorrect
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-200 shadow-emerald-500/20'
                    : 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-200 shadow-rose-500/20'
                }`}
              >
                <div className="flex items-center justify-center gap-2 text-xl font-black font-headline">
                  <i className={feedback.isCorrect ? 'ri-checkbox-circle-fill text-2xl' : 'ri-close-circle-fill text-2xl'} />
                  <span>{feedback.isCorrect ? 'BOOM! CORRECT! 🔥' : 'OOF! WRONG ANSWER'}</span>
                </div>
                {feedback.isCorrect ? (
                  <p className="text-xs font-mono font-black">
                    +{feedback.pointsAwarded} PTS (⚡ Speed: +{feedback.speedBonus} • 🔥 Streak: +{feedback.streakBonus})
                  </p>
                ) : (
                  <p className="text-xs font-bold">Keep your head up! Lock in for the next round!</p>
                )}
              </div>
            )}

            {/* Tactical Answer Cards */}
            {!isSubmitted && gameStatus === 'QUESTION_ACTIVE' ? (
              <div className="space-y-3 pt-1">
                {/* MCQ / SCENARIO / IMAGE_BASED Options */}
                {(activeQuestion.type === 'MCQ' ||
                  activeQuestion.type === 'SCENARIO' ||
                  activeQuestion.type === 'IMAGE_BASED') &&
                  Array.isArray(activeQuestion.options) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {activeQuestion.options.map((opt, idx) => {
                        const style = OPTION_STYLES[idx % OPTION_STYLES.length];
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSubmitAnswer(opt)}
                            disabled={submitting}
                            className={`w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl ${style.bg} ${style.border} ${style.shadow} ${style.glow} border-2 text-left font-black text-white text-sm sm:text-base flex items-center gap-3.5 transition-all transform active:translate-y-1 cursor-pointer select-none group font-headline`}
                          >
                            <span
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black shrink-0 ${style.labelBg} border backdrop-blur-md shadow-inner`}
                            >
                              {style.icon}
                            </span>
                            <span className="flex-1 leading-snug drop-shadow-sm">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                {/* TRUE / FALSE Cards */}
                {activeQuestion.type === 'TRUE_FALSE' && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                      onClick={() => handleSubmitAnswer('True')}
                      disabled={submitting}
                      className="py-12 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 border-2 border-emerald-300/40 shadow-[0_6px_0_#065f46] active:translate-y-1 active:shadow-[0_2px_0_#065f46] text-white font-black text-2xl flex flex-col items-center justify-center gap-2 cursor-pointer font-headline transition-all"
                    >
                      <i className="ri-check-line text-4xl text-emerald-100" />
                      <span>TRUE</span>
                    </button>

                    <button
                      onClick={() => handleSubmitAnswer('False')}
                      disabled={submitting}
                      className="py-12 rounded-3xl bg-gradient-to-r from-rose-500 to-red-600 border-2 border-rose-300/40 shadow-[0_6px_0_#9f1239] active:translate-y-1 active:shadow-[0_2px_0_#9f1239] text-white font-black text-2xl flex flex-col items-center justify-center gap-2 cursor-pointer font-headline transition-all"
                    >
                      <i className="ri-close-line text-4xl text-rose-100" />
                      <span>FALSE</span>
                    </button>
                  </div>
                )}

                {/* MULTI_SELECT Cards */}
                {activeQuestion.type === 'MULTI_SELECT' && Array.isArray(activeQuestion.options) && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2.5">
                      {activeQuestion.options.map((opt, idx) => {
                        const isChecked = Array.isArray(selectedAnswer) && selectedAnswer.includes(opt);
                        return (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => toggleMultiSelect(opt)}
                            className={`w-full p-4 rounded-2xl border-2 text-left text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                              isChecked
                                ? 'bg-fuchsia-600/30 border-fuchsia-400 text-fuchsia-600 dark:text-white shadow-lg'
                                : isDark
                                ? 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{opt}</span>
                            <i className={isChecked ? 'ri-checkbox-fill text-fuchsia-500 text-xl' : 'ri-checkbox-blank-line text-slate-400 text-xl'} />
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handleSubmitAnswer(selectedAnswer || [])}
                      disabled={!selectedAnswer || selectedAnswer.length === 0}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-primary text-white font-black text-base shadow-xl shadow-fuchsia-600/30 disabled:opacity-40 cursor-pointer font-headline active:scale-98 transition-all"
                    >
                      Submit Selection ({selectedAnswer?.length || 0})
                    </button>
                  </div>
                )}

                {/* FILL_BLANK Card */}
                {activeQuestion.type === 'FILL_BLANK' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Type your answer here..."
                      value={selectedAnswer || ''}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      className={`w-full px-5 py-4 rounded-2xl border-2 text-base font-bold focus:outline-none focus:border-fuchsia-500 font-headline ${
                        isDark ? 'bg-white/[0.06] border-white/20 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                    <button
                      onClick={() => handleSubmitAnswer(selectedAnswer || '')}
                      disabled={!selectedAnswer || !selectedAnswer.trim()}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-fuchsia-600 text-white font-black text-base shadow-xl shadow-primary/30 disabled:opacity-40 cursor-pointer font-headline active:scale-98 transition-all"
                    >
                      Lock In Answer
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Answer Already Locked / Waiting State */
              <div
                className={`p-8 rounded-3xl border text-center space-y-3 shadow-2xl transition-colors ${
                  isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-slate-200'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-500 flex items-center justify-center text-3xl mx-auto animate-pulse">
                  <i className="ri-lock-2-fill" />
                </div>
                <h3 className={`font-black text-lg font-headline ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Answer Locked In!
                </h3>
                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Waiting for other players to submit...
                </p>

                {activeQuestion.explanation && (
                  <div
                    className={`mt-4 p-4 rounded-2xl border text-left text-xs space-y-1 ${
                      isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <p className="font-black text-cyan-500 uppercase font-headline">Educational Breakdown</p>
                    <p className={`font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {activeQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className={`p-3 text-center text-[10px] font-mono relative z-10 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        AI QUIZ ARENA • MULTIPLAYER BATTLE ROYALE
      </footer>
    </div>
  );
};

export default StudentArena;
