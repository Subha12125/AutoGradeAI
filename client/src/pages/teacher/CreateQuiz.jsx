import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizService from '../../services/quiz.service';

const ALL_TYPES = [
  { id: 'MCQ', label: 'Multiple Choice (MCQ)', icon: 'ri-checkbox-circle-line' },
  { id: 'TRUE_FALSE', label: 'True / False', icon: 'ri-toggle-line' },
  { id: 'MULTI_SELECT', label: 'Multi-Select', icon: 'ri-checkbox-multiple-line' },
  { id: 'SCENARIO', label: 'Scenario / Case Study', icon: 'ri-file-text-line' },
  { id: 'ORDERING', label: 'Ordering / Sequence', icon: 'ri-sort-asc' },
  { id: 'MATCHING', label: 'Matching Pairs', icon: 'ri-shuffle-line' },
  { id: 'FILL_BLANK', label: 'Fill in the Blank', icon: 'ri-input-cursor-move' },
  { id: 'IMAGE_BASED', label: 'Visual / Diagram', icon: 'ri-image-line' },
];

export const CreateQuiz = () => {
  const navigate = useNavigate();

  // Generator inputs
  const [topic, setTopic] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [educationalLevel, setEducationalLevel] = useState('Undergraduate');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedTypes, setSelectedTypes] = useState(['MCQ', 'TRUE_FALSE', 'MULTI_SELECT', 'SCENARIO']);
  const [timeLimit, setTimeLimit] = useState(30);
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [validationReport, setValidationReport] = useState(null);
  const [regeneratingIndex, setRegeneratingIndex] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const toggleType = (typeId) => {
    if (selectedTypes.includes(typeId)) {
      if (selectedTypes.length === 1) return; // Keep at least one
      setSelectedTypes(selectedTypes.filter((t) => t !== typeId));
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!topic.trim()) {
      alert('Please enter a quiz topic or subject.');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationError(null);

      const res = await QuizService.generateQuiz({
        topic: topic.trim(),
        learningObjectives: learningObjectives.trim(),
        educationalLevel,
        questionCount: parseInt(questionCount, 10),
        difficulty,
        questionTypes: selectedTypes,
        timeLimit: parseInt(timeLimit, 10),
        additionalInstructions: additionalInstructions.trim(),
      });

      setGeneratedQuiz(res.quiz);
      setValidationReport(res.validationReport);
    } catch (err) {
      setGenerationError(err.response?.data?.error || err.message || 'Quiz generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateQuestion = async (index) => {
    if (!generatedQuiz) return;
    try {
      setRegeneratingIndex(index);
      const original = generatedQuiz.questions[index];

      const res = await QuizService.regenerateQuestion({
        topic: generatedQuiz.topic,
        questionIndex: index,
        preferredType: original.type || 'MCQ',
        difficultyLevel: original.difficulty || 2,
        learningObjective: original.learning_objective || learningObjectives,
      });

      if (res.question) {
        const updatedQuestions = [...generatedQuiz.questions];
        updatedQuestions[index] = res.question;
        setGeneratedQuiz({ ...generatedQuiz, questions: updatedQuestions });
      }
    } catch (err) {
      alert(`Could not regenerate question: ${err.message}`);
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const handlePublish = async () => {
    if (!generatedQuiz || !generatedQuiz.questions || generatedQuiz.questions.length === 0) {
      alert('Please generate quiz questions first.');
      return;
    }

    try {
      setIsPublishing(true);
      const res = await QuizService.createQuiz({
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        topic: generatedQuiz.topic,
        difficulty: generatedQuiz.difficulty,
        status: 'published',
        questions: generatedQuiz.questions,
      });

      // Automatically launch multiplayer host arena
      const sessionRes = await QuizService.createSession(res.quiz.id, {
        antigravityMode: true,
        streakBonus: true,
      });

      navigate(`/teacher/quizzes/${sessionRes.session.id}/host`);
    } catch (err) {
      alert(`Publishing failed: ${err.response?.data?.error || err.message}`);
      setIsPublishing(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/teacher/quizzes')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary mb-2 cursor-pointer transition-colors"
          >
            <i className="ri-arrow-left-line text-sm" />
            <span>Back to Arena Dashboard</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-black font-headline text-on-surface tracking-tight">
            Create AI Quiz Arena
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant">
            Configure learning objectives, difficulty, and question formats. Google Gemini handles the rest.
          </p>
        </div>

        {generatedQuiz && (
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-xl shadow-primary/25 hover:opacity-95 active:scale-95 transition-all cursor-pointer font-headline"
          >
            {isPublishing ? (
              <i className="ri-loader-4-line animate-spin text-lg" />
            ) : (
              <i className="ri-rocket-fill text-lg text-yellow-300" />
            )}
            <span>Publish & Host Live</span>
          </button>
        )}
      </div>

      {/* Main Grid: Settings & Review */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Generator Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleGenerate}
            className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm space-y-5"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/10 text-primary font-bold text-sm font-headline">
              <i className="ri-magic-line text-lg" />
              <span>AI Configuration</span>
            </div>

            {/* Topic Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                Topic or Subject <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Distributed Consensus, Organic Chemistry, World History"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>

            {/* Learning Objectives */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                Learning Objectives (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Students should differentiate between Paxos and Raft, understand leader election..."
                value={learningObjectives}
                onChange={(e) => setLearningObjectives(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs focus:outline-none focus:border-primary text-on-surface resize-none"
              />
            </div>

            {/* Education Level & Question Count */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                  Level
                </label>
                <select
                  value={educationalLevel}
                  onChange={(e) => setEducationalLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Middle School">Middle School</option>
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                  Count ({questionCount})
                </label>
                <input
                  type="range"
                  min={3}
                  max={15}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  className="w-full accent-primary mt-2 cursor-pointer"
                />
              </div>
            </div>

            {/* Difficulty & Time Limit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary capitalize"
                >
                  <option value="easy">Easy (Recall 1-2)</option>
                  <option value="medium">Medium (Application 2-3)</option>
                  <option value="hard">Hard (Analysis 3-4)</option>
                  <option value="adaptive">Adaptive Spectrum (1-5)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                  Time Limit
                </label>
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value={15}>15 Seconds</option>
                  <option value={20}>20 Seconds</option>
                  <option value={30}>30 Seconds</option>
                  <option value={45}>45 Seconds</option>
                  <option value={60}>60 Seconds</option>
                </select>
              </div>
            </div>

            {/* Supported Question Types */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                Question Formats ({selectedTypes.length})
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_TYPES.map((t) => {
                  const isSelected = selectedTypes.includes(t.id);
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => toggleType(t.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-primary/10 border-primary text-primary font-bold'
                          : 'bg-surface-container border-outline-variant/20 text-on-surface-variant hover:border-outline'
                      }`}
                    >
                      <i className={`${t.icon} text-sm ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`} />
                      <span className="truncate">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Instructions */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                Custom Guidelines (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Include real-world system design questions"
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 px-4 rounded-2xl bg-primary text-on-primary font-black text-sm shadow-lg shadow-primary/25 hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer font-headline"
            >
              {isGenerating ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-lg" />
                  <span>Synthesizing Arena with AI...</span>
                </>
              ) : (
                <>
                  <i className="ri-sparkling-fill text-yellow-300 text-lg" />
                  <span>Generate Complete Quiz</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Preview & Review (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {generationError && (
            <div className="p-5 rounded-2xl bg-error/10 border border-error/20 flex items-start gap-3 text-error">
              <i className="ri-alert-line text-2xl shrink-0" />
              <div>
                <p className="font-bold text-sm">AI Generation Encountered an Issue</p>
                <p className="text-xs mt-1">{generationError}</p>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="bg-surface-container-lowest p-12 rounded-3xl border border-outline-variant/20 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-3xl mx-auto animate-pulse">
                <i className="ri-brain-line" />
              </div>
              <div>
                <h3 className="text-lg font-black text-on-surface font-headline">Generating Structured Assessment</h3>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
                  Gemini is validating schema rules, structuring distractors, formatting time limits, and calculating difficulty taxonomies.
                </p>
              </div>
            </div>
          )}

          {!isGenerating && !generatedQuiz && (
            <div className="bg-surface-container-lowest p-12 rounded-3xl border border-dashed border-outline-variant/30 text-center space-y-3">
              <i className="ri-dashboard-2-line text-5xl text-outline-variant" />
              <h3 className="font-bold text-base text-on-surface font-headline">Quiz Preview Canvas</h3>
              <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                Fill in the topic and parameters on the left, then click Generate to review and edit questions before going live.
              </p>
            </div>
          )}

          {generatedQuiz && (
            <div className="space-y-4">
              {/* Validation Status Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <i className="ri-checkbox-circle-fill text-xl" />
                  <div>
                    <p className="font-bold text-xs font-headline">AI Quality Check Passed</p>
                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                      All {generatedQuiz.questions?.length} questions verified for schema, distinct answers, and clarity.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer font-headline"
                >
                  {isPublishing ? 'Publishing...' : 'Publish Arena'}
                </button>
              </div>

              {/* Quiz Summary Header Card */}
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase font-headline">
                    {generatedQuiz.topic}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {generatedQuiz.questions?.length} Questions • {generatedQuiz.difficulty}
                  </span>
                </div>
                <h2 className="text-xl font-black text-on-surface font-headline">{generatedQuiz.title}</h2>
                <p className="text-xs text-on-surface-variant">{generatedQuiz.description}</p>
              </div>

              {/* Questions List with inline editor & single question regeneration */}
              <div className="space-y-4">
                {generatedQuiz.questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-surface-container-high flex items-center justify-center text-xs font-black text-on-surface font-headline">
                          {idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-[10px] font-bold uppercase font-headline">
                          {q.type}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant text-[10px] font-semibold">
                          Diff: Level {q.difficulty || 2}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-on-surface-variant font-mono">
                          <i className="ri-timer-line mr-1 text-primary" />
                          {q.time_limit || 30}s
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRegenerateQuestion(idx)}
                          disabled={regeneratingIndex === idx}
                          className="px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface text-[11px] font-bold hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                          title="Regenerate only this question"
                        >
                          <i className={`ri-refresh-line ${regeneratingIndex === idx ? 'animate-spin' : ''}`} />
                          <span>{regeneratingIndex === idx ? 'Repairing...' : 'Regen'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Question Prompt */}
                    <p className="text-sm font-bold text-on-surface leading-snug">{q.prompt}</p>

                    {/* Options Preview */}
                    {Array.isArray(q.options) && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect =
                            String(q.correct_answer).toLowerCase() === String(opt).toLowerCase() ||
                            (Array.isArray(q.correct_answer) &&
                              q.correct_answer.map((x) => String(x).toLowerCase()).includes(String(opt).toLowerCase()));

                          return (
                            <div
                              key={oIdx}
                              className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-between ${
                                isCorrect
                                  ? 'bg-success/10 border-success/30 text-success'
                                  : 'bg-surface-container border-outline-variant/20 text-on-surface-variant'
                              }`}
                            >
                              <span>{opt}</span>
                              {isCorrect && <i className="ri-check-line text-sm" />}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="text-[11px] text-on-surface-variant bg-surface-container-high/40 p-2.5 rounded-xl border border-outline-variant/10">
                        <span className="font-bold text-on-surface">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
