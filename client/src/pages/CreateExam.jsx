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
  const [isDraggingSheets, setIsDraggingSheets] = useState(false);
  
  const questionPaperRef = useRef(null);
  const rubricRef = useRef(null);
  const answerSheetsRef = useRef(null);

  const questionPaper = files.find(f => f.type === 'question_paper');
  const rubricFile = files.find(f => f.type === 'rubric');
  const answerSheets = files.filter(f => f.type === 'answer_sheet');

  const handleStartEvaluation = async () => {
    if (!examTitle.trim()) {
      addToast('Please enter an exam title.', 'error');
      return;
    }

    if (!examSubject.trim()) {
      addToast('Please enter the subject name.', 'error');
      return;
    }

    if (!totalMarks || parseInt(totalMarks, 10) <= 0) {
      addToast('Please enter valid total marks (e.g. 100).', 'error');
      return;
    }

    if (answerSheets.length === 0) {
      addToast('Please upload at least one student answer sheet.', 'error');
      return;
    }

    setEvaluating(true);
    try {
      addToast('Creating exam profile...');
      
      const { exam } = await examService.createExam({
        title: examTitle.trim(),
        subject: examSubject.trim(),
        totalMarks: parseInt(totalMarks, 10),
        questionPaperFile: questionPaper?.originalFile || null,
        rubricFile: rubricFile?.originalFile || null,
      });

      addToast('Dispatching answer sheets to Gemini AI engine...', 'info');

      await evaluationService.startEvaluation(exam.id, answerSheets);
      
      addToast('Evaluation pipeline launched successfully!', 'success');
      setTimeout(() => {
        navigate(`/evaluation-progress?examId=${exam.id}`);
      }, 1000);
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
    
    // For single-instance files (question_paper, rubric), replace existing
    if (type === 'question_paper' || type === 'rubric') {
      const newFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: selectedFiles[0].name,
        size: (selectedFiles[0].size / (1024 * 1024)).toFixed(2) + ' MB',
        type: type,
        originalFile: selectedFiles[0]
      };
      setFiles(prev => [...prev.filter(f => f.type !== type), newFile]);
      addToast(`Updated ${type === 'question_paper' ? 'Question Paper' : 'Grading Rubric'}`);
    } else {
      const newFiles = selectedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: type,
        originalFile: file
      }));
      setFiles(prev => [...prev, ...newFiles]);
      addToast(`Added ${selectedFiles.length} student answer sheet(s) to queue`);
    }

    // Reset input
    e.target.value = '';
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    addToast('Removed file');
  };

  const handleDropSheets = (e) => {
    e.preventDefault();
    setIsDraggingSheets(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const newFiles = droppedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: 'answer_sheet',
        originalFile: file
      }));
      setFiles(prev => [...prev, ...newFiles]);
      addToast(`Added ${droppedFiles.length} student answer sheet(s) via drop`);
    }
  };

  const isReadyToEvaluate = examTitle.trim() && examSubject.trim() && totalMarks && answerSheets.length > 0;

  return (
    <div className="relative min-h-full pb-16">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[350px] -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-[-80px] left-[15%] w-[350px] h-[350px] bg-primary/20 rounded-full blur-[90px]" />
        <div className="absolute top-[40px] right-[15%] w-[250px] h-[250px] bg-secondary/20 rounded-full blur-[80px]" />
      </div>

      {/* Header & Steps Progress */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Evaluation Setup
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-headline tracking-tight text-on-surface">
            Create New <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Evaluation</span>
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1">
            Configure exam attributes and upload materials for automated AI grading.
          </p>
        </div>

        {/* Stepper Indicator */}
        <div className="flex flex-col items-start sm:items-end gap-1.5 bg-white/70 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-outline-variant/15 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 sm:w-10 h-1.5 rounded-full bg-primary" />
            <div className="w-8 sm:w-10 h-1.5 rounded-full bg-slate-200" />
            <div className="w-8 sm:w-10 h-1.5 rounded-full bg-slate-200" />
          </div>
          <span className="text-[11px] font-bold text-outline">
            Step 1 of 3: Document Ingestion
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Form & Upload Dropzones */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Card 1: Exam Details Form */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/15">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-xl">edit_note</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-base sm:text-lg text-on-surface">
                  Exam Parameters
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Define the course, subject, and total grading capacity.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 tracking-wide" htmlFor="examTitle">
                  Exam Title <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    id="examTitle"
                    className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-on-surface placeholder:text-slate-400 text-sm font-medium transition-all outline-none"
                    placeholder="e.g. Midterm Exam 2026"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 tracking-wide" htmlFor="examSubject">
                  Subject / Course <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    id="examSubject"
                    className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-on-surface placeholder:text-slate-400 text-sm font-medium transition-all outline-none"
                    placeholder="e.g. Computer Science"
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 tracking-wide" htmlFor="totalMarks">
                  Total Marks <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    id="totalMarks"
                    className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-on-surface placeholder:text-slate-400 text-sm font-medium transition-all outline-none"
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
          </div>

          {/* Card 2: Question Paper & Grading Rubric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Question Paper Dropzone */}
            <div 
              onClick={() => questionPaperRef.current?.click()}
              className={`bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border-2 ${
                questionPaper ? 'border-primary/40 bg-primary/[0.01]' : 'border-dashed border-slate-200 hover:border-primary/50 hover:bg-primary/[0.02]'
              } transition-all group cursor-pointer shadow-sm relative flex flex-col justify-between min-h-[220px]`}
            >
              <input 
                type="file" 
                ref={questionPaperRef} 
                onChange={(e) => handleFileSelect(e, 'question_paper')} 
                className="hidden" 
                accept=".pdf,.docx,.doc" 
              />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${questionPaper ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary'} flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm`}>
                    <span className="material-symbols-outlined text-2xl font-variation-fill">
                      {questionPaper ? 'check_circle' : 'quiz'}
                    </span>
                  </div>
                  {questionPaper && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      Uploaded
                    </span>
                  )}
                </div>

                <h4 className="font-headline font-bold text-base text-on-surface mb-1">
                  Question Paper
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Master questions sheet (PDF or DOCX).
                </p>
              </div>

              {questionPaper ? (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 truncate max-w-[180px]">
                    {questionPaper.name}
                  </span>
                  <span className="text-primary font-bold hover:underline">
                    Change
                  </span>
                </div>
              ) : (
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">upload_file</span>
                    <span>Select Master Paper</span>
                  </span>
                </div>
              )}
            </div>

            {/* Grading Rubric Dropzone */}
            <div 
              onClick={() => rubricRef.current?.click()}
              className={`bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border-2 ${
                rubricFile ? 'border-secondary/40 bg-secondary/[0.01]' : 'border-dashed border-slate-200 hover:border-secondary/50 hover:bg-secondary/[0.02]'
              } transition-all group cursor-pointer shadow-sm relative flex flex-col justify-between min-h-[220px]`}
            >
              <input 
                type="file" 
                ref={rubricRef} 
                onChange={(e) => handleFileSelect(e, 'rubric')} 
                className="hidden" 
                accept=".pdf,.docx,.doc,.csv,.xlsx" 
              />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${rubricFile ? 'bg-emerald-100 text-emerald-700' : 'bg-secondary/10 text-secondary'} flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm`}>
                    <span className="material-symbols-outlined text-2xl font-variation-fill">
                      {rubricFile ? 'check_circle' : 'rule'}
                    </span>
                  </div>
                  {rubricFile && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      Uploaded
                    </span>
                  )}
                </div>

                <h4 className="font-headline font-bold text-base text-on-surface mb-1">
                  Grading Rubric / Key
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Evaluation criteria & step-marking model.
                </p>
              </div>

              {rubricFile ? (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 truncate max-w-[180px]">
                    {rubricFile.name}
                  </span>
                  <span className="text-secondary font-bold hover:underline">
                    Change
                  </span>
                </div>
              ) : (
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-secondary bg-secondary/10 rounded-xl group-hover:bg-secondary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">upload_file</span>
                    <span>Select Rubric</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Student Answer Sheets Dropzone */}
          <div 
            onClick={() => answerSheetsRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingSheets(true); }}
            onDragLeave={() => setIsDraggingSheets(false)}
            onDrop={handleDropSheets}
            className={`bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-10 border-2 ${
              isDraggingSheets 
                ? 'border-primary bg-primary/5 scale-[0.99]' 
                : answerSheets.length > 0 
                ? 'border-primary/40 bg-gradient-to-b from-white to-primary/[0.02]' 
                : 'border-dashed border-slate-200 hover:border-primary/50'
            } transition-all group cursor-pointer flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden`}
          >
            <input 
              type="file" 
              ref={answerSheetsRef} 
              onChange={(e) => handleFileSelect(e, 'answer_sheet')} 
              className="hidden" 
              accept="image/*,.pdf" 
              multiple 
            />

            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-white flex items-center justify-center mb-5 shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-3xl sm:text-4xl font-variation-fill">
                upload_file
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-headline font-extrabold text-lg sm:text-2xl text-on-surface">
                Student Answer Sheets
              </h3>
              <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-0.5 rounded-full">
                Required
              </span>
            </div>

            <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mb-6 leading-relaxed">
              Drag and drop scanned PDFs or images. AutoGrade AI automatically parses handwritten responses, aligns student names, and assigns marks against your rubric.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button 
                type="button" 
                className="px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 group-hover:bg-primary/95 transition-all inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>Select Answer Sheets</span>
              </button>

              {answerSheets.length > 0 && (
                <span className="px-4 py-3 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm font-variation-fill">check_circle</span>
                  <span>{answerSheets.length} sheet(s) ready</span>
                </span>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-2 gap-4">
            <button 
              onClick={() => navigate('/exams')}
              className="text-outline font-bold flex items-center gap-2 hover:text-on-surface transition-colors text-xs py-2"
              disabled={evaluating}
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to Exams</span>
            </button>

            <button 
              onClick={handleStartEvaluation}
              disabled={evaluating || !isReadyToEvaluate}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-headline font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2.5 ${
                evaluating 
                  ? 'bg-primary/70 text-white cursor-wait' 
                  : isReadyToEvaluate
                  ? 'bg-gradient-to-r from-primary to-primary-container text-white hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {evaluating ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span>Launching AI Engines...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base font-variation-fill">auto_awesome</span>
                  <span>Start AI Evaluation {answerSheets.length > 0 ? `(${answerSheets.length} Students)` : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Upload Queue & Dynamic Assistant */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 shadow-sm border border-outline-variant/15 sticky top-24">
            {/* Queue Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <div>
                <h4 className="font-headline font-bold text-on-surface text-sm sm:text-base">
                  Upload Queue
                </h4>
                <p className="text-[11px] text-on-surface-variant">
                  Files staged for evaluation
                </p>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                files.length > 0 ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-100 text-slate-500'
              }`}>
                {files.length} {files.length === 1 ? 'FILE' : 'FILES'}
              </span>
            </div>
            
            {/* Queue File List */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
              {files.length > 0 ? (
                files.map(file => (
                  <div 
                    key={file.id} 
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl flex items-center justify-between gap-3 border border-slate-200/60 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-700">
                        <span className="material-symbols-outlined text-base">
                          {file.type === 'question_paper' ? 'quiz' : file.type === 'rubric' ? 'rule' : 'description'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate text-xs">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {file.type === 'question_paper' ? 'Master Paper' : file.type === 'rubric' ? 'Rubric' : 'Answer Sheet'} • {file.size}
                        </p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeFile(file.id)} 
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Remove file"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                  <span className="material-symbols-outlined text-slate-300 text-3xl mb-1 block">cloud_upload</span>
                  <p className="text-xs font-semibold text-slate-600 mb-0.5">Queue is empty</p>
                  <p className="text-[11px] text-slate-400">Add documents using the cards on the left</p>
                </div>
              )}
            </div>

            {/* Dynamic Assistant Insight Card */}
            <div className="mt-6 p-4 bg-gradient-to-br from-primary/5 via-surface to-secondary/5 rounded-2xl border border-primary/15 relative">
              <div className="flex items-center gap-1.5 mb-2 text-primary">
                <span className="material-symbols-outlined text-sm font-variation-fill">auto_awesome</span>
                <span className="text-[10px] font-black uppercase tracking-wider">AI Assistant</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {answerSheets.length === 0 ? (
                  "Ready to assist. Upload master documents and at least 1 student answer sheet to begin automated evaluation."
                ) : (
                  `Detected ${answerSheets.length} answer sheet(s). Multi-modal vision analysis will extract student roll numbers and grade step-by-step against your rubric.`
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;

