import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import QuizService from '../../services/quiz.service';
import useQuizRealtime from '../../hooks/useQuizRealtime';
import useArenaTheme from '../../hooks/useArenaTheme';
import ArenaThemeToggle from '../../components/common/ArenaThemeToggle';
import AntigravityArena from '../../components/antigravity/AntigravityArena';

// Vibrant Gen-Z Projector Option Styles
const HOST_OPTION_STYLES = [
  {
    bg: 'bg-gradient-to-r from-rose-500 to-red-600',
    border: 'border-rose-400/40',
    shadow: 'shadow-[0_6px_0_#9f1239]',
    icon: '▲',
    labelBg: 'bg-rose-950/60 text-rose-200 border-rose-400/40',
    accentText: 'text-rose-300',
  },
  {
    bg: 'bg-gradient-to-r from-sky-500 to-blue-600',
    border: 'border-sky-400/40',
    shadow: 'shadow-[0_6px_0_#1e3a8a]',
    icon: '◆',
    labelBg: 'bg-blue-950/60 text-blue-200 border-blue-400/40',
    accentText: 'text-sky-300',
  },
  {
    bg: 'bg-gradient-to-r from-amber-400 to-orange-500',
    border: 'border-amber-300/40',
    shadow: 'shadow-[0_6px_0_#9a3412]',
    icon: '●',
    labelBg: 'bg-amber-950/60 text-amber-100 border-amber-300/40',
    accentText: 'text-amber-300',
  },
  {
    bg: 'bg-gradient-to-r from-emerald-400 to-teal-600',
    border: 'border-emerald-300/40',
    shadow: 'shadow-[0_6px_0_#065f46]',
    icon: '■',
    labelBg: 'bg-emerald-950/60 text-emerald-100 border-emerald-300/40',
    accentText: 'text-emerald-300',
  },
];

export const HostArena = () => {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();

  // Arena Color Tone controller (persisted Light / Dark)
  const { isDark, toggleTheme } = useArenaTheme('dark');

  const [sessionData, setSessionData] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active question state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameStatus, setGameStatus] = useState('LOBBY'); // LOBBY, STARTING, QUESTION_ACTIVE, QUESTION_LOCKED, RESULT, FINISHED
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [responseCount, setResponseCount] = useState(0);
  const [questionStats, setQuestionStats] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);

  // 3D Antigravity arena view toggle & QR Code
  const [show3DArena, setShow3DArena] = useState(true);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Load session info on mount
  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const res = await QuizService.getSession(sessionId);
      setSessionData({
        ...res.session,
        qrCode: res.qrCode || res.session?.qrCode,
        joinUrl: res.joinUrl || res.session?.joinUrl,
      });
      setQuiz(res.quiz);
      setParticipants(res.participants || []);
      setGameStatus(res.session.status || 'LOBBY');
      setCurrentQuestionIndex(res.session.current_question_index || 0);

      if (res.quiz?.questions && res.quiz.questions[res.session.current_question_index]) {
        setActiveQuestion(res.quiz.questions[res.session.current_question_index]);
      }

      // Fetch initial leaderboard
      const lbRes = await QuizService.getLeaderboard(sessionId);
      setLeaderboard(lbRes.leaderboard || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  // Periodic heartbeat sync (every 3s) for robust multi-client state consistency
  useEffect(() => {
    if (gameStatus === 'FINISHED') return;
    const interval = setInterval(async () => {
      try {
        const res = await QuizService.getSession(sessionId);
        if (res.session?.status && res.session.status !== gameStatus) {
          setGameStatus(res.session.status);
          setCurrentQuestionIndex(res.session.current_question_index || 0);
          if (res.quiz?.questions?.[res.session.current_question_index]) {
            setActiveQuestion(res.quiz.questions[res.session.current_question_index]);
          }
        }
        if (res.participants) {
          setParticipants(res.participants);
        }
      } catch {
        // silent sync
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId, gameStatus]);

  // Connect Supabase Realtime channel for live broadcast & presence
  const { isConnected } = useQuizRealtime(sessionId, {
    onPlayerJoined: ({ participant }) => {
      setParticipants((prev) => {
        if (prev.some((p) => p.id === participant.id)) return prev;
        return [...prev, participant];
      });
    },
    onPlayerLeft: ({ participantId }) => {
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    },
    onGameStarted: () => {
      setGameStatus('STARTING');
    },
    onQuestionStarted: ({ question }) => {
      setGameStatus('QUESTION_ACTIVE');
      setActiveQuestion(question);
      setCurrentQuestionIndex(question.index || 0);
      setResponseCount(0);
      setQuestionStats(null);
      setTimeLeft(question.timeLimit || 30);
    },
    onAnswerSubmitted: ({ responseCount: rc }) => {
      setResponseCount(rc);
    },
    onQuestionEnded: ({ stats, correctAnswer, explanation }) => {
      setGameStatus('QUESTION_LOCKED');
      setQuestionStats(stats);
      setActiveQuestion((prev) => ({
        ...prev,
        correct_answer: correctAnswer,
        explanation,
      }));
    },
    onLeaderboardUpdated: ({ leaderboard: lb }) => {
      setLeaderboard(lb);
      setParticipants(lb);
    },
    onGameFinished: () => {
      setGameStatus('FINISHED');
      navigate(`/teacher/quizzes/${sessionData?.quiz_id || sessionId}/results?session=${sessionId}`);
    },
  });

  // Countdown timer during QUESTION_ACTIVE
  useEffect(() => {
    if (gameStatus !== 'QUESTION_ACTIVE') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStatus, activeQuestion?.id]);

  // Host Controls with friendly error reporting
  const handleStartGame = async () => {
    try {
      await QuizService.startSession(sessionId);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert(`Cannot start game: ${msg}`);
    }
  };

  const handlePauseGame = async () => {
    try {
      await QuizService.pauseSession(sessionId);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert(`Pause error: ${msg}`);
    }
  };

  const handleNextQuestion = async () => {
    try {
      await QuizService.nextQuestion(sessionId);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert(`Next question error: ${msg}`);
    }
  };

  const handleEndGame = async () => {
    if (!window.confirm('Are you sure you want to end this game session?')) return;
    try {
      await QuizService.endSession(sessionId);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert(`End game error: ${msg}`);
    }
  };

  const copyJoinCode = () => {
    if (sessionData?.join_code) {
      navigator.clipboard.writeText(sessionData.join_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyDirectLink = () => {
    if (sessionData?.join_code) {
      const url = `${window.location.origin}/join/${sessionData.join_code}`;
      navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // Generate high-resolution QR code whenever session data or join code is available
  useEffect(() => {
    if (!sessionData?.join_code) return;
    const directUrl = `${window.location.origin}/join/${sessionData.join_code}`;

    QRCode.toDataURL(directUrl, {
      width: 480,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((dataUri) => {
        setQrCodeUrl(dataUri);
      })
      .catch((err) => {
        console.warn('QRCode generation fallback error:', err);
        if (sessionData.qrCode) {
          setQrCodeUrl(sessionData.qrCode);
        }
      });
  }, [sessionData?.join_code]);

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center space-y-4 ${
        isDark ? 'bg-[#090514] text-white' : 'bg-[#F4F6FB] text-slate-800'
      }`}>
        <div className="w-16 h-16 rounded-full border-4 border-fuchsia-500/20 border-t-fuchsia-500 animate-spin" />
        <p className={`font-black text-sm uppercase tracking-widest font-headline animate-pulse ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Initializing Multiplayer Arena...
        </p>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4 ${
        isDark ? 'bg-[#090514] text-white' : 'bg-[#F4F6FB] text-slate-800'
      }`}>
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-3xl mx-auto">
          <i className="ri-error-warning-line" />
        </div>
        <p className="font-black text-rose-400 text-lg">{error || 'Session not found'}</p>
        <button
          onClick={() => navigate('/teacher/quizzes')}
          className="px-6 py-3 bg-gradient-to-r from-primary to-fuchsia-600 text-white rounded-2xl text-sm font-black font-headline active:scale-95 transition-all shadow-xl"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  const joinUrl = `${window.location.origin}/join/${sessionData.join_code}`;
  const totalQuestions = quiz?.totalQuestions || quiz?.questions?.length || 1;

  return (
    <div className={`min-h-screen p-4 sm:p-6 space-y-6 relative font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#090a0f] text-slate-100 selection:bg-indigo-500' : 'bg-[#f8fafc] text-slate-900 selection:bg-indigo-200'
    }`}>
      {/* Top Arena Broadcast Control Bar */}
      <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 transition-colors duration-200 ${
        isDark ? 'bg-[#12131c] border-white/10' : 'bg-white border-slate-200 shadow-slate-100'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl flex-shrink-0">
            <i className="ri-broadcast-fill animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className={`font-bold text-lg tracking-tight font-headline ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {quiz?.title || 'Live Quiz Arena'}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-headline ${
                  gameStatus === 'LOBBY'
                    ? isDark ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    : gameStatus === 'QUESTION_ACTIVE'
                    ? isDark ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 animate-pulse' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse'
                    : gameStatus === 'FINISHED'
                    ? isDark ? 'bg-purple-400/10 text-purple-400 border border-purple-400/20' : 'bg-purple-50 text-purple-700 border border-purple-200'
                    : isDark ? 'bg-indigo-400/10 text-indigo-400 border border-indigo-400/20' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}
              >
                {gameStatus}
              </span>
            </div>
            <p className={`text-xs flex items-center gap-2 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className={`font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{quiz?.topic}</span>
              <span>•</span>
              <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                {isConnected ? 'Realtime Live' : 'Connecting Realtime...'}
              </span>
            </p>
          </div>
        </div>

        {/* Game Host Control Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Arena Color Tone Toggle (Light / Dark Mode) */}
          <ArenaThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

          {/* 3D Arena Toggle */}
          <button
            onClick={() => setShow3DArena(!show3DArena)}
            className={`h-10 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border select-none ${
              show3DArena
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-sm'
                : isDark
                ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <i className="ri-box-3-line text-sm" />
            <span>3D Arena</span>
          </button>

          {gameStatus === 'LOBBY' ? (
            <button
              onClick={handleStartGame}
              className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 shadow-md shadow-emerald-950/30 cursor-pointer"
            >
              <i className="ri-play-fill text-sm" />
              <span>Start Game</span>
            </button>
          ) : (
            <>
              <button
                onClick={handlePauseGame}
                className={`h-10 px-3.5 rounded-xl font-semibold text-xs cursor-pointer border transition-all ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <i className="ri-pause-line mr-1" />
                Pause
              </button>

              <button
                onClick={handleNextQuestion}
                className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Next Question</span>
                <i className="ri-arrow-right-line" />
              </button>

              <button
                onClick={handleEndGame}
                className="h-10 px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs cursor-pointer transition-all"
              >
                End Game
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Gameplay Screen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Live Arena & Question Display (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Optional 3D Antigravity Arena View */}
          {show3DArena && (
            <AntigravityArena
              topic={quiz?.topic || 'Science'}
              participants={participants}
              activeQuestion={activeQuestion}
              isPaused={gameStatus === 'PAUSED'}
            />
          )}

          {/* LOBBY VIEW: Show large QR Code & Join Code */}
          {gameStatus === 'LOBBY' && (
            <div className={`p-8 sm:p-10 rounded-2xl border shadow-lg text-center space-y-7 transition-colors duration-200 ${
              isDark ? 'bg-[#12131c] border-white/10' : 'bg-white border-slate-200 shadow-slate-100'
            }`}>
              <div className="max-w-md mx-auto space-y-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-headline ${
                  isDark ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                }`}>
                  <i className="ri-gamepad-line" />
                  <span>Classroom Multiplayer Lobby</span>
                </span>
                <h2 className={`text-3xl sm:text-4xl font-black font-headline tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Scan QR to Join
                </h2>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Scan with your phone camera or visit{' '}
                  <a
                    href={joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-mono font-semibold hover:underline inline-flex items-center gap-1 ${
                      isDark ? 'text-indigo-400' : 'text-indigo-600'
                    }`}
                  >
                    <span>/join/{sessionData.join_code}</span>
                    <i className="ri-external-link-line text-xs" />
                  </a>
                </p>
              </div>

              {/* QR Code and Join Code Box */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
                {/* Crisp QR Code Card */}
                <div className="flex flex-col items-center">
                  {qrCodeUrl || sessionData?.qrCode ? (
                    <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-200 inline-block group hover:scale-[1.02] transition-transform duration-200">
                      <img
                        src={qrCodeUrl || sessionData?.qrCode}
                        alt={`QR Code to join game ${sessionData.join_code}`}
                        className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-xl"
                      />
                      <div className="mt-2 text-center text-[11px] font-bold text-slate-700 tracking-wider uppercase flex items-center justify-center gap-1.5 font-headline">
                        <i className="ri-qr-code-line text-indigo-600 text-sm" />
                        <span>Point Camera to Join</span>
                      </div>
                    </div>
                  ) : (
                    <div className={`w-52 h-52 sm:w-60 sm:h-60 rounded-2xl flex flex-col items-center justify-center gap-3 border animate-pulse ${
                      isDark ? 'bg-white/5 text-slate-400 border-white/10' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Generating QR Code...</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 text-left max-w-sm w-full">
                  {/* Game Join Code */}
                  <div className="space-y-1.5">
                    <span className={`text-[11px] font-bold uppercase tracking-wider font-headline ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Game Join Code
                    </span>
                    <div className="flex items-center gap-2">
                      <div className={`px-6 py-2.5 rounded-xl border-2 font-mono text-3xl sm:text-4xl font-black tracking-widest ${
                        isDark ? 'bg-[#0a0b12] border-indigo-500/40 text-indigo-300' : 'bg-slate-50 border-indigo-300 text-indigo-600'
                      }`}>
                        {sessionData.join_code}
                      </div>
                      <button
                        onClick={copyJoinCode}
                        className={`h-12 w-12 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                          copied
                            ? 'bg-emerald-600 text-white shadow-md'
                            : isDark
                            ? 'bg-white/10 hover:bg-indigo-600 text-white border border-white/10'
                            : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-800 border border-slate-300'
                        }`}
                        title={copied ? 'Code Copied!' : 'Copy Join Code'}
                      >
                        <i className={copied ? 'ri-check-line text-xl font-bold' : 'ri-file-copy-line text-xl'} />
                      </button>
                    </div>
                  </div>

                  {/* Direct Link Section */}
                  <div className={`p-4 rounded-xl border space-y-2.5 ${
                    isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 font-headline ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <i className={`ri-links-line ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        Direct Link
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        isDark ? 'text-emerald-400 bg-emerald-500/10 border-emerald-400/20' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      }`}>
                        Live Ready
                      </span>
                    </div>

                    <a
                      href={joinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs font-mono font-medium hover:underline break-all block p-2 rounded-lg border transition-colors ${
                        isDark ? 'text-indigo-300 bg-white/5 border-white/10' : 'text-indigo-600 bg-white border-slate-200 shadow-sm'
                      }`}
                      title="Click to open student join page"
                    >
                      <span className="flex items-center justify-between gap-1">
                        <span>{joinUrl}</span>
                        <i className="ri-external-link-line flex-shrink-0 text-xs opacity-70" />
                      </span>
                    </a>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={copyDirectLink}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm font-headline ${
                          linkCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        <i className={linkCopied ? 'ri-check-line' : 'ri-file-copy-line'} />
                        <span>{linkCopied ? 'Link Copied!' : 'Copy Link'}</span>
                      </button>

                      <a
                        href={joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer border font-headline ${
                          isDark
                            ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                        title="Open student test screen in new tab"
                      >
                        <span>Open Tab</span>
                        <i className="ri-external-link-line text-xs" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Participants Counter */}
              <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-3 font-headline ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Players in Lobby ({participants.length})
                </p>
                {participants.length === 0 ? (
                  <p className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Waiting for students to scan and join...
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {participants.map((p) => (
                      <div
                        key={p.id}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 shadow-sm animate-fadeIn font-headline ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-slate-200'
                            : 'bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <i className="ri-user-smile-fill text-indigo-400" />
                        <span>{p.nickname}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACTIVE QUESTION VIEW FOR CLASSROOM PROJECTOR */}
          {(gameStatus === 'QUESTION_ACTIVE' || gameStatus === 'QUESTION_LOCKED' || gameStatus === 'RESULT') && activeQuestion && (
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 transition-colors duration-300 ${
              isDark ? 'bg-white/[0.04] backdrop-blur-2xl border-white/10' : 'bg-white border-slate-200/90 shadow-slate-200/50'
            }`}>
              {/* Question Header & Timer Ring */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-cyan-500 text-white font-black text-lg flex items-center justify-center font-headline shadow-lg shadow-fuchsia-500/20">
                    {(activeQuestion.order_index ?? currentQuestionIndex) + 1}
                  </span>
                  <div>
                    <span className={`text-xs font-black uppercase font-headline tracking-wider ${
                      isDark ? 'text-cyan-300' : 'text-primary'
                    }`}>
                      {activeQuestion.type} • LEVEL {activeQuestion.difficulty || 2}
                    </span>
                    <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Question {(activeQuestion.order_index ?? currentQuestionIndex) + 1} of {totalQuestions}
                    </p>
                  </div>
                </div>

                {/* Live Timer Ring */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center font-black font-mono text-2xl border-4 transition-all shadow-xl ${
                      timeLeft <= 5
                        ? 'border-rose-500 text-rose-500 animate-ping shadow-rose-500/30'
                        : timeLeft <= 10
                        ? 'border-amber-400 text-amber-500 shadow-amber-400/20'
                        : isDark
                        ? 'border-cyan-400 text-cyan-300 shadow-cyan-400/20'
                        : 'border-cyan-500 text-cyan-600 shadow-cyan-500/20'
                    }`}
                  >
                    {timeLeft}
                  </div>
                </div>
              </div>

              {/* Question Prompt */}
              <div className={`p-6 rounded-3xl border ${
                isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200/80 shadow-inner'
              }`}>
                <h2 className={`text-xl sm:text-2xl font-black leading-snug font-headline ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {activeQuestion.prompt}
                </h2>
              </div>

              {/* Real-time Response Progress Meter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black font-headline">
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Live Submissions</span>
                  <span className={`font-mono text-sm ${isDark ? 'text-fuchsia-300' : 'text-fuchsia-600'}`}>
                    {responseCount} / {participants.length} Answered (
                    {participants.length > 0 ? Math.round((responseCount / participants.length) * 100) : 0}%)
                  </span>
                </div>
                <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${
                  isDark ? 'bg-white/10 border-white/10' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 rounded-full transition-all duration-500 shadow-[0_0_12px_#ec4899]"
                    style={{
                      width: `${participants.length > 0 ? (responseCount / participants.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Options Grid (Kahoot / Gen-Z 4-Color Display) */}
              {Array.isArray(activeQuestion.options) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {activeQuestion.options.map((opt, idx) => {
                    const style = HOST_OPTION_STYLES[idx % HOST_OPTION_STYLES.length];
                    const isCorrect =
                      (gameStatus === 'QUESTION_LOCKED' || gameStatus === 'RESULT') &&
                      String(activeQuestion.correct_answer).toLowerCase() === String(opt).toLowerCase();

                    return (
                      <div
                        key={idx}
                        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all flex items-center justify-between ${
                          isCorrect
                            ? 'bg-emerald-500/25 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-[1.02]'
                            : `${style.bg} ${style.border} ${style.shadow}`
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black shrink-0 ${style.labelBg} border backdrop-blur-md shadow-inner`}
                          >
                            {style.icon}
                          </span>
                          <span className="text-white font-black text-sm sm:text-base font-headline drop-shadow-sm">
                            {opt}
                          </span>
                        </div>
                        {isCorrect && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-400 text-slate-950 font-black text-xs font-headline flex items-center gap-1 shadow-md">
                            <i className="ri-check-line font-bold" /> CORRECT
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Educational Breakdown on Locked/Result */}
              {(gameStatus === 'QUESTION_LOCKED' || gameStatus === 'RESULT') && activeQuestion.explanation && (
                <div className={`p-5 rounded-2xl border text-xs space-y-1.5 animate-fadeIn ${
                  isDark ? 'bg-cyan-500/10 border-cyan-400/30' : 'bg-cyan-50/70 border-cyan-200'
                }`}>
                  <p className={`font-black uppercase font-headline flex items-center gap-1.5 ${
                    isDark ? 'text-cyan-300' : 'text-cyan-800'
                  }`}>
                    <i className="ri-lightbulb-flash-fill text-amber-400 text-sm" />
                    <span>Educational Explanation</span>
                  </p>
                  <p className={`font-medium leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    {activeQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Live Leaderboard (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`p-6 rounded-3xl border shadow-xl space-y-4 transition-colors duration-300 ${
            isDark ? 'bg-white/[0.04] backdrop-blur-2xl border-white/10 shadow-2xl' : 'bg-white border-slate-200/90 shadow-slate-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="ri-trophy-fill text-amber-500 text-lg" />
                <h3 className={`font-black font-headline text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Live Leaderboard
                </h3>
              </div>
              <span className={`text-xs font-mono font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {participants.length} Active
              </span>
            </div>

            {leaderboard.length === 0 ? (
              <p className={`text-xs italic py-6 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Scores will populate once answers roll in!
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {leaderboard.slice(0, 10).map((player, idx) => {
                  const rankIcons = ['👑', '🥈', '🥉'];
                  return (
                    <div
                      key={player.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        idx === 0
                          ? isDark
                            ? 'bg-amber-400/15 border-amber-400/40 shadow-lg shadow-amber-400/10'
                            : 'bg-amber-50 border-amber-300 shadow-md shadow-amber-200/40'
                          : idx === 1
                          ? isDark
                            ? 'bg-slate-400/15 border-slate-300/40'
                            : 'bg-slate-100 border-slate-300'
                          : idx === 2
                          ? isDark
                            ? 'bg-amber-600/15 border-amber-600/40'
                            : 'bg-orange-50 border-orange-200'
                          : isDark
                          ? 'bg-white/[0.02] border-white/10'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black font-headline ${
                          isDark ? 'bg-white/10' : 'bg-white shadow-sm'
                        }`}>
                          {rankIcons[idx] || idx + 1}
                        </span>
                        <div>
                          <p className={`text-xs font-black font-headline truncate max-w-[120px] ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            {player.nickname}
                          </p>
                          {(player.streak || 0) >= 2 && (
                            <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                              <i className="ri-fire-fill" /> {player.streak}x
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`font-mono text-sm font-black ${
                        isDark ? 'text-amber-300' : 'text-amber-600'
                      }`}>
                        {player.score || 0} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostArena;
