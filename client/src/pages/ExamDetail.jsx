import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useExam } from '../hooks/useExam';
import { useEvaluation } from '../hooks/useEvaluation';
import { resultsService } from '../services/results.service';
import Spinner from '../components/ui/Spinner';
import StudentDetailModal from '../components/evaluation/StudentDetailModal';
import { cleanStudentName, cleanRoll } from '../utils/format';

// In-memory cache for instant exam detail and results rendering
const examResultsCache = new Map();

const ExamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { currentExam, loading: examLoading, fetchExamById } = useExam();
  const { startEvaluation } = useEvaluation();
  const fileInputRef = useRef(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Student Detail Modal state
  const [selectedResultIndex, setSelectedResultIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    // Check cache for instant rendering (0ms delay)
    const cached = examResultsCache.get(id);
    if (cached) {
      setResults(cached.results || []);
      setStats(cached.stats || null);
      setResultsLoading(false);
    } else {
      setResultsLoading(true);
    }

    // Fetch exam details and results in parallel for maximum speed
    Promise.all([
      fetchExamById(id),
      resultsService.getExamResults(id)
    ])
      .then(([_, resultsData]) => {
        if (!isMounted) return;
        const resList = resultsData?.results || [];
        const statsData = resultsData?.stats || null;
        examResultsCache.set(id, { results: resList, stats: statsData, timestamp: Date.now() });
        setResults(resList);
        setStats(statsData);
      })
      .catch((err) => {
        console.error('Failed to load exam details:', err);
      })
      .finally(() => {
        if (isMounted) setResultsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const exam = currentExam;

  const handleExport = async (format) => {
    try {
      addToast(`Exporting ${format.toUpperCase()}...`, 'info');
      const data = await resultsService.exportResults(id, format);

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
        a.download = `results-${id}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      addToast('Export downloaded!', 'success');
    } catch (err) {
      addToast(err.message || 'Export failed', 'error');
    }
  };

  const handleAddStudentPDF = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    e.target.value = '';

    const filesToUpload = selectedFiles.map(file => ({
      originalFile: file
    }));

    setUploading(true);
    try {
      addToast(`Uploading ${selectedFiles.length} answer sheet(s)...`, 'info');
      await startEvaluation(id, filesToUpload);
      addToast('Evaluation started for new students!', 'success');
      navigate(`/evaluation-progress?examId=${id}`);
    } catch (err) {
      addToast(err.message || 'Failed to start evaluation', 'error');
    } finally {
      setUploading(false);
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

  if (examLoading || !exam) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const statusColors = {
    completed: 'text-emerald-700 bg-emerald-100 border-emerald-200',
    evaluating: 'text-amber-700 bg-amber-100 border-amber-200',
    processing: 'text-amber-700 bg-amber-100 border-amber-200',
    pending: 'text-blue-700 bg-blue-100 border-blue-200',
    failed: 'text-red-700 bg-red-100 border-red-200',
  };

  const avgMarks = results.length > 0
    ? (results.reduce((sum, r) => sum + (r.marksAwarded || 0), 0) / results.length).toFixed(1)
    : '—';

  // Gather overall feedback excerpts
  const firstWithFeedback = results.find(r => r.overallFeedback || r.feedback);

  return (
    <div className="relative min-h-full pb-16">
      {/* Student Detail Modal */}
      <StudentDetailModal
        isOpen={isModalOpen}
        onClose={closeStudentModal}
        result={selectedResultIndex !== null ? results[selectedResultIndex] : null}
        maxExamMarks={exam.total_marks}
        hasPrev={selectedResultIndex > 0}
        hasNext={selectedResultIndex < results.length - 1}
        onPrev={() => setSelectedResultIndex(prev => Math.max(0, prev - 1))}
        onNext={() => setSelectedResultIndex(prev => Math.min(results.length - 1, prev + 1))}
      />

      {/* Header Section */}
      <section className="mb-8 sm:mb-10">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap mb-3 sm:mb-4 items-center text-[10px] sm:text-xs text-outline uppercase tracking-widest font-bold gap-1.5 sm:gap-2">
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/exams')}>Exams</span>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-primary truncate max-w-[200px]">{exam.title}</span>
        </nav>

        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 bg-white rounded-2xl p-6 sm:p-8 border border-outline-variant/15 shadow-sm">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-lg shadow-primary/20 flex-shrink-0">
              <span className="material-symbols-outlined text-2xl sm:text-3xl font-variation-fill">menu_book</span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-on-surface tracking-tight font-headline">
                  {exam.title}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColors[exam.status] || 'text-gray-600 bg-gray-100 border-gray-200'}`}>
                  {exam.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant font-medium">
                <span className="font-bold text-on-surface">{exam.subject}</span>
                <span>•</span>
                <span>Max Marks: <strong className="text-on-surface">{exam.total_marks}</strong></span>
                <span>•</span>
                <span>Created: {new Date(exam.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileSelect}
            />
            <button
              onClick={handleAddStudentPDF}
              disabled={uploading}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 transition-all border text-xs ${uploading
                ? 'bg-secondary/5 text-secondary/50 border-secondary/10 cursor-not-allowed'
                : 'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 hover:-translate-y-0.5'
                }`}
            >
              <span className={`material-symbols-outlined text-sm ${uploading ? 'animate-spin' : ''}`}>
                {uploading ? 'progress_activity' : 'upload_file'}
              </span>
              <span>{uploading ? 'Uploading...' : 'Add Student Sheets'}</span>
            </button>

            <button
              onClick={() => handleExport('csv')}
              disabled={results.length === 0}
              className="flex-1 sm:flex-none bg-surface-container-lowest text-on-surface-variant px-4 py-2.5 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-surface-container hover:text-primary transition-all border border-outline-variant/15 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => navigate('/results')}
              className="flex-1 sm:flex-none bg-primary text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-primary/25 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all text-xs hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-sm">analytics</span>
              <span>Full Analytics</span>
            </button>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 mb-8">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-outline-variant/15 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1">Total Submissions</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black font-headline text-on-surface">{results.length}</span>
            <span className="text-xs text-outline font-medium">students</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-outline-variant/15 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">Class Average</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black font-headline text-primary">{avgMarks}</span>
            <span className="text-xs text-outline font-medium">/ {exam.total_marks}</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-outline-variant/15 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">Highest Score</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black font-headline text-emerald-600">
              {stats?.highest !== undefined ? stats.highest : (results.length > 0 ? Math.max(...results.map(r => r.marksAwarded || 0)) : '—')}
            </span>
            <span className="text-xs text-outline font-medium">/ {exam.total_marks}</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-outline-variant/15 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1">Pass Rate</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black font-headline text-secondary">
              {results.length > 0
                ? `${Math.round((results.filter(r => (r.marksAwarded / (r.maxMarks || exam.total_marks)) >= 0.4).length / results.length) * 100)}%`
                : '—'}
            </span>
            <span className="text-xs text-outline font-medium">(&gt;40%)</span>
          </div>
        </div>
      </div>

      {/* Prominent Overall Batch Feedback & Insights Banner */}
      {results.length > 0 && (
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-surface to-secondary/10 border-2 border-primary/20 shadow-md relative overflow-hidden">
          <div className="flex items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/30">
                <span className="material-symbols-outlined text-xl font-variation-fill">auto_awesome</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black font-headline text-on-surface">
                  AI Evaluation Feedback & Performance Insights
                </h3>
                <p className="text-xs text-on-surface-variant font-medium">
                  Synthesized across {results.length} student submission(s) for {exam.title}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
              Live Evaluation Report
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-outline-variant/20 shadow-sm text-xs sm:text-sm text-slate-800 leading-relaxed space-y-2">
            {firstWithFeedback?.overallFeedback || firstWithFeedback?.feedback ? (
              <p className="whitespace-pre-line font-medium leading-relaxed">
                {firstWithFeedback.overallFeedback || firstWithFeedback.feedback}
              </p>
            ) : (
              <p className="italic text-outline">
                All submissions have been scanned and evaluated with rubric alignment. Click "View Analysis" on any student below for their question-by-question breakdown.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Student Results Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight font-headline text-on-surface">
              Student Results & Feedback
            </h2>
            <p className="text-xs text-on-surface-variant">
              Click any student row to view full unedited feedback, question-by-question marks, and step grading.
            </p>
          </div>
          <span className="text-xs font-bold text-outline">
            Showing {results.length} result(s)
          </span>
        </div>

        {resultsLoading ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-outline-variant/15">
            <Spinner size="lg" />
            <p className="text-xs font-bold uppercase tracking-widest text-outline mt-3">Loading submissions...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-outline-variant/15">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/60 text-[10px] uppercase tracking-widest font-black text-outline border-b border-outline-variant/15">
                    <th className="px-4 sm:px-6 py-4">Student</th>
                    <th className="px-4 sm:px-6 py-4">Score</th>
                    <th className="px-4 sm:px-6 py-4">Percentage</th>
                    <th className="px-4 sm:px-6 py-4 text-center">AI Diagnostic Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-xs sm:text-sm">
                  {results.map((result, idx) => {
                    const studentName = cleanStudentName(result.studentName, result.rollNumber);
                    const studentRoll = cleanRoll(result.rollNumber, studentName);
                    const maxMarks = result.maxMarks || exam.total_marks || 100;
                    const marks = result.marksAwarded ?? 0;
                    const pct = maxMarks > 0 ? Math.round((marks / maxMarks) * 100) : 0;
                    const isFailed = result.status === 'failed';

                    return (
                      <tr
                        key={result.id || idx}
                        className={`hover:bg-primary/[0.02] transition-colors cursor-pointer ${isFailed ? 'bg-red-50/20' : ''}`}
                        onClick={() => openStudentModal(idx)}
                      >
                        {/* Student Name & Roll */}
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${isFailed ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'
                              } flex items-center justify-center font-black text-sm flex-shrink-0 shadow-sm`}>
                              {studentName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-on-surface font-headline truncate text-sm">
                                {studentName}
                              </p>
                              <p className="text-[11px] text-outline font-medium">
                                {studentRoll !== '—' ? studentRoll : `ID #${idx + 1}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {isFailed ? (
                            <span className="font-black text-red-600">—</span>
                          ) : (
                            <div className="flex items-baseline gap-1">
                              <span className="text-base sm:text-lg font-black text-primary font-headline">
                                {marks}
                              </span>
                              <span className="text-xs text-outline font-semibold">
                                / {maxMarks}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Percentage & Progress Bar */}
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {isFailed ? (
                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold uppercase">
                              Failed
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-16 sm:w-24 h-2 bg-surface-container-high rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 45 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs font-black text-on-surface">{pct}%</span>
                            </div>
                          )}
                        </td>

                        {/* Show Feedback Button */}
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
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-outline-variant/15 shadow-sm">
            <span className="material-symbols-outlined text-outline text-5xl mb-3 block">assignment</span>
            <p className="text-base font-bold text-on-surface mb-1">No results available yet</p>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-6">
              {exam.status === 'pending'
                ? 'Upload answer sheets to evaluate students and see question-by-question scoring.'
                : exam.status === 'evaluating'
                  ? 'AI is actively evaluating answer sheets. Results will refresh automatically.'
                  : 'Upload new answer sheets using the button above to begin.'}
            </p>
            <button
              onClick={handleAddStudentPDF}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md shadow-primary/25 inline-flex items-center gap-2 hover:bg-primary/90"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              <span>Upload Answer Sheets</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamDetail;
