import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { evaluationService } from '../services/evaluation.service';
import { examService } from '../services/exam.service';

const CreateExam = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [files, setFiles] = useState([]);
  const [examTitle, setExamTitle] = useState('');
  const [examSubject, setExamSubject] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  
  const questionPaperRef = useRef(null);
  const rubricRef = useRef(null);
  const answerSheetsRef = useRef(null);

  const handleStartEvaluation = async () => {
    if (files.length === 0) {
      addToast('Please upload at least one document to begin.', 'error');
      return;
    }

    const answerSheets = files.filter(f => f.type === 'answer_sheet');
    if (answerSheets.length === 0) {
      addToast('Please upload at least one answer sheet.', 'error');
      return;
    }

    if (!examTitle.trim() || !examSubject.trim() || !totalMarks) {
      addToast('Please fill in exam title, subject, and total marks.', 'error');
      return;
    }

    setEvaluating(true);
    try {
      addToast('Creating exam record...');
      
      // Step 1: Create the exam with question paper + rubric
      const questionPaper = files.find(f => f.type === 'question_paper');
      const rubricFile = files.find(f => f.type === 'rubric');

      const { exam } = await examService.createExam({
        title: examTitle.trim(),
        subject: examSubject.trim(),
        totalMarks: parseInt(totalMarks, 10),
        questionPaperFile: questionPaper?.originalFile || null,
        rubricFile: rubricFile?.originalFile || null,
      });

      addToast('Uploading and initializing AI engines...');

      // Step 2: Start evaluation with the real exam ID
      await evaluationService.startEvaluation(exam.id, answerSheets);
      
      addToast('Documents received. AI processing started.', 'success');
      setTimeout(() => {
        navigate(`/evaluation-progress?examId=${exam.id}`);
      }, 1500);
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to start evaluation';
      addToast(message, 'error');
    } finally {
      setEvaluating(false);
    }
  };

  const handleFileSelect = (e, type) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    
    const newFiles = selectedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: type,
      originalFile: file
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    addToast(`Added ${selectedFiles.length} file(s) to queue`);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    addToast('Removed file from queue');
  };

  return (
    <div className="min-h-full">
      {/* Breadcrumbs & Progress Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
        <div>
          <p className="text-primary font-bold text-xs tracking-widest uppercase mb-2">New Evaluation Phase</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-on-surface">Upload Materials</h1>
        </div>
        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
          <div className="flex gap-2">
            <div className="w-8 sm:w-12 h-1.5 rounded-full bg-primary"></div>
            <div className="w-8 sm:w-12 h-1.5 rounded-full bg-outline-variant/30"></div>
            <div className="w-8 sm:w-12 h-1.5 rounded-full bg-outline-variant/30"></div>
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-outline-variant font-label">Step 1 of 3: Document Ingestion</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8 order-2 lg:order-1">
          {/* Exam Details */}
          <div className="bg-white rounded-xl p-6 sm:p-8 atmospheric-shadow shadow-sm">
            <h3 className="font-headline font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              Exam Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-on-surface uppercase tracking-widest" htmlFor="examTitle">Exam Title</label>
                <input
                  id="examTitle"
                  className="w-full px-4 py-3 bg-surface-container-high/50 rounded-lg focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline text-sm transition-all border-none"
                  placeholder="e.g. Midterm Exam 2026"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-on-surface uppercase tracking-widest" htmlFor="examSubject">Subject</label>
                <input
                  id="examSubject"
                  className="w-full px-4 py-3 bg-surface-container-high/50 rounded-lg focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline text-sm transition-all border-none"
                  placeholder="e.g. Computer Science"
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-on-surface uppercase tracking-widest" htmlFor="totalMarks">Total Marks</label>
                <input
                  id="totalMarks"
                  className="w-full px-4 py-3 bg-surface-container-high/50 rounded-lg focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline text-sm transition-all border-none"
                  placeholder="e.g. 100"
                  type="number"
                  min="1"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div 
              onClick={() => questionPaperRef.current?.click()}
              className="bg-white rounded-xl p-6 sm:p-8 atmospheric-shadow flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/20 hover:border-primary/40 transition-all group cursor-pointer min-h-[240px] sm:h-64 shadow-sm relative overflow-hidden"
            >
              <input type="file" ref={questionPaperRef} onChange={(e) => handleFileSelect(e, 'question_paper')} className="hidden" accept=".pdf,.docx,.doc" />
              <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">quiz</span>
              </div>
              <h3 className="font-headline font-bold text-base sm:text-lg mb-1">Question Paper</h3>
              <p className="text-[10px] sm:text-xs text-on-surface-variant text-center px-4 sm:px-8">Drop your master exam sheet here. Supports PDF, DOCX.</p>
              <button className="mt-6 px-4 py-2 text-[10px] sm:text-xs font-bold text-primary bg-primary/5 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">Select File</button>
            </div>

            <div 
              onClick={() => rubricRef.current?.click()}
              className="bg-white rounded-xl p-6 sm:p-8 atmospheric-shadow flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/20 hover:border-secondary/40 transition-all group cursor-pointer min-h-[240px] sm:h-64 shadow-sm relative overflow-hidden"
            >
              <input type="file" ref={rubricRef} onChange={(e) => handleFileSelect(e, 'rubric')} className="hidden" accept=".pdf,.docx,.doc,.csv,.xlsx" />
              <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-secondary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-secondary text-2xl sm:text-3xl">rule</span>
              </div>
              <h3 className="font-headline font-bold text-base sm:text-lg mb-1">Grading Rubric</h3>
              <p className="text-[10px] sm:text-xs text-on-surface-variant text-center px-4 sm:px-8">Upload evaluation criteria for AI model.</p>
              <button className="mt-6 px-4 py-2 text-[10px] sm:text-xs font-bold text-secondary bg-secondary/5 rounded-full group-hover:bg-secondary group-hover:text-white transition-colors">Select File</button>
            </div>

            <div 
              onClick={() => answerSheetsRef.current?.click()}
              className="sm:col-span-2 bg-white rounded-xl p-6 sm:p-10 atmospheric-shadow border-2 border-dashed border-outline-variant/20 hover:border-primary/40 transition-all group cursor-pointer flex flex-col items-center relative overflow-hidden text-center min-h-[300px] shadow-sm"
            >
              <input type="file" ref={answerSheetsRef} onChange={(e) => handleFileSelect(e, 'answer_sheet')} className="hidden" accept="image/*,.pdf" multiple />
              <div className="absolute -right-20 -top-20 w-48 sm:w-64 h-48 sm:h-64 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:-translate-y-1 transition-transform relative z-10">
                <span className="material-symbols-outlined text-white text-3xl sm:text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>file_upload</span>
              </div>
              <h3 className="font-headline font-extrabold text-xl sm:text-2xl mb-2 text-on-surface relative z-10">Student Answer Sheets</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant text-center max-w-md relative z-10">Drag and drop multiple scanned response sheets. AutoGrade Ai will automatically separate individual student IDs.</p>
              <button className="mt-8 px-8 py-3 bg-primary/5 text-primary font-bold rounded-lg group-hover:bg-primary group-hover:text-white transition-all relative z-10">Choose Files</button>
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex flex-col sm:flex-row justify-between items-center py-6 gap-4 sm:gap-0">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-outline font-bold flex items-center gap-2 hover:text-on-surface transition-colors order-2 sm:order-1 text-sm active:scale-95"
              disabled={evaluating}
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Cancel
            </button>
            <button 
              onClick={handleStartEvaluation}
              disabled={evaluating || files.length === 0}
              className={`w-full sm:w-auto px-10 py-4 rounded-xl font-headline font-bold text-lg shadow-xl shadow-primary/20 transition-all order-1 sm:order-2 flex items-center justify-center gap-2 ${
                evaluating ? 'bg-primary/70 text-white pointer-events-none' :
                files.length > 0 ? 'bg-gradient-to-r from-primary to-primary-container text-white hover:scale-[1.02] active:scale-95' : 
                'bg-surface-container-high text-on-surface-variant pointer-events-none'
              }`}
            >
              {evaluating ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  Processing...
                </>
              ) : (
                'Start Evaluation'
              )}
            </button>
          </div>
        </div>

        {/* Side Insights Rail */}
        <div className="lg:col-span-4 lg:order-2 order-1">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 atmospheric-shadow sticky top-28 border border-outline-variant/10">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-headline font-bold text-on-surface text-sm sm:text-base">Upload Queue</h4>
              <span className="bg-primary/10 text-primary text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded">{files.length} FILES READY</span>
            </div>
            
            <div className="space-y-4 max-h-[300px] lg:max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
              {files.length > 0 ? files.map(file => (
                <div key={file.id} className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4 group hover:bg-surface-container-high transition-colors animate-page-in">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 border border-outline-variant/10">
                    <span className="material-symbols-outlined text-primary text-sm sm:text-base">
                      {file.type === 'question_paper' ? 'quiz' : file.type === 'rubric' ? 'rule' : 'description'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-on-surface truncate">{file.name}</p>
                    <p className="text-[9px] sm:text-[10px] text-on-surface-variant font-bold">{file.size}</p>
                  </div>
                  <button onClick={() => removeFile(file.id)} className="material-symbols-outlined text-outline hover:text-error cursor-pointer transition-colors text-lg">delete</button>
                </div>
              )) : (
                <div className="text-center py-12 border-2 border-dashed border-outline-variant/20 rounded-xl">
                  <span className="material-symbols-outlined text-outline text-3xl mb-2">cloud_upload</span>
                  <p className="text-xs text-on-surface-variant">Queue is empty</p>
                </div>
              )}
            </div>

            <div className="mt-8 p-4 bg-secondary/5 rounded-xl border border-secondary/10 relative">
              <div className="absolute -top-3 left-4 px-2 bg-white rounded-full flex items-center gap-1 border border-secondary/20 shadow-sm">
                <span className="material-symbols-outlined text-secondary text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <span className="text-[8px] font-black text-secondary tracking-widest uppercase">Assistant</span>
              </div>
              <p className="text-[10px] sm:text-xs text-secondary/80 leading-relaxed pt-1">
                Detected 42 student response sheets. OCR engine pre-allocated logic blocks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;
