import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useExam } from '../hooks/useExam';
import { resultsService } from '../services/results.service';
import ScoreCard from '../components/evaluation/ScoreCard';
import Spinner from '../components/ui/Spinner';
import StudentDetailModal from '../components/evaluation/StudentDetailModal';
import { cleanStudentName, cleanRoll } from '../utils/format';

// In-memory cache for instantaneous exam results rendering (0ms tab switching)
const resultsCache = new Map();

const Results = () => {
  const navigate = useNavigate();
  const { exams, loading: examsLoading, fetchExams } = useExam();
  const { addToast } = useToast();
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);

  // Student Detail Modal state
  const [selectedResultIndex, setSelectedResultIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Auto-select first completed exam
  useEffect(() => {
    if (!selectedExamId && exams.length > 0) {
      const completed = exams.find(e => e.status === 'completed');
      if (completed) setSelectedExamId(completed.id);
      else setSelectedExamId(exams[0].id);
    }
  }, [exams, selectedExamId]);

  // Fetch results when exam selected (instant cache first, then background refresh)
  useEffect(() => {
    if (!selectedExamId) return;

    const cached = resultsCache.get(selectedExamId);
    if (cached) {
      setResults(cached.results || []);
      setStats(cached.stats || null);
      setResultsLoading(false);
    } else {
      setResultsLoading(true);
    }

    let isMounted = true;
    resultsService.getExamResults(selectedExamId)
      .then(data => {
        if (!isMounted) return;
        const resList = data.results || [];
        const statsData = data.stats || null;
        resultsCache.set(selectedExamId, { results: resList, stats: statsData, timestamp: Date.now() });
        setResults(resList);
        setStats(statsData);
      })
      .catch(() => {
        if (!isMounted) return;
        if (!cached) {
          setResults([]);
          setStats(null);
        }
      })
      .finally(() => {
        if (isMounted) setResultsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedExamId]);

  const selectedExam = exams.find(e => e.id === selectedExamId);
  const avgScore = results.length > 0
    ? (results.reduce((sum, r) => sum + (r.marksAwarded || 0), 0) / results.length).toFixed(1)
    : '—';
  const maxMarks = selectedExam?.total_marks || 100;

  const firstWithFeedback = results.find(r => r.overallFeedback || r.feedback);

  const handleExport = async (format) => {
    if (!selectedExamId) return;
    try {
      addToast(`Exporting ${format.toUpperCase()}...`, 'info');
      const data = await resultsService.exportResults(selectedExamId, format);

      if (format === 'csv') {
        const blob = data instanceof Blob ? data : new Blob([data], { type: 'text/csv' });

        if (blob.type && blob.type.includes('application/json')) {
          const text = await blob.text();
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Export failed');
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `results-${selectedExamId}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      addToast('Export downloaded!', 'success');
    } catch (err) {
      addToast(err.message || 'Export failed. No results to export.', 'error');
    }
  };

  const openStudentModal = (index) => {
    setSelectedResultIndex(index);
    setIsModalOpen(true);
  };

  const closeStudentModal = () => {
    setIsModalOpen(false);
    setSelectedResultIndex(null);
  };

  return (
    <div className="relative min-h-full pb-16">
      {/* Student Detail Modal */}
      <StudentDetailModal
        isOpen={isModalOpen}
        onClose={closeStudentModal}
        result={selectedResultIndex !== null ? results[selectedResultIndex] : null}
        maxExamMarks={maxMarks}
        hasPrev={selectedResultIndex > 0}
        hasNext={selectedResultIndex < results.length - 1}
        onPrev={() => setSelectedResultIndex(prev => Math.max(0, prev - 1))}
        onNext={() => setSelectedResultIndex(prev => Math.min(results.length - 1, prev + 1))}
      />

      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[400px] -z-10 opacity-40 pointer-events-none">
        <div className="absolute top-[-100px] left-[10%] w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-primary/20 rounded-full blur-[60px] sm:blur-[100px] animate-pulse" />
        <div className="absolute top-[50px] right-[10%] w-[150px] sm:w-[300px] h-[150px] sm:h-[300px] bg-secondary/20 rounded-full blur-[50px] sm:blur-[80px] animate-pulse delay-700" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/40 shadow-sm mb-3 sm:mb-4">
            <span className={`w-2 h-2 rounded-full ${results.length > 0 ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
              {results.length > 0 ? 'Live Analytics' : 'No Data'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-headline text-on-surface tracking-tighter mb-2 sm:mb-3 leading-tight">
            Examination <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Results</span>
          </h1>
          <p className="text-on-surface-variant font-medium text-xs sm:text-sm md:text-base max-w-xl leading-relaxed">
            {selectedExam
              ? `Results for ${selectedExam.title} — ${selectedExam.subject}`
              : 'Select an exam to view results and AI-driven insights.'}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => handleExport('csv')}
            disabled={results.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white text-on-surface-variant font-bold text-xs hover:text-primary transition-all shadow-sm border border-outline-variant/10 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export CSV
          </button>
          <button
            onClick={() => navigate('/create-exam')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-xs hover:shadow-xl hover:shadow-primary/30 transition-all border-none hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
            <span className="hidden sm:inline">New Evaluation</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Exam Selector */}
      {exams.length > 1 && (
        <div className="mb-6 sm:mb-8 flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
          {exams.map(exam => (
            <button
              key={exam.id}
              onClick={() => setSelectedExamId(exam.id)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${selectedExamId === exam.id
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-on-surface-variant hover:bg-primary/5 border border-outline-variant/10'
                }`}
            >
              {exam.title}
            </button>
          ))}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5 mb-8">
        <ScoreCard label="Average Score" value={avgScore} icon="trending_up" color="primary" subValue={`/ ${maxMarks}`} />
        <ScoreCard label="Students" value={String(results.length)} icon="people" color="secondary" subValue="Evaluated" />
        <ScoreCard label="Exam Status" value={selectedExam?.status || '—'} icon={selectedExam?.status === 'completed' ? 'check_circle' : 'pending'} color={selectedExam?.status === 'completed' ? 'success' : 'error'} />
        <ScoreCard label="Max Marks" value={String(maxMarks)} icon="grade" color="success" />
      </div>

      {/* Prominent Overall Batch AI Feedback Banner */}
      {results.length > 0 && (
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-surface to-secondary/10 border-2 border-primary/20 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/30 flex-shrink-0">
                <span className="material-symbols-outlined text-xl font-variation-fill">auto_awesome</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black font-headline text-on-surface">
                  Overall AI Evaluation Feedback & Performance
                </h3>
                <p className="text-xs text-on-surface-variant font-medium">
                  Synthesized across {results.length} student submission(s) {selectedExam ? `for ${selectedExam.title}` : ''}
                </p>
              </div>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
              Cohort Insights
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-outline-variant/20 shadow-sm text-xs sm:text-sm text-slate-800 leading-relaxed">
            {firstWithFeedback?.overallFeedback || firstWithFeedback?.feedback ? (
              <p className="whitespace-pre-line font-medium leading-relaxed">
                {firstWithFeedback.overallFeedback || firstWithFeedback.feedback}
              </p>
            ) : (
              <p className="italic text-outline">
                All submissions have been evaluated with step-level rubrics. Click "View Analysis" on any student below to inspect individual diagnostic reasoning.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Results Table Card - Full Width */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-2xl sm:rounded-[2.5rem] shadow-xl shadow-surface-container-highest/20 border border-white overflow-hidden atmospheric-shadow">
        <div className="p-4 sm:p-8 md:p-10 border-b border-outline-variant/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-6">
          <div>
            <h2 className="font-headline font-extrabold text-lg sm:text-2xl text-on-surface tracking-tight mb-1">
              Student Results
            </h2>
            <p className="text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              {selectedExam ? selectedExam.title : 'Select an exam'} — Click row or button to view diagnostic evaluation
            </p>
          </div>
          <span className="text-xs font-bold text-outline">
            {results.length} student(s)
          </span>
        </div>

        <div className="p-1 sm:p-2">
          {examsLoading || resultsLoading ? (
            <div className="py-20 sm:py-32 flex flex-col items-center justify-center gap-4">
              <Spinner size="lg" />
              <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest animate-pulse">Loading Results...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-outline border-b border-outline-variant/10">
                    <th className="px-4 sm:px-6 py-3 sm:py-4">Student</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4">Score</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4">Percentage</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-center">AI Diagnostic Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-xs sm:text-sm">
                  {results.map((result, idx) => {
                    const studentName = cleanStudentName(result.studentName, result.rollNumber);
                    const studentRoll = cleanRoll(result.rollNumber, studentName);
                    const rMaxMarks = result.maxMarks || maxMarks || 100;
                    const marks = result.marksAwarded ?? 0;
                    const pct = rMaxMarks > 0 ? Math.round((marks / rMaxMarks) * 100) : 0;
                    const isFailed = result.status === 'failed';

                    return (
                      <tr
                        key={result.id || idx}
                        onClick={() => openStudentModal(idx)}
                        className={`hover:bg-primary/[0.02] transition-colors cursor-pointer ${isFailed ? 'bg-red-50/30' : ''}`}
                      >
                        {/* Student */}
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${
                              isFailed ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'
                            } flex items-center justify-center font-black text-xs sm:text-sm flex-shrink-0 shadow-sm`}>
                              {studentName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs sm:text-sm text-on-surface block truncate font-headline">
                                {studentName}
                              </span>
                              <span className="text-[11px] text-outline font-medium">
                                {studentRoll !== '—' ? studentRoll : `ID #${idx + 1}`}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {isFailed ? (
                            <span className="text-sm sm:text-lg font-black text-red-600">—</span>
                          ) : (
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm sm:text-lg font-black text-primary font-headline">
                                {marks}
                              </span>
                              <span className="text-[10px] sm:text-xs text-outline font-semibold">
                                /{rMaxMarks}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Percentage */}
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {isFailed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-widest">
                              Failed
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-14 sm:w-20 h-2 bg-surface-container-high rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs font-black text-on-surface">{pct}%</span>
                            </div>
                          )}
                        </td>

                        {/* Feedback Button - Opens Detailed Modal Popup */}
                        <td className="px-4 sm:px-6 py-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openStudentModal(idx);
                            }}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                          >
                            <span className="material-symbols-outlined text-sm font-variation-fill">auto_awesome</span>
                            <span>Show Feedback</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 sm:py-20 text-center">
              <span className="material-symbols-outlined text-outline text-4xl mb-3 block">assignment</span>
              <p className="text-sm font-bold text-on-surface mb-1">No results available for this exam</p>
              <p className="text-xs text-outline max-w-sm mx-auto">
                {selectedExam?.status === 'pending' ? 'This exam hasn\'t been evaluated yet.' :
                  selectedExam?.status === 'failed' ? 'Evaluation failed. Try again from Create Exam.' :
                    'Results will appear after evaluation completes.'}
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Results;

