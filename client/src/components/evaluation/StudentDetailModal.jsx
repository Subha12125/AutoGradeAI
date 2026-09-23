import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function cleanStudentDisplayName(name, rollNumber) {
  if (!name || name.toLowerCase() === 'answer' || name.toLowerCase() === 'student' || name.toLowerCase() === 'unknown') {
    if (rollNumber && rollNumber !== 'N/A') {
      return rollNumber.replace(/[_-]+/g, ' ').trim();
    }
    return 'Student';
  }
  return name.replace(/[_-]+/g, ' ').trim();
}

function cleanRollNumber(rollNumber, studentName) {
  if (!rollNumber || rollNumber === 'N/A') return '—';
  // If rollNumber is identical to cleaned studentName, return formatted or N/A
  if (studentName && rollNumber.replace(/[_-]+/g, ' ').toLowerCase() === studentName.toLowerCase()) {
    return 'Auto-detected';
  }
  return rollNumber;
}

const StudentDetailModal = ({ isOpen, onClose, result, maxExamMarks, onNext, onPrev, hasNext, hasPrev }) => {
  if (!isOpen || !result) return null;

  const displayName = cleanStudentDisplayName(result.studentName, result.rollNumber);
  const displayRoll = cleanRollNumber(result.rollNumber, displayName);
  const max = result.maxMarks || maxExamMarks || 100;
  const score = result.marksAwarded ?? 0;
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const isFailed = result.status === 'failed';
  const questions = Array.isArray(result.questionResults) ? result.questionResults : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-outline-variant/20 w-full max-w-3xl overflow-hidden my-auto max-h-[90vh] flex flex-col text-on-surface"
        >
          {/* Modal Header */}
          <div className="p-5 sm:p-7 border-b border-outline-variant/10 bg-surface-container-lowest flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md shadow-primary/20 flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-headline font-black text-lg sm:text-2xl text-on-surface tracking-tight">
                    {displayName}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isFailed ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isFailed ? 'Failed' : 'Evaluated'}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant font-medium">
                  Roll / ID: <span className="font-bold text-on-surface">{displayRoll}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                title="Close"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-7 overflow-y-auto space-y-6 sm:space-y-8 flex-1">
            {/* Score Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-1">Total Score</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-primary font-headline">{score}</span>
                  <span className="text-xs font-bold text-outline">/ {max} marks</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">Percentage</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-secondary font-headline">{pct}%</span>
                  <span className="text-xs font-semibold text-on-surface-variant">
                    {pct >= 80 ? 'Distinction' : pct >= 60 ? 'First Class' : pct >= 40 ? 'Pass' : 'Needs Help'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-1">Questions Graded</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-on-surface font-headline">{questions.length}</span>
                  <span className="text-xs font-bold text-outline">items</span>
                </div>
              </div>
            </div>

            {/* Overall Feedback Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-base font-variation-fill">psychology</span>
                </div>
                <h4 className="font-headline font-bold text-sm sm:text-base text-on-surface">
                  Overall AI Evaluation & Diagnostic Feedback
                </h4>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-outline-variant/15 text-xs sm:text-sm text-on-surface leading-relaxed shadow-sm">
                {result.overallFeedback || result.feedback ? (
                  <p className="whitespace-pre-line font-medium text-slate-800">
                    {result.overallFeedback || result.feedback}
                  </p>
                ) : (
                  <p className="text-outline italic">No overall feedback available for this submission.</p>
                )}
              </div>
            </div>

            {/* Question Breakdown */}
            {questions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-base">checklist</span>
                  </div>
                  <h4 className="font-headline font-bold text-sm sm:text-base text-on-surface">
                    Question-by-Question Marks & Step Breakdown
                  </h4>
                </div>

                <div className="space-y-3">
                  {questions.map((q, idx) => {
                    const qMax = q.maxMarks || 0;
                    const qAwarded = q.marksAwarded ?? 0;
                    const qPct = qMax > 0 ? (qAwarded / qMax) * 100 : 0;
                    return (
                      <div key={idx} className="p-4 rounded-xl sm:rounded-2xl border border-outline-variant/15 bg-white shadow-sm hover:border-primary/30 transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-bold font-headline text-on-surface flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-black text-[11px]">
                              Q.{q.questionNumber || idx + 1}
                            </span>
                            Question Evaluation
                          </span>
                          <div className="flex items-center gap-2">
                            {q.confidence && (
                              <span className="text-[10px] font-bold text-outline uppercase bg-surface-container px-2 py-0.5 rounded">
                                {q.confidence} confidence
                              </span>
                            )}
                            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                              qPct >= 80 ? 'bg-emerald-100 text-emerald-800' :
                              qPct >= 50 ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {qAwarded} / {qMax} marks
                            </span>
                          </div>
                        </div>

                        {q.feedback && (
                          <p className="text-xs text-on-surface-variant leading-relaxed pl-2 border-l-2 border-primary/20">
                            {q.feedback}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-outline-variant/10 bg-surface-container-lowest flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {onPrev && (
                <button
                  onClick={onPrev}
                  disabled={!hasPrev}
                  className="px-3 py-1.5 rounded-xl border border-outline-variant/20 text-xs font-bold hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                  Previous
                </button>
              )}
              {onNext && (
                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  className="px-3 py-1.5 rounded-xl border border-outline-variant/20 text-xs font-bold hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StudentDetailModal;
