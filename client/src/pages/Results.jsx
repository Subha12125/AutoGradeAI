import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useExam } from '../hooks/useExam';
import { resultsService } from '../services/results.service';
import ScoreCard from '../components/evaluation/ScoreCard';
import Spinner from '../components/ui/Spinner';

const Results = () => {
  const navigate = useNavigate();
  const { exams, loading: examsLoading, fetchExams } = useExam();
  const { addToast } = useToast();
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);

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

  // Fetch results when exam selected
  useEffect(() => {
    if (!selectedExamId) return;
    setResultsLoading(true);
    resultsService.getExamResults(selectedExamId)
      .then(data => {
        setResults(data.results || []);
        setStats(data.stats || null);
      })
      .catch(() => {
        setResults([]);
        setStats(null);
      })
      .finally(() => setResultsLoading(false));
  }, [selectedExamId]);

  const selectedExam = exams.find(e => e.id === selectedExamId);
  const avgScore = results.length > 0 
    ? (results.reduce((sum, r) => sum + (r.marksAwarded || 0), 0) / results.length).toFixed(1)
    : '—';
  const maxMarks = selectedExam?.total_marks || 100;

  const handleExport = async (format) => {
    if (!selectedExamId) return;
    try {
      addToast(`Exporting ${format.toUpperCase()}...`, 'info');
      const data = await resultsService.exportResults(selectedExamId, format);
      
      if (format === 'csv') {
        // data is already a Blob from the API
        const blob = data instanceof Blob ? data : new Blob([data], { type: 'text/csv' });
        
        // Check if the server returned an error JSON instead of CSV
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

  return (
    <div className="relative min-h-full">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[400px] -z-10 opacity-40 pointer-events-none">
        <div className="absolute top-[-100px] left-[10%] w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-primary/20 rounded-full blur-[60px] sm:blur-[100px] animate-pulse" />
        <div className="absolute top-[50px] right-[10%] w-[150px] sm:w-[300px] h-[150px] sm:h-[300px] bg-secondary/20 rounded-full blur-[50px] sm:blur-[80px] animate-pulse delay-700" />
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-12 relative z-10">
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
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white text-on-surface-variant font-bold text-xs hover:text-primary transition-all shadow-sm border border-outline-variant/10 hover:shadow-md hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export
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
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                selectedExamId === exam.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-on-surface-variant hover:bg-primary/5 border border-outline-variant/10'
              }`}
            >
              {exam.title}
            </button>
          ))}
        </div>
      )}

      {/* Main Grid — stacks on mobile, 12-col on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-8 space-y-6 sm:space-y-10">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
            <ScoreCard label="Average Score" value={avgScore} icon="trending_up" color="primary" subValue={`/ ${maxMarks}`} />
            <ScoreCard label="Students" value={String(results.length)} icon="people" color="secondary" subValue="Evaluated" />
            <ScoreCard label="Exam Status" value={selectedExam?.status || '—'} icon={selectedExam?.status === 'completed' ? 'check_circle' : 'pending'} color={selectedExam?.status === 'completed' ? 'success' : 'error'} />
            <ScoreCard label="Max Marks" value={String(maxMarks)} icon="grade" color="success" />
          </div>
 
          {/* Results Table */}
          <div className="bg-white/80 backdrop-blur-2xl rounded-2xl sm:rounded-[2.5rem] shadow-xl shadow-surface-container-highest/20 border border-white overflow-hidden atmospheric-shadow">
            <div className="p-4 sm:p-8 md:p-10 border-b border-outline-variant/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-6">
              <div>
                <h2 className="font-headline font-extrabold text-lg sm:text-2xl text-on-surface tracking-tight mb-1">Student Results</h2>
                <p className="text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  {selectedExam ? selectedExam.title : 'Select an exam'}
                </p>
              </div>
            </div>
            
            <div className="p-1 sm:p-2">
              {examsLoading || resultsLoading ? (
                <div className="py-20 sm:py-32 flex flex-col items-center justify-center gap-4">
                  <Spinner size="lg" />
                  <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest animate-pulse">Loading Results...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="overflow-x-auto -mx-1 sm:mx-0">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-widest text-outline">
                        <th className="px-3 sm:px-8 py-3 sm:py-4">Student</th>
                        <th className="px-3 sm:px-8 py-3 sm:py-4 hidden sm:table-cell">Roll No</th>
                        <th className="px-3 sm:px-8 py-3 sm:py-4">Score</th>
                        <th className="px-3 sm:px-8 py-3 sm:py-4">Status</th>
                        <th className="px-3 sm:px-8 py-3 sm:py-4 hidden md:table-cell">Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {results.map((result, idx) => {
                        const pct = result.maxMarks > 0 ? Math.round((result.marksAwarded / result.maxMarks) * 100) : 0;
                        const isFailed = result.status === 'failed';
                        return (
                          <tr key={result.id || idx} className={`${isFailed ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-surface-container-low/50'} transition-colors`}>
                            <td className="px-3 sm:px-8 py-3 sm:py-5">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full ${isFailed ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'} flex items-center justify-center font-bold text-[10px] sm:text-xs flex-shrink-0`}>
                                  {(result.studentName || 'S')[0]}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-semibold text-xs sm:text-sm text-on-surface block truncate">{result.studentName || 'Student'}</span>
                                  <span className="text-[10px] text-outline sm:hidden">{result.rollNumber || ''}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-8 py-3 sm:py-5 text-sm text-on-surface-variant font-medium hidden sm:table-cell">{result.rollNumber || '—'}</td>
                            <td className="px-3 sm:px-8 py-3 sm:py-5">
                              {isFailed ? (
                                <span className="text-sm sm:text-lg font-black text-red-600">—</span>
                              ) : (
                                <>
                                  <span className="text-sm sm:text-lg font-black text-primary">{result.marksAwarded}</span>
                                  <span className="text-[10px] sm:text-sm text-outline">/{result.maxMarks || maxMarks}</span>
                                </>
                              )}
                            </td>
                            <td className="px-3 sm:px-8 py-3 sm:py-5">
                              {isFailed ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-widest">
                                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full inline-block" />
                                  Failed
                                </span>
                              ) : (
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <div className="w-12 sm:w-20 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] sm:text-xs font-bold text-on-surface">{pct}%</span>
                                </div>
                              )}
                            </td>
                            <td className="px-3 sm:px-8 py-3 sm:py-5 text-xs text-on-surface-variant max-w-[200px] truncate hidden md:table-cell">{result.feedback || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 sm:py-20 text-center">
                  <span className="material-symbols-outlined text-outline text-4xl mb-3 block">assignment</span>
                  <p className="text-sm text-on-surface-variant mb-2">No results available for this exam</p>
                  <p className="text-xs text-outline">
                    {selectedExam?.status === 'pending' ? 'This exam hasn\'t been evaluated yet.' : 
                     selectedExam?.status === 'failed' ? 'Evaluation failed. Try again from Create Exam.' :
                     'Results will appear after evaluation completes.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Rail — shows below on mobile */}
        <div className="lg:col-span-4 lg:order-2">
          <aside className="bg-white/80 backdrop-blur-2xl rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-xl shadow-surface-container-highest/20 border border-white atmospheric-shadow lg:sticky lg:top-28 text-on-surface relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 group-hover:bg-secondary/10 transition-colors duration-1000"></div>
            
            <div className="flex items-center justify-between mb-6 sm:mb-10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
                <h4 className="font-headline font-extrabold text-sm uppercase tracking-widest text-secondary">Summary</h4>
              </div>
            </div>
            
            <div className="space-y-6 sm:space-y-8 relative z-10">
              {/* Exam Info */}
              {selectedExam && (
                <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm">
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2 sm:mb-3">Selected Exam</p>
                  <p className="text-base sm:text-lg font-bold text-on-surface font-headline mb-1">{selectedExam.title}</p>
                  <p className="text-xs sm:text-sm text-on-surface-variant">{selectedExam.subject}</p>
                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-3">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded">{selectedExam.total_marks} marks</span>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded ${
                      selectedExam.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>{selectedExam.status}</span>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="pt-4 border-t border-outline-variant/10">
                <p className="text-[10px] font-bold text-outline uppercase mb-3 sm:mb-4 tracking-widest">Analytics</p>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-on-surface-variant">Total Students</span>
                    <span className="font-bold text-on-surface">{results.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-on-surface-variant">Average Score</span>
                    <span className="font-bold text-primary">{avgScore}</span>
                  </div>
                  {stats?.highest !== undefined && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-on-surface-variant">Highest</span>
                      <span className="font-bold text-emerald-600">{stats.highest}</span>
                    </div>
                  )}
                  {stats?.lowest !== undefined && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-on-surface-variant">Lowest</span>
                      <span className="font-bold text-red-600">{stats.lowest}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Results;
