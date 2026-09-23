import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import logo from '../assets/logo.png';
import PublicNavbar from '../components/layout/PublicNavbar';

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const Landing = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeDemoTab, setActiveDemoTab] = useState('ocr'); // 'ocr' | 'rubric' | 'feedback'
  const [pricingAnnual, setPricingAnnual] = useState(false);

  const handleWatchDemo = () => {
    addToast('Opening video player...', 'info');
    window.open('https://youtu.be/56mqlTIf8Bs?si=H_yLagiFjVqRWUce', '_blank', 'noopener,noreferrer');
  };

  const scrollToPricing = () => {
    const el = document.getElementById('pricing');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/pricing');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Liquid Glass Floating Navbar */}
      <PublicNavbar onPricingClick={scrollToPricing} />

      {/* Hero Section */}
      <header className="relative pt-32 sm:pt-44 pb-16 sm:pb-24 px-4 sm:px-6 flex flex-col items-center text-center bg-radial-gradient bg-grid-pattern overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-primary/15 rounded-full blur-[100px] animate-pulse-glow" />
          <div className="absolute top-20 right-1/4 w-[300px] sm:w-[480px] h-[300px] sm:h-[480px] bg-secondary/15 rounded-full blur-[90px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[260px] h-[260px] bg-tertiary/10 rounded-full blur-[70px]" />
        </div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-headline tracking-tight mb-5 sm:mb-7 max-w-5xl leading-[1.12]"
        >
          Evaluate Exams with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary animate-gradient-flow">
            AI Precision
          </span>
        </motion.h1>
        
        {/* Hero Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg md:text-xl text-on-surface-variant max-w-2xl mb-8 sm:mb-10 leading-relaxed px-2 font-normal"
        >
          The all-in-one platform for educators to scan, grade, and analyze student response sheets using advanced vision models.{' '}
          <span className="font-bold text-primary">Save 80% of your time.</span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xl px-4 mb-12 sm:mb-16"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Button 
              onClick={() => navigate('/signup')} 
              size="lg" 
              className="w-full sm:w-auto h-12 sm:h-13 whitespace-nowrap shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all text-sm sm:text-base font-bold rounded-2xl px-6 sm:px-8 flex items-center justify-center gap-2"
            >
              <span>Start Evaluating Free</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Button 
              onClick={handleWatchDemo} 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto h-12 sm:h-13 whitespace-nowrap border-outline-variant/70 bg-white hover:bg-slate-50 text-slate-800 text-sm sm:text-base transition-all font-bold rounded-2xl px-6 sm:px-8 shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-primary text-xl">play_circle</span>
              <span>Watch Demo</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Social Proof / Stats Strip */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-6 bg-surface/90 backdrop-blur-md rounded-2xl border border-outline-variant shadow-sm mb-12 sm:mb-16"
        >
          <motion.div whileHover={{ scale: 1.04 }} className="text-center px-2 transition-transform cursor-default">
            <div className="text-2xl sm:text-3xl font-black font-headline text-primary">10x Faster</div>
            <div className="text-xs text-on-surface-variant font-medium mt-0.5">Evaluation Turnaround</div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} className="text-center px-2 border-l border-outline-variant/60 transition-transform cursor-default">
            <div className="text-2xl sm:text-3xl font-black font-headline text-secondary">99.4%</div>
            <div className="text-xs text-on-surface-variant font-medium mt-0.5">Multimodal OCR Accuracy</div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} className="text-center px-2 border-t md:border-t-0 md:border-l border-outline-variant/60 transition-transform cursor-default">
            <div className="text-2xl sm:text-3xl font-black font-headline text-tertiary">Zero Bias</div>
            <div className="text-xs text-on-surface-variant font-medium mt-0.5">Objective Rubric Scoring</div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} className="text-center px-2 border-t md:border-t-0 md:border-l border-outline-variant/60 transition-transform cursor-default">
            <div className="text-2xl sm:text-3xl font-black font-headline text-success">100k+</div>
            <div className="text-xs text-on-surface-variant font-medium mt-0.5">Pages Graded</div>
          </motion.div>
        </motion.div>

        {/* Interactive Live AI Grading Showcase Wrapper with Floating Accents */}
        <motion.div 
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl"
        >
          {/* Top-Left Floating Badge */}
          <motion.div
            animate={{ y: [-4, 6, -4] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            className="absolute -top-4 -left-3 sm:-left-5 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/80 shadow-lg backdrop-blur-md text-xs font-bold text-on-surface"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>⚡ 99.4% OCR Confidence</span>
          </motion.div>

          {/* Bottom-Right Floating Badge */}
          <motion.div
            animate={{ y: [5, -5, 5] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="absolute -bottom-4 -right-3 sm:-right-5 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/80 shadow-lg backdrop-blur-md text-xs font-bold text-on-surface"
          >
            <span className="material-symbols-outlined text-primary text-base font-variation-fill">verified</span>
            <span>🎯 Zero Grader Drift</span>
          </motion.div>

          <div id="interactive-demo" className="w-full rounded-2xl sm:rounded-3xl atmospheric-shadow border border-outline-variant/80 bg-surface overflow-hidden relative text-left">
            {/* Top Window Bar */}
            <div className="bg-surface-container px-4 py-3 border-b border-outline-variant/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="text-xs font-mono font-bold text-on-surface-variant ml-2 hidden sm:inline">
                  evalify-vision-agent • exam_physics_final_q3.pdf
                </span>
              </div>

              {/* Interactive Tab Selectors */}
              <div className="flex items-center bg-surface-container-high rounded-xl p-1 gap-1 text-xs font-bold">
                <button
                  onClick={() => setActiveDemoTab('ocr')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${activeDemoTab === 'ocr' ? 'bg-surface text-primary shadow-sm font-black' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  1. Vision OCR
                </button>
                <button
                  onClick={() => setActiveDemoTab('rubric')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${activeDemoTab === 'rubric' ? 'bg-surface text-secondary shadow-sm font-black' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  2. AI Rubric Score
                </button>
                <button
                  onClick={() => setActiveDemoTab('feedback')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${activeDemoTab === 'feedback' ? 'bg-surface text-tertiary shadow-sm font-black' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  3. Teacher Feedback
                </button>
              </div>
            </div>

            {/* Interactive Screen Display */}
            <div className="p-4 sm:p-8 bg-surface-container-low min-h-[380px]">
              <AnimatePresence mode="wait">
                {activeDemoTab === 'ocr' && (
                  <motion.div 
                    key="ocr"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  >
                    {/* Simulated Scanned Paper with Laser Scanline */}
                    <div className="bg-surface rounded-xl p-5 border border-outline-variant/80 shadow-sm relative overflow-hidden group">
                      {/* Animated Laser Scanner */}
                      <div className="laser-beam animate-scanline" />

                      <div className="flex justify-between items-center pb-3 border-b border-outline-variant/40 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-outline">Student Answer Sheet (Scanned)</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary">Q.4 (5 Marks)</span>
                      </div>
                      <div className="space-y-2.5 font-serif italic text-slate-700 text-sm sm:text-base leading-relaxed relative">
                        <p className="border-l-2 border-primary/40 pl-2 bg-primary/5 p-1 rounded">
                          "Electromagnetic induction is the phenomenon of generating an induced electromotive force (EMF) across an electrical conductor situated in a changing magnetic flux."
                        </p>
                        <div className="p-2 border border-dashed border-secondary/60 rounded bg-secondary/5 text-xs font-mono not-italic text-secondary">
                          [Formula Identified: ε = - dΦ/dt (Faraday's Law)]
                        </div>
                        <p className="text-slate-600">
                          The negative sign denotes Lenz's law indicating that the induced current opposes the flux change.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-semibold text-outline">
                        <span>Page 2 of 4</span>
                        <span className="text-success flex items-center gap-1 font-bold">
                          <span className="material-symbols-outlined text-sm font-variation-fill">check_circle</span> 
                          OCR Confidence: 99.4%
                        </span>
                      </div>
                    </div>

                    {/* AI Detection Breakdown */}
                    <div className="bg-surface rounded-xl p-5 border border-outline-variant/80 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-symbols-outlined text-secondary">document_scanner</span>
                          <h4 className="font-bold text-sm text-on-surface">Extracted & Structured Tokens</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-surface-container p-3 rounded-lg">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Key Concepts Recognized</div>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs font-semibold hover:bg-primary/20 transition-colors">Electromagnetic Induction</span>
                              <span className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-md text-xs font-semibold hover:bg-secondary/20 transition-colors">Faraday's Law</span>
                              <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary rounded-md text-xs font-semibold hover:bg-tertiary/20 transition-colors">Lenz's Law</span>
                              <span className="px-2 py-0.5 bg-success/10 text-success rounded-md text-xs font-semibold hover:bg-success/20 transition-colors">Magnetic Flux</span>
                            </div>
                          </div>
                          <div className="bg-surface-container p-3 rounded-lg">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-outline mb-1">Handwriting Legibility Score</div>
                            <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '96%' }}
                                transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
                                className="bg-primary h-2.5 rounded-full" 
                              />
                            </div>
                            <div className="flex justify-between text-[11px] text-outline mt-1 font-medium">
                              <span>Clear Cursive</span>
                              <span className="font-bold text-on-surface">96 / 100</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs">
                        <span className="text-on-surface-variant font-medium">Model: Gemini 1.5 Flash Vision</span>
                        <button onClick={() => setActiveDemoTab('rubric')} className="text-primary font-bold hover:underline flex items-center gap-1 group">
                          Proceed to Scoring <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeDemoTab === 'rubric' && (
                  <motion.div 
                    key="rubric"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28 }}
                    className="space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/60">
                      <div>
                        <h4 className="font-headline font-bold text-base text-on-surface">Rubric Criteria & Detailed Marks Breakdown</h4>
                        <p className="text-xs text-on-surface-variant">Question 4: State Faraday's law and explain Lenz's law with mathematical formulation.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-outline uppercase tracking-wider">Score:</span>
                        <span className="px-3 py-1 rounded-lg bg-success-container text-on-success-container font-black text-sm shadow-sm">
                          4.8 / 5.0 (96%)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-surface p-4 rounded-xl border border-outline-variant/80 hover:shadow-md transition-shadow">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-on-surface">Definition & Concept</span>
                          <span className="text-success font-black">2.0 / 2.0</span>
                        </div>
                        <div className="w-full bg-surface-container-high rounded-full h-2 mb-2 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="bg-success h-2 rounded-full" 
                          />
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">Exact scientific terminology used. Induced EMF and magnetic flux variation accurately described.</p>
                      </div>

                      <div className="bg-surface p-4 rounded-xl border border-outline-variant/80 hover:shadow-md transition-shadow">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-on-surface">Mathematical Formula</span>
                          <span className="text-primary font-black">1.8 / 2.0</span>
                        </div>
                        <div className="w-full bg-surface-container-high rounded-full h-2 mb-2 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '90%' }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="bg-primary h-2 rounded-full" 
                          />
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">Formulated ε = -dΦ/dt correctly. Missed specifying vector notation for area element in flux definition.</p>
                      </div>

                      <div className="bg-surface p-4 rounded-xl border border-outline-variant/80 hover:shadow-md transition-shadow">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-on-surface">Lenz's Law Justification</span>
                          <span className="text-secondary font-black">1.0 / 1.0</span>
                        </div>
                        <div className="w-full bg-surface-container-high rounded-full h-2 mb-2 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="bg-secondary h-2 rounded-full" 
                          />
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">Concisely explained energy conservation basis and opposition to changing flux.</p>
                      </div>
                    </div>

                    <div className="bg-surface p-3 rounded-xl border border-outline-variant/80 flex items-center justify-between text-xs">
                      <span className="text-on-surface-variant font-medium">Standardized grading applied across 42 class submissions.</span>
                      <button onClick={() => setActiveDemoTab('feedback')} className="text-secondary font-bold hover:underline flex items-center gap-1 group">
                        View AI Tutor Feedback <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeDemoTab === 'feedback' && (
                  <motion.div 
                    key="feedback"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28 }}
                    className="space-y-4"
                  >
                    <div className="bg-surface p-5 rounded-xl border border-outline-variant/80 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                        <h4 className="font-bold text-sm text-on-surface">AI-Generated Personalized Student Feedback</h4>
                      </div>
                      <div className="p-3.5 bg-primary/5 rounded-lg border border-primary/10 text-xs sm:text-sm text-on-surface leading-relaxed mb-3">
                        <strong>Strengths:</strong> Excellent clarity on electromagnetic principles. Your explanation of why the negative sign arises from Lenz's law demonstrates deep conceptual understanding.
                        <br/><br/>
                        <strong>Area for Improvement:</strong> When quoting Faraday's law in full vector form, remember to state that magnetic flux Φ = ∫ B · dA, ensuring the direction of the normal vector is noted.
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-md bg-success/10 text-success font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                            Grade: A+ (94%)
                          </span>
                          <span className="px-2.5 py-1 rounded-md bg-tertiary/10 text-tertiary font-bold">Class Rank: #3</span>
                        </div>
                        <span className="text-outline font-medium">Ready for 1-Click Export to Student Portal</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </header>

      {/* How It Works Section */}
      <section id="workflow" className="py-20 sm:py-28 px-4 sm:px-6 bg-surface-container-low border-y border-outline-variant/60">
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto text-center mb-16"
        >
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full">
            Effortless Workflow
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-headline tracking-tight text-on-surface mt-3">
            From Scanned Papers to Comprehensive Marks in 3 Steps
          </h2>
          <p className="text-on-surface-variant text-sm sm:text-base max-w-xl mx-auto mt-3">
            No manual re-keying or complex setup. Upload your answer sheets and let the multimodal AI handle the heavy lifting.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-surface rounded-2xl p-6 sm:p-8 border border-outline-variant/80 shadow-sm relative group hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black font-headline text-xl mb-5 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110">
              1
            </div>
            <h3 className="text-lg font-bold font-headline mb-2 text-on-surface">Upload Batch Answer Sheets</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Drag and drop single or multi-page PDFs, high-res smartphone photos, or bulk scanned folders. Automatic page orientation and deskewing included.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.22 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-surface rounded-2xl p-6 sm:p-8 border border-outline-variant/80 shadow-sm relative group hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center font-black font-headline text-xl mb-5 group-hover:bg-secondary group-hover:text-white transition-all transform group-hover:scale-110">
              2
            </div>
            <h3 className="text-lg font-bold font-headline mb-2 text-on-surface">Multimodal AI Evaluation</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Gemini vision models read handwritten math, scientific equations, and essays, mapping answers against your custom rubric criteria with high precision.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.34 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-surface rounded-2xl p-6 sm:p-8 border border-outline-variant/80 shadow-sm relative group hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 bg-tertiary/10 text-tertiary rounded-2xl flex items-center justify-center font-black font-headline text-xl mb-5 group-hover:bg-tertiary group-hover:text-white transition-all transform group-hover:scale-110">
              3
            </div>
            <h3 className="text-lg font-bold font-headline mb-2 text-on-surface">Review, Override & Export</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Easily audit flagged borderline answers with intuitive override sliders. Export complete marks tables to Excel, CSV, or your school LMS in one click.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid (Preserves all 3 required integration test assertions) */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 bg-surface">
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto text-center mb-16"
        >
          <span className="text-xs font-extrabold uppercase tracking-widest text-secondary bg-secondary/10 px-3.5 py-1.5 rounded-full">
            Powerful Platform
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-headline tracking-tight text-on-surface mt-3">
            Engineered for Modern Academic Institutions
          </h2>
          <p className="text-on-surface-variant text-sm sm:text-base max-w-xl mx-auto mt-3">
            Built from the ground up for university professors, school exam boards, and grading assistants.
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {/* Feature 1: Fast Batch Upload (Test required string) */}
          <motion.div 
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/80 hover:border-primary/50 hover:shadow-xl transition-all group"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-5 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-3xl">document_scanner</span>
            </div>
            <h3 className="text-xl font-bold font-headline text-on-surface mb-2.5">Fast Batch Upload</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Simply drag and drop a folder of scanned answer sheets. Our AI handles the splitting, sorting, and student identification automatically.
            </p>
          </motion.div>

          {/* Feature 2: Human-Grade OCR (Test required string) */}
          <motion.div 
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/80 hover:border-secondary/50 hover:shadow-xl transition-all group"
          >
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-5 group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <h3 className="text-xl font-bold font-headline text-on-surface mb-2.5">Human-Grade OCR</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Advanced handwriting recognition tailored for academic contexts, supporting messy cursive, multi-line math notation, and diagram labels.
            </p>
          </motion.div>

          {/* Feature 3: Deep Performance Analytics (Test required string) */}
          <motion.div 
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.25 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/80 hover:border-success/50 hover:shadow-xl transition-all group"
          >
            <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center text-success mb-5 group-hover:scale-110 group-hover:bg-success group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-3xl">insights</span>
            </div>
            <h3 className="text-xl font-bold font-headline text-on-surface mb-2.5">Deep Performance Analytics</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Get automated insights into batch-wide strengths, weaknesses, and curriculum gaps with visual dashboards and grade distribution curves.
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div 
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.35 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/80 hover:border-tertiary/50 hover:shadow-xl transition-all group"
          >
            <div className="w-14 h-14 bg-tertiary/10 rounded-2xl flex items-center justify-center text-tertiary mb-5 group-hover:scale-110 group-hover:bg-tertiary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-3xl">fact_check</span>
            </div>
            <h3 className="text-xl font-bold font-headline text-on-surface mb-2.5">Custom Rubric Builder</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Define exact criteria, step-marking rules, negative marking constraints, and bonus credits to ensure zero grading discrepancies.
            </p>
          </motion.div>

          {/* Feature 5 */}
          <motion.div 
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.45 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/80 hover:border-warning/50 hover:shadow-xl transition-all group"
          >
            <div className="w-14 h-14 bg-warning/10 rounded-2xl flex items-center justify-center text-warning mb-5 group-hover:scale-110 group-hover:bg-warning group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-3xl">radar</span>
            </div>
            <h3 className="text-xl font-bold font-headline text-on-surface mb-2.5">Similarity & Plagiarism Radar</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Cross-compare submissions across the entire class cohort to detect collusion, duplicate phrasing, or unauthorized external assistance.
            </p>
          </motion.div>

          {/* Feature 6 */}
          <motion.div 
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.55 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/80 hover:border-primary/50 hover:shadow-xl transition-all group"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-5 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-3xl">file_download</span>
            </div>
            <h3 className="text-xl font-bold font-headline text-on-surface mb-2.5">1-Click Gradebook Export</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Generate PDF marked answer sheets with comments directly in margins, or download CSV spreadsheets compatible with Canvas, Moodle, and Blackboard.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Comparison Section: Manual Grading vs Evalify AI */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 bg-surface-container-low">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-4xl font-black font-headline text-on-surface">
              Why Academic Leaders Switch to Evalify AI
            </h2>
            <p className="text-on-surface-variant text-sm sm:text-base mt-2">
              Transform grading from a grueling bottleneck into an instantaneous, data-rich feedback loop.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manual Grading */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-surface p-6 sm:p-8 rounded-2xl border border-error/20 relative shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 text-error font-headline font-bold text-lg mb-4">
                <span className="material-symbols-outlined">cancel</span>
                Traditional Manual Grading
              </div>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-error text-base shrink-0 mt-0.5">close</span>
                  <span><strong>30–45 hours</strong> spent grading a single 60-student exam batch.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-error text-base shrink-0 mt-0.5">close</span>
                  <span>Evaluator fatigue leads to rubric drift and subjective grading.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-error text-base shrink-0 mt-0.5">close</span>
                  <span>Minimal or generic written comments due to time constraints.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-error text-base shrink-0 mt-0.5">close</span>
                  <span>No class-wide analytics on which specific questions tripped students up.</span>
                </li>
              </ul>
            </motion.div>

            {/* Evalify AI */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-surface p-6 sm:p-8 rounded-2xl border-2 border-primary shadow-lg shadow-primary/5 relative hover:shadow-xl hover:shadow-primary/10 transition-all"
            >
              <div className="flex items-center gap-2 text-primary font-headline font-black text-lg mb-4">
                <span className="material-symbols-outlined font-variation-fill">check_circle</span>
                Evalify AI Platform
              </div>
              <ul className="space-y-3 text-sm text-on-surface">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-success text-base shrink-0 mt-0.5 font-variation-fill">done</span>
                  <span><strong>Under 15 minutes</strong> for full batch evaluation and OCR parsing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-success text-base shrink-0 mt-0.5 font-variation-fill">done</span>
                  <span>100% consistent rubric application with zero grader fatigue.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-success text-base shrink-0 mt-0.5 font-variation-fill">done</span>
                  <span>Constructive, personalized diagnostic feedback for every student.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-success text-base shrink-0 mt-0.5 font-variation-fill">done</span>
                  <span>Deep item analysis, difficulty curves, and curriculum gap detection.</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Public Pricing Section */}
      <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 bg-surface-container-lowest/50 relative border-t border-outline-variant/30">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="px-3.5 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full font-headline">
              Academic Pricing
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-headline tracking-tight mt-4 mb-3 text-slate-900">
              Simple, Predictable Plans for Educators
            </h2>
            <p className="text-on-surface-variant font-medium text-sm sm:text-base max-w-xl mx-auto">
              Start with 3 free evaluations every single day. Upgrade whenever your semester exam volume scales.
            </p>

            {/* Daily free guarantee pill */}
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-emerald-800">
                Every faculty member gets 3 free evaluations/day — no credit card needed!
              </span>
            </div>

            {/* Monthly / Annual Toggle */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={`text-sm font-bold transition-colors ${!pricingAnnual ? 'text-slate-900' : 'text-slate-400'}`}>
                Monthly
              </span>
              <button
                type="button"
                onClick={() => setPricingAnnual(!pricingAnnual)}
                className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
                  pricingAnnual ? 'bg-primary' : 'bg-slate-200'
                }`}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md ${
                    pricingAnnual ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-bold transition-colors ${pricingAnnual ? 'text-slate-900' : 'text-slate-400'}`}>
                Annual
              </span>
              {pricingAnnual && (
                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full animate-bounce">
                  Save 20%
                </span>
              )}
            </div>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch mb-12">
            {/* Starter Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white/90 backdrop-blur-md rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold font-headline text-slate-900 mb-1">Starter</h3>
                <p className="text-xs text-on-surface-variant mb-6">For individual lecturers & professors</p>

                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black font-headline text-slate-900">
                      {pricingAnnual ? '₹799' : '₹999'}
                    </span>
                    <span className="text-outline font-bold text-sm">/month</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {pricingAnnual ? '₹5.3/paper' : '₹6.6/paper'}
                    </span>
                    {pricingAnnual && (
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        Save ₹2,400/yr
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] font-black uppercase tracking-widest text-outline mb-3">Included Features</p>
                <ul className="space-y-2.5 text-xs text-slate-700 mb-8">
                  <li className="flex items-center gap-2.5">
                    <i className="ri-checkbox-circle-fill text-primary text-base" />
                    <span><strong>150 AI evaluations</strong> / month</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="ri-checkbox-circle-fill text-primary text-base" />
                    <span>Handwritten OCR & parsing</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="ri-checkbox-circle-fill text-primary text-base" />
                    <span>Personalized student feedback</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="ri-checkbox-circle-fill text-primary text-base" />
                    <span>Custom rubric alignment</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="ri-checkbox-circle-fill text-primary text-base" />
                    <span>One-click PDF result export</span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => navigate('/signup')}
                variant="outline"
                size="lg"
                className="w-full rounded-xl font-bold text-sm py-3 border-slate-300 hover:bg-slate-50 hover:border-primary/40 transition-colors"
              >
                Start Free Trial
              </Button>
            </motion.div>

            {/* Professional Plan (Popular) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.15 }}
              whileHover={{ y: -12, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-primary ring-4 ring-primary/10 shadow-2xl relative flex flex-col justify-between transform md:-translate-y-2 hover:shadow-primary/20 transition-all"
            >
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md shadow-primary/30">
                Most Popular for Faculty
              </span>

              <div>
                <h3 className="text-xl font-bold font-headline text-slate-900 mb-1">Professional</h3>
                <p className="text-xs text-on-surface-variant mb-6">For multi-course professors & department leads</p>

                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black font-headline text-slate-900">
                      {pricingAnnual ? '₹1,999' : '₹2,499'}
                    </span>
                    <span className="text-outline font-bold text-sm">/month</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {pricingAnnual ? '₹4.0/paper' : '₹5.0/paper'}
                    </span>
                    {pricingAnnual && (
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        Save ₹6,000/yr
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] font-black uppercase tracking-widest text-outline mb-3">All Starter features, plus</p>
                <ul className="space-y-2.5 text-xs text-slate-700 mb-8">
                  <li className="flex items-center gap-2.5">
                    <i className="ri-checkbox-circle-fill text-primary text-base" />
                    <span><strong>500 AI evaluations</strong> / month</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="ri-checkbox-circle-fill text-primary text-base" />
                    <span>High-speed batch upload (50+ sheets)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="ri-checkbox-circle-fill text-primary text-base" />
                    <span>Parallel evaluation engine</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="ri-checkbox-circle-fill text-primary text-base" />
                    <span>Item difficulty curve analytics</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="ri-checkbox-circle-fill text-primary text-base" />
                    <span>Priority email & chat support</span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => navigate('/signup')}
                variant="primary"
                size="lg"
                className="w-full rounded-xl font-bold text-sm py-3 shadow-lg shadow-primary/25 hover:shadow-primary/40"
              >
                Get Started with Pro
              </Button>
            </motion.div>

            {/* Advanced Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white/90 backdrop-blur-md rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold font-headline text-slate-900 mb-1">Advanced</h3>
                <p className="text-xs text-on-surface-variant mb-6">For universities & large examination cells</p>

                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black font-headline text-slate-900">
                      {pricingAnnual ? '₹3,999' : '₹4,999'}
                    </span>
                    <span className="text-outline font-bold text-sm">/month</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {pricingAnnual ? '₹3.3/paper' : '₹4.2/paper'}
                    </span>
                    {pricingAnnual && (
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        Save ₹12,000/yr
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] font-black uppercase tracking-widest text-outline mb-3">All Pro features, plus</p>
                <ul className="space-y-2.5 text-xs text-slate-700 mb-8">
                  <li className="flex items-center gap-2.5">
                    <i className="ri-checkbox-circle-fill text-primary text-base" />
                    <span><strong>1,200 AI evaluations</strong> / month</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="ri-checkbox-circle-fill text-primary text-base" />
                    <span>Multi-faculty collaborative grading</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="ri-checkbox-circle-fill text-primary text-base" />
                    <span>Dedicated grading pipeline queue</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="ri-checkbox-circle-fill text-primary text-base" />
                    <span>Direct LMS gradebook export</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="ri-checkbox-circle-fill text-primary text-base" />
                    <span>Dedicated account support manager</span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => navigate('/signup')}
                variant="outline"
                size="lg"
                className="w-full rounded-xl font-bold text-sm py-3 border-slate-300 hover:bg-slate-50 hover:border-primary/40 transition-colors"
              >
                Get Advanced Access
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 sm:py-24 px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-primary via-primary-container to-secondary p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/25 animate-gradient-flow"
        >
          {/* Subtle Ambient Shimmer */}
          <div className="absolute inset-0 bg-radial-gradient opacity-30 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black font-headline tracking-tight mb-4 text-white">
              Ready to Grade 10x Faster?
            </h2>
            <p className="text-white/85 text-base sm:text-lg max-w-xl mx-auto mb-8 font-normal">
              Join forward-thinking educators and institutions using AutoGrade AI to automate evaluations with human-grade precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center max-w-lg mx-auto">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={() => navigate('/signup')} 
                  size="lg" 
                  className="w-full sm:w-auto h-12 sm:h-13 whitespace-nowrap bg-white text-primary hover:bg-slate-50 shadow-xl font-bold text-sm sm:text-base px-8 rounded-2xl flex items-center justify-center gap-2"
                >
                  <span>Start Evaluating Free</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={scrollToPricing} 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto h-12 sm:h-13 whitespace-nowrap border-white/40 text-white hover:bg-white/10 text-sm sm:text-base font-bold px-8 rounded-2xl flex items-center justify-center gap-2"
                >
                  <span>View Plans & Pricing</span>
                  <span className="material-symbols-outlined text-lg">payments</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 px-4 sm:px-8 border-t border-outline-variant/60 bg-surface">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="AutoGrade Ai Logo" className="h-9 w-9 object-contain rounded-xl drop-shadow-sm" />
            <div>
              <span className="font-headline font-black text-lg text-on-surface">AutoGrade AI</span>
              <p className="text-xs text-on-surface-variant">Automated Answer Sheet Evaluation Platform</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-on-surface-variant">
            <button onClick={() => navigate('/dashboard')} className="hover:text-primary transition-colors">Dashboard</button>
            <button onClick={() => navigate('/create-exam')} className="hover:text-primary transition-colors">Create Exam</button>
            <button onClick={() => navigate('/pricing')} className="hover:text-primary transition-colors">Pricing</button>
            <button onClick={() => navigate('/analytics')} className="hover:text-primary transition-colors">Analytics</button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-outline-variant/40 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-outline">
          <p className="uppercase tracking-widest font-black">Empowering the academic edge.</p>
          <p>© 2026 Evalify AI • All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
