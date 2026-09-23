import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useExam } from '../hooks/useExam';
import { useQuota } from '../hooks/useQuota';
import ScoreCard from '../components/evaluation/ScoreCard';
import Spinner from '../components/ui/Spinner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exams, loading, fetchExams } = useExam();
  const { remaining, limit, plan, isMonthly, fetchQuota } = useQuota();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchExams();
    fetchQuota();
  }, [fetchExams, fetchQuota]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, []);

  // Compute real stats from exams data
  const totalExams = exams.length;
  const completedExams = exams.filter(e => e.status === 'completed').length;
  const pendingExams = exams.filter(e => ['pending', 'evaluating', 'processing'].includes(e.status)).length;
  const failedExams = exams.filter(e => e.status === 'failed').length;
  const completionRate = totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0;

  // Filter exams based on search and status
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const titleMatch = (exam.title || exam.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const subjectMatch = (exam.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = titleMatch || subjectMatch;

      if (!matchesSearch) return false;
      if (statusFilter === 'all') return true;
      if (statusFilter === 'completed') return exam.status === 'completed';
      if (statusFilter === 'processing') return ['evaluating', 'processing'].includes(exam.status);
      if (statusFilter === 'pending') return exam.status === 'pending';
      return true;
    });
  }, [exams, searchQuery, statusFilter]);

  const statusColors = {
    completed: 'bg-emerald-500 shadow-emerald-500/50',
    evaluating: 'bg-amber-500 shadow-amber-500/50 animate-pulse',
    processing: 'bg-amber-500 shadow-amber-500/50 animate-pulse',
    pending: 'bg-blue-500 shadow-blue-500/50',
    failed: 'bg-red-500 shadow-red-500/50',
  };

  const statusBadgeStyles = {
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    evaluating: 'bg-amber-50 text-amber-700 border-amber-200/80',
    processing: 'bg-amber-50 text-amber-700 border-amber-200/80',
    pending: 'bg-blue-50 text-blue-700 border-blue-200/80',
    failed: 'bg-red-50 text-red-700 border-red-200/80',
  };

  const statusLabels = {
    completed: 'Completed',
    evaluating: 'Processing',
    processing: 'Processing',
    pending: 'Pending',
    failed: 'Failed',
  };

  const quotaLabel = isMonthly ? 'Monthly Quota' : 'Daily Quota';
  const quotaSubValue = plan === 'free' ? 'Free Tier' : `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`;
  const userName = user?.name || user?.email?.split('@')[0] || 'Professor';

  return (
    <div className="min-h-full space-y-6 sm:space-y-8 animate-page-in">
      
      {/* Clean Academic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-headline">Academic Dashboard</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Welcome back, {userName}. Here is your evaluation summary.</p>
        </div>
      </div>

      {/* Stats KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6">
        <ScoreCard 
          label="Total Exams" 
          value={String(totalExams)} 
          icon="ri-book-open-line" 
          color="primary" 
          subValue="All Time" 
        />
        <ScoreCard 
          label="Completed" 
          value={String(completedExams)} 
          icon="ri-checkbox-circle-line" 
          color="secondary" 
          subValue={totalExams > 0 ? `${completionRate}%` : '—'} 
        />
        <ScoreCard 
          label="Pending" 
          value={String(pendingExams)} 
          icon="ri-time-line" 
          color="error" 
          subValue={pendingExams > 0 ? 'In Progress' : 'None'} 
        />
        <ScoreCard 
          label={quotaLabel} 
          value={`${remaining}/${limit}`} 
          icon="ri-coin-line" 
          color={remaining > 0 ? 'success' : 'error'} 
          subValue={quotaSubValue} 
        />
      </div>

      {/* Quick Actions & AI Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        
        {/* Quick Actions (2 Columns Wide on Desktop) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-headline font-bold text-base sm:text-lg text-slate-900">Quick Actions Hub</h3>
              <p className="text-xs text-slate-500">Jump right into evaluation management and grading operations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {/* Action 1: Create Evaluation */}
            <button 
              onClick={() => navigate('/create-exam')}
              className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 hover:from-blue-50 hover:to-indigo-100/60 border border-blue-100 hover:border-blue-300 transition-all text-left group flex flex-col justify-between hover:-translate-y-1 hover:shadow-md cursor-pointer"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all text-primary">
                  <i className="ri-add-circle-line text-2xl"></i>
                </div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors">New Evaluation</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Upload question papers, answer keys & student scripts</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-primary">
                <span>Start Now</span>
                <i className="ri-arrow-right-line text-sm group-hover:translate-x-1 transition-transform"></i>
              </div>
            </button>

            {/* Action 2: View Exams */}
            <button 
              onClick={() => navigate('/exams')}
              className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 to-violet-50/40 hover:from-purple-50 hover:to-violet-100/60 border border-purple-100 hover:border-purple-300 transition-all text-left group flex flex-col justify-between hover:-translate-y-1 hover:shadow-md cursor-pointer"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition-all text-secondary">
                  <i className="ri-book-open-line text-2xl"></i>
                </div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-secondary transition-colors">Exam Repository</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Manage your question rubrics and past exam records</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-secondary">
                <span>Browse Archive</span>
                <i className="ri-arrow-right-line text-sm group-hover:translate-x-1 transition-transform"></i>
              </div>
            </button>

            {/* Action 3: Results & Analytics */}
            <button 
              onClick={() => navigate('/results')}
              className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 hover:from-emerald-50 hover:to-teal-100/60 border border-emerald-100 hover:border-emerald-300 transition-all text-left group flex flex-col justify-between hover:-translate-y-1 hover:shadow-md cursor-pointer"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all text-emerald-600">
                  <i className="ri-bar-chart-box-line text-2xl"></i>
                </div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">Results & Grades</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Inspect student score breakdowns and export CSVs</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <span>View Insights</span>
                <i className="ri-arrow-right-line text-sm group-hover:translate-x-1 transition-transform"></i>
              </div>
            </button>
          </div>
        </div>

        {/* AI Intelligence & Insights Card */}
        <div className="bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/30 rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 mb-4">
              <i className="ri-sparkling-fill text-secondary text-xl" />
              <h4 className="font-bold text-xs uppercase tracking-widest text-secondary font-headline">AI Copilot Insights</h4>
            </div>

            <div className="space-y-3">
              {/* Insight 1 */}
              <div className="p-3.5 bg-white/90 rounded-xl border border-slate-200/70 shadow-2xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <i className="ri-line-chart-line text-emerald-600 text-sm"></i>
                  <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Evaluation Health</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {completedExams > 0 
                    ? `${completedExams} batch(es) graded. Handwriting OCR calibrated with high accuracy.`
                    : 'System ready. Upload your first batch of answer sheets to start automated grading.'}
                </p>
              </div>

              {/* Insight 2 */}
              <div className="p-3.5 bg-white/90 rounded-xl border border-slate-200/70 shadow-2xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <i className="ri-lightbulb-line text-primary text-sm"></i>
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Workflow Tip</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {pendingExams > 0
                    ? `${pendingExams} evaluation batch currently processing. You can check live progress in the Batch Queue.`
                    : 'PDF batches support multi-page student answer scripts. AI automatically detects question boundaries.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Evaluation Engine v2.0</span>
            <button 
              onClick={() => navigate('/analytics')}
              className="text-[11px] font-bold text-secondary hover:text-purple-700 flex items-center gap-0.5 cursor-pointer"
            >
              <span>Full Analytics</span>
              <i className="ri-arrow-right-s-line text-sm"></i>
            </button>
          </div>
        </div>

      </div>

      {/* Recent Evaluations Data Table & Management */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight font-headline">Recent Evaluations</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                {filteredExams.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Overview of exams, status updates, and grading reports</p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input
                type="text"
                placeholder="Search by title or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-xl text-xs font-semibold text-slate-600">
              {[
                { id: 'all', label: 'All' },
                { id: 'completed', label: 'Completed' },
                { id: 'processing', label: 'Processing' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* View All Button */}
            <button 
              onClick={() => navigate('/exams')} 
              className="text-primary hover:text-blue-700 font-bold text-xs flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <i className="ri-arrow-right-line text-sm"></i>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Spinner size="lg" />
              <p className="text-xs text-slate-400 font-medium animate-pulse">Loading examination archive...</p>
            </div>
          ) : filteredExams.length > 0 ? (
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100">
                  <th className="px-5 sm:px-6 py-3.5">Examination</th>
                  <th className="px-5 sm:px-6 py-3.5">Subject</th>
                  <th className="px-5 sm:px-6 py-3.5">Total Marks</th>
                  <th className="px-5 sm:px-6 py-3.5">Status</th>
                  <th className="px-5 sm:px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExams.slice(0, 6).map((exam) => (
                  <tr 
                    key={exam.id} 
                    onClick={() => navigate(`/exams/${exam.id}`)} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                          <i className="ri-file-text-line text-xl"></i>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors truncate max-w-[220px] sm:max-w-xs">
                            {exam.title || exam.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">
                            ID: {exam.id ? `${exam.id.slice(0, 8)}...` : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 sm:px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                        {exam.subject || 'General'}
                      </span>
                    </td>

                    <td className="px-5 sm:px-6 py-4">
                      <span className="text-xs font-bold text-slate-700 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200/50">
                        {exam.total_marks || '100'} pts
                      </span>
                    </td>

                    <td className="px-5 sm:px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadgeStyles[exam.status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusColors[exam.status] || 'bg-slate-400'}`}></span>
                        <span>{statusLabels[exam.status] || exam.status}</span>
                      </span>
                    </td>

                    <td className="px-5 sm:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => navigate(`/exams/${exam.id}`)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        <button 
                          onClick={() => navigate(`/results?examId=${exam.id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View Results"
                        >
                          <i className="ri-arrow-right-s-line text-lg"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Inspiring Onboarding / Empty State */
            <div className="py-14 px-6 text-center max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-indigo-100 flex items-center justify-center mx-auto mb-4 text-primary shadow-xs">
                <i className="ri-book-open-line text-3xl"></i>
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-headline mb-1">
                {searchQuery ? 'No matching examinations found' : 'No examinations created yet'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                {searchQuery
                  ? `We couldn't find any exams matching "${searchQuery}". Try adjusting your keywords.`
                  : 'Get started by creating your first exam. Upload your model question paper, official answer keys, and student PDFs to start AI grading.'}
              </p>

              {!searchQuery ? (
                <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/60 mb-6 text-left">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">How AutoGrade Works</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                      <p className="text-slate-600"><strong className="text-slate-800">Create Exam</strong> with title, subject & rubrics</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                      <p className="text-slate-600"><strong className="text-slate-800">Upload PDFs</strong> for question key & student papers</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                      <p className="text-slate-600"><strong className="text-slate-800">AI Grades</strong> with marks breakdown & CSV export</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <button 
                onClick={() => navigate('/create-exam')}
                className="px-6 py-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-primary/25 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <i className="ri-add-line text-lg"></i>
                <span>Create Your First Exam</span>
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
