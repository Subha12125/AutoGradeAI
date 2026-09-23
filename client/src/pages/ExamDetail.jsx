import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useExam } from '../hooks/useExam';
import { useEvaluation } from '../hooks/useEvaluation';
import { resultsService } from '../services/results.service';
import Spinner from '../components/ui/Spinner';

const ExamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { currentExam, loading: examLoading, fetchExamById } = useExam();
  const { evaluations, fetchResults, startEvaluation } = useEvaluation();
  const fileInputRef = useRef(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchExamById(id);
      fetchResults(id);
      
      // Fetch results
      resultsService.getExamResults(id)
        .then(data => {
          setResults(data.results || []);
          setStats(data.stats || null);
        })
        .catch(() => {})
        .finally(() => setResultsLoading(false));
    }
  }, [id, fetchExamById, fetchResults]);

  const exam = currentExam;

  const handleExport = async (format) => {
    try {
      addToast(`Exporting ${format.toUpperCase()}...`, 'info');
      const data = await resultsService.exportResults(id, format);
      
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
  const [uploading, setUploading] = useState(false);

  const handleAddStudentPDF = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    // Reset input so same file can be re-selected
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

  if (examLoading || !exam) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const statusColors = {
    completed: 'text-emerald-700 bg-emerald-100',
    evaluating: 'text-amber-700 bg-amber-100',
    processing: 'text-amber-700 bg-amber-100',
    pending: 'text-blue-700 bg-blue-100',
    failed: 'text-red-700 bg-red-100',
  };

  return (
    <div className="relative min-h-full">
      {/* Header Section */}
      <section className="mb-8 sm:mb-10 md:mb-12">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap mb-3 sm:mb-4 items-center text-[10px] sm:text-xs text-outline uppercase tracking-widest font-bold gap-1.5 sm:gap-2">
          <span className="cursor-pointer hover:text-primary" onClick={() => navigate('/exams')}>Exams</span>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-primary truncate max-w-[150px] sm:max-w-[200px]">{exam.title}</span>
        </nav>

        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container shadow-lg shadow-primary/20 flex-shrink-0">
              <span className="material-symbols-outlined text-xl sm:scale-150" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-on-surface tracking-tight leading-tight mb-1 font-headline truncate">{exam.title}</h1>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-sm text-on-surface-variant font-medium">
                  {exam.subject} • {exam.total_marks} marks
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${statusColors[exam.status] || 'text-gray-600 bg-gray-100'}`}>
                  {exam.status}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
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
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all border text-xs ${
                uploading ? 'bg-secondary/5 text-secondary/50 border-secondary/10 cursor-not-allowed' : 'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20'
              }`}
            >
              <span className={`material-symbols-outlined text-sm ${uploading ? 'animate-spin' : ''}`}>{uploading ? 'progress_activity' : 'upload_file'}</span>
              <span className="hidden sm:inline">{uploading ? 'Uploading...' : 'Add Students'}</span>
              <span className="sm:hidden">{uploading ? '...' : 'Add'}</span>
            </button>
            <button onClick={() => handleExport('csv')} className="flex-1 sm:flex-none bg-surface-container-lowest text-on-surface-variant px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-surface-container-high transition-all border border-outline-variant/10 text-xs">
              <span className="material-symbols-outlined text-sm">download</span>
              CSV
            </button>
            {/* <button 
              onClick={() => {
                if (exam.status !== 'completed') {
                  navigate('/create-exam');
                } else {
                  handleExport('pdf');
                }
              }}
              className="flex-1 sm:flex-none bg-primary text-on-primary px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 sm:gap-2 hover:opacity-90 transition-all text-xs"
            >
              <span className="material-symbols-outlined text-sm">{exam.status === 'completed' ? 'download' : 'replay'}</span>
              {exam.status === 'completed' ? 'PDF' : 'Retry'}
            </button> */}
            <button 
              onClick={() => navigate('/create-exam')}
              className="flex-1 sm:flex-none bg-primary text-on-primary px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 sm:gap-2 hover:opacity-90 transition-all text-xs"
            >
              <span className="material-symbols-outlined text-sm">replay</span>
              Retry
            </button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-5 sm:p-6 md:p-8 flex flex-col justify-between atmospheric-shadow border border-outline-variant/10">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4 sm:mb-6">Exam Information</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-on-surface-variant">Subject</span>
                <span className="text-xs sm:text-sm font-bold text-on-surface">{exam.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-on-surface-variant">Total Marks</span>
                <span className="text-xs sm:text-sm font-bold text-on-surface">{exam.total_marks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-on-surface-variant">Status</span>
                <span className={`text-[10px] sm:text-xs font-bold uppercase px-2 py-0.5 rounded ${statusColors[exam.status] || 'text-gray-600 bg-gray-100'}`}>{exam.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-on-surface-variant">Created</span>
                <span className="text-xs sm:text-sm font-bold text-on-surface">{new Date(exam.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Insight Card */}
        <div className="lg:col-span-8 bg-primary rounded-xl p-5 sm:p-6 md:p-8 text-on-primary relative overflow-hidden shadow-xl shadow-primary/20 min-h-[180px] sm:min-h-[200px]">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed-dim font-headline">Evaluation Summary</h3>
              </div>
              <p className="text-sm sm:text-base md:text-xl font-medium leading-relaxed max-w-2xl text-on-primary font-body">
                {exam.status === 'completed' 
                  ? `Evaluation completed for "${exam.title}". ${results.length} student(s) evaluated with AI-powered grading.`
                  : exam.status === 'failed'
                  ? `Evaluation failed for "${exam.title}". You can re-try from the Create Exam page.`
                  : exam.status === 'evaluating'
                  ? `AI is currently evaluating "${exam.title}". Check back shortly for results.`
                  : `Exam "${exam.title}" is ready for evaluation. Upload answer sheets to begin.`
                }
              </p>
            </div>
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-4">
              <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold border border-white/10">Subject: {exam.subject}</div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold border border-white/10">Max: {exam.total_marks} marks</div>
              {results.length > 0 && (
                <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold border border-white/10">Students: {results.length}</div>
              )}
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-20 pointer-events-none">
            <span className="material-symbols-outlined text-[100px] sm:text-[150px] md:text-[200px]" style={{ fontVariationSettings: "'wght' 100" }}>psychology</span>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-4 sm:mb-6 md:mb-8 font-headline text-on-surface">
          {results.length > 0 ? 'Student Results' : 'Assessment Details'}
        </h2>
        
        {resultsLoading ? (
          <div className="flex justify-center py-12 sm:py-16">
            <Spinner size="lg" />
          </div>
        ) : results.length > 0 ? (
          <div className="bg-white rounded-xl overflow-hidden atmospheric-shadow border border-outline-variant/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[450px]">
                <thead>
                  <tr className="bg-surface-container-low/50 text-[10px] uppercase tracking-widest font-bold text-outline">
                    <th className="px-3 sm:px-6 py-3 sm:py-3.5">Student</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-3.5">Marks</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-3.5 hidden sm:table-cell">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {results.map((result, idx) => (
                    <tr key={result.id || idx} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] sm:text-xs flex-shrink-0">
                            {(result.studentName || 'S')[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs sm:text-sm truncate">{result.studentName || 'Student'}</p>
                            <p className="text-[10px] text-outline">{result.rollNumber || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="text-sm sm:text-lg font-black text-primary">{result.marksAwarded}</span>
                        <span className="text-[10px] sm:text-sm text-outline">/{result.maxMarks || exam.total_marks}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-on-surface-variant max-w-xs truncate hidden sm:table-cell">{result.feedback || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl p-8 sm:p-12 text-center atmospheric-shadow border border-outline-variant/10">
            <span className="material-symbols-outlined text-outline text-4xl mb-3 block">assignment</span>
            <p className="text-sm text-on-surface-variant mb-2">No results available yet</p>
            <p className="text-xs text-outline">
              {exam.status === 'pending' 
                ? 'Upload answer sheets from the Create Exam page to start evaluation.'
                : exam.status === 'failed'
                ? 'The evaluation failed. Please try again.'
                : 'Results will appear here once evaluation is complete.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamDetail;
