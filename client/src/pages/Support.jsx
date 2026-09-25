import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import { useToast } from '../context/ToastContext';
import logo from '../assets/logo.png';

const Support = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(null);

  const [attachedFile, setAttachedFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    category: 'ocr',
    priority: 'medium',
    subject: '',
    message: '',
    fileName: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Support & Help Center — AutoGrade AI';
  }, []);

  const categories = [
    { id: 'all', name: 'All Topics', icon: 'ri-apps-2-line' },
    { id: 'ocr', name: 'Handwriting & OCR', icon: 'ri-file-search-line' },
    { id: 'rubric', name: 'Rubric Calibration', icon: 'ri-scales-line' },
    { id: 'billing', name: 'Billing & Quotas', icon: 'ri-bank-card-line' },
    { id: 'export', name: 'LMS & Exports', icon: 'ri-file-excel-line' },
  ];

  const faqs = [
    {
      category: 'ocr',
      q: 'How does AutoGrade AI handle faint pencil or sloppy handwriting?',
      a: 'Our multimodal vision pipeline utilizes adaptive contrast normalization and stroke-geometry reconstruction. It reads cursive, crossed-out corrections, superscripts, and subscripts with over 98% accuracy. For best results, scan at 200–300 DPI in good ambient lighting.',
    },
    {
      category: 'ocr',
      q: 'What file formats are supported for answer sheet uploads?',
      a: 'We accept multi-page PDF files, scanned images (JPEG, PNG, WebP), and batch archives (ZIP containing multiple PDF scripts). Files up to 50MB per batch are supported.',
    },
    {
      category: 'rubric',
      q: 'Can I define partial credit and negative marking rules?',
      a: 'Yes! When configuring an exam, you can provide an itemized rubric specifying step marks (e.g., 2 marks for formula, 3 marks for calculation, 1 mark for final units). You can also set strict, moderate, or lenient evaluation temperatures.',
    },
    {
      category: 'rubric',
      q: 'Can an instructor override or modify an AI-assigned mark?',
      a: 'Absolutely. AutoGrade AI is designed around a "Human-in-the-Loop" architecture. In the Results and Exam Detail screens, click any student’s score to edit marks, append custom feedback, or re-evaluate with an updated rubric.',
    },
    {
      category: 'billing',
      q: 'What happens if I exhaust my evaluation quota during finals week?',
      a: 'You can immediately purchase additional evaluation packs or upgrade to the Professional or Institutional tier from the Pricing page. Quota upgrades take effect instantly with zero downtime.',
    },
    {
      category: 'billing',
      q: 'Do you provide GST invoices and university purchase order (PO) billing?',
      a: 'Yes. All annual plans and department institutional licenses can be billed via purchase orders, wire transfers, or credit cards, and we provide compliant tax invoices with your institution’s GSTIN/tax identification.',
    },
    {
      category: 'export',
      q: 'How do I export results into Canvas, Blackboard, or Moodle?',
      a: 'From the Exam Results page, click "Export" and choose "CSV / Excel". The exported spreadsheet includes standard student ID, name, question-level marks, and percentage columns ready for one-click LMS gradebook import.',
    },
  ];

  const filteredFaqs = faqs.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery =
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addToast('File too large. Maximum attachment size is 10MB.', 'error');
        return;
      }
      setAttachedFile(file);
      setFormData((prev) => ({ ...prev, fileName: file.name }));
      addToast(`Attached ${file.name}`, 'info');
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      addToast('Please complete all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const payload = new FormData();
      payload.append('ticket_id', ticketId);
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('institution', formData.institution || 'Not specified');
      payload.append('category', formData.category);
      payload.append('priority', formData.priority);
      payload.append('subject', formData.subject);
      payload.append('message', formData.message);
      if (attachedFile) {
        payload.append('attachment', attachedFile);
      }

      const res = await fetch('https://formspree.io/f/xzezvklr', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: payload,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit support ticket.');
      }

      setTicketSubmitted({
        id: ticketId,
        subject: formData.subject,
        email: formData.email,
        priority: formData.priority,
      });
      addToast(`Support ticket ${ticketId} created successfully!`, 'success');
    } catch (err) {
      console.error('Support ticket submission error:', err);
      addToast(err.message || 'Error submitting ticket. Please email connectautogradeai@gmail.com directly.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTicketSubmitted(null);
    setAttachedFile(null);
    setFormData({
      name: '',
      email: '',
      institution: '',
      category: 'ocr',
      priority: 'medium',
      subject: '',
      message: '',
      fileName: '',
    });
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-14 px-4 sm:px-6 md:px-8 bg-radial-gradient border-b border-outline-variant/40 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black tracking-wider uppercase mb-5">
            <i className="ri-customer-service-2-fill text-sm" />
            <span>Faculty Help Center & Technical Desk</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-headline tracking-tight text-slate-900 mb-4">
            How can we support your grading workflow?
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Troubleshoot handwriting OCR, configure departmental rubrics, request custom LMS integrations, or get rapid assistance from our academic engineering team.
          </p>

          {/* Interactive Help Search */}
          <div className="mt-8 max-w-2xl mx-auto relative">
            <div className="relative flex items-center">
              <i className="ri-search-line absolute left-4 text-lg text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search troubleshooting guides (e.g., handwriting, rubrics, Canvas export)..."
                className="w-full pl-12 pr-10 py-3.5 bg-white/90 backdrop-blur-md rounded-2xl border border-outline-variant/60 shadow-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1"
                >
                  <i className="ri-close-circle-fill text-lg" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-xs text-left text-slate-500 mt-2 px-2">
                Found <strong>{filteredFaqs.length}</strong> matching help topic{filteredFaqs.length === 1 ? '' : 's'}.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Live System Status Banner */}
      <section className="py-6 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
        <div className="bg-surface p-4 sm:p-5 rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <div>
              <span className="text-xs sm:text-sm font-black font-headline text-slate-900">
                All Core Evaluation Systems Operational
              </span>
              <p className="text-[11px] text-slate-500">Global Uptime: 99.98% • Active Exam Inference Grid</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs w-full md:w-auto">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-semibold">
              Vision OCR: Normal
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-semibold">
              Gemini AI: 0.8s Latency
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-semibold">
              Batch Pipeline: Active
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-semibold">
              PDF Export: Operational
            </div>
          </div>
        </div>
      </section>

      {/* Quick Help Category Cards */}
      <section className="py-6 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => {
              setSelectedCategory('ocr');
              document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="cursor-pointer bg-surface p-5 rounded-2xl border border-outline-variant/60 shadow-sm hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
              <i className="ri-file-search-line" />
            </div>
            <h3 className="font-headline font-black text-slate-900 text-sm mb-1 group-hover:text-primary transition-colors">
              OCR & Handwriting
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Tips for faint pencil scans, orientation correction, and diagram detection.
            </p>
          </div>

          <div
            onClick={() => {
              setSelectedCategory('rubric');
              document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="cursor-pointer bg-surface p-5 rounded-2xl border border-outline-variant/60 shadow-sm hover:border-secondary/50 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
              <i className="ri-scales-line" />
            </div>
            <h3 className="font-headline font-black text-slate-900 text-sm mb-1 group-hover:text-secondary transition-colors">
              Rubric Calibration
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Structuring step marks, partial credit parameters, and answer keys.
            </p>
          </div>

          <div
            onClick={() => {
              setSelectedCategory('billing');
              document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="cursor-pointer bg-surface p-5 rounded-2xl border border-outline-variant/60 shadow-sm hover:border-tertiary/50 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
              <i className="ri-bank-card-line" />
            </div>
            <h3 className="font-headline font-black text-slate-900 text-sm mb-1 group-hover:text-tertiary transition-colors">
              Billing & Quotas
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Plan upgrades, evaluation packs, GST invoices, and department pools.
            </p>
          </div>

          <div
            onClick={() => {
              setSelectedCategory('export');
              document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="cursor-pointer bg-surface p-5 rounded-2xl border border-outline-variant/60 shadow-sm hover:border-success/50 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
              <i className="ri-file-excel-line" />
            </div>
            <h3 className="font-headline font-black text-slate-900 text-sm mb-1 group-hover:text-success transition-colors">
              LMS & Exports
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Canvas, Blackboard, and Moodle CSV formatting and one-click PDF marksheets.
            </p>
          </div>
        </div>
      </section>

      {/* Main Support Grid: Ticket Form + Direct Contact Channels */}
      <section className="py-8 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Support Ticket Form */}
          <div className="lg:col-span-7 bg-surface p-6 sm:p-8 rounded-2xl border border-outline-variant/60 shadow-sm">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
                <i className="ri-send-plane-fill" />
                <span>Submit Faculty Ticket</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900">
                Direct Technical Assistance
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Forwarded directly to <span className="font-semibold text-slate-700">connectautogradeai@gmail.com</span> • Typical response time: under 2 hours.
              </p>
            </div>

            {ticketSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
                  <i className="ri-checkbox-circle-fill" />
                </div>
                <h3 className="font-headline font-black text-slate-900 text-xl">
                  Ticket Received!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Reference: <strong className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-emerald-300">{ticketSubmitted.id}</strong>. A confirmation and direct response will be dispatched to <strong>{ticketSubmitted.email}</strong>.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleResetForm}
                    className="px-4 py-2 bg-white text-slate-800 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    Submit Another Query
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Prof. Sarah Jenkins"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-outline-variant/60 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Institutional Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="s.jenkins@university.edu"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-outline-variant/60 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">College / Department</label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      placeholder="Department of Physics"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-outline-variant/60 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Issue Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-outline-variant/60 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    >
                      <option value="ocr">Handwriting OCR Discrepancy</option>
                      <option value="rubric">Rubric Configuration & Points</option>
                      <option value="billing">Quota Upgrade & Billing</option>
                      <option value="export">LMS / Canvas Export</option>
                      <option value="other">Other Inquiry</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Urgency Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'low', label: 'Normal' },
                      { id: 'medium', label: 'High' },
                      { id: 'urgent', label: '🚨 Exam in Progress' },
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, priority: lvl.id }))}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          formData.priority === lvl.id
                            ? lvl.id === 'urgent'
                              ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm'
                              : 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-slate-50 border-outline-variant/60 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g., Faint pencil answer script parsing on Question 4"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-outline-variant/60 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Description of Issue *</label>
                  <textarea
                    rows={4}
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe what occurred, your exam title, or question numbers involved..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-outline-variant/60 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                  />
                </div>

                {/* File attachment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Attach Sample Paper or Screenshot (Optional)</label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5 border border-slate-300">
                      <i className="ri-attachment-2" />
                      <span>{formData.fileName ? 'Change File' : 'Choose File'}</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-slate-500 truncate max-w-xs">
                      {formData.fileName || 'Max size 15MB (PDF, PNG, JPEG)'}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-base" />
                      <span>Submitting Ticket...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-2-line text-base" />
                      <span>Dispatch Priority Ticket</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Direct Channels & Resources */}
          <div className="lg:col-span-5 space-y-5">
            {/* Direct Email Card */}
            <div className="bg-surface p-6 rounded-2xl border border-outline-variant/60 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl mb-3">
                <i className="ri-mail-star-line" />
              </div>
              <h3 className="font-headline font-black text-slate-900 text-base mb-1">
                Faculty Support Inbox
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                Send answer keys, bulk evaluation requests, or custom grading rubrics directly to our academic team.
              </p>
              <a
                href="mailto:connectautogradeai@gmail.com"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <span>connectautogradeai@gmail.com</span>
                <i className="ri-arrow-right-up-line" />
              </a>
            </div>

            {/* Live Hours Card */}
            <div className="bg-surface p-6 rounded-2xl border border-outline-variant/60 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-xl mb-3">
                <i className="ri-time-line" />
              </div>
              <h3 className="font-headline font-black text-slate-900 text-base mb-1">
                Operating Hours
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed space-y-1">
                <span className="block"><strong>Mon – Fri:</strong> 8:00 AM – 10:00 PM IST / EST</span>
                <span className="block"><strong>Saturday:</strong> 9:00 AM – 6:00 PM IST / EST</span>
                <span className="block text-slate-400">Emergency Finals Support: 24/7 on Institutional Plans</span>
              </p>
            </div>

            {/* Documentation & Walkthrough */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
                <i className="ri-book-read-line text-white" />
              </div>
              <h3 className="font-headline font-black text-white text-base">
                Faculty Quickstart Guide
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Learn how to scan student papers with your smartphone, configure rubrics, and batch grade 60 students in under 15 minutes.
              </p>
              <button
                onClick={() => navigate('/#workflow')}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View 3-Step Grading Workflow</span>
                <i className="ri-arrow-right-line" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq-section" className="py-12 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
            <i className="ri-question-answer-line" />
            <span>Answers on Demand</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-headline text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-outline-variant/60 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <i className={cat.icon} />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* FAQ Accordions */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-outline-variant/60">
              <i className="ri-file-search-line text-3xl text-slate-300 mb-2 block" />
              <p className="text-sm font-bold text-slate-700">No help articles matched your search.</p>
              <p className="text-xs text-slate-500 mt-1">Try another keyword or submit a support ticket above.</p>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => (
              <div
                key={faq.q}
                className="border border-outline-variant/60 rounded-2xl bg-white shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 font-bold text-sm text-slate-900 hover:text-primary transition-colors"
                >
                  <span>{faq.q}</span>
                  <i
                    className={`ri-arrow-down-s-line text-lg text-slate-400 transition-transform duration-300 ${
                      openFaq === idx ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-slate-100 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Public Footer */}
      <footer className="py-12 sm:py-16 px-4 sm:px-8 border-t border-outline-variant/50 bg-white/80">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="AutoGrade Ai Logo" className="h-9 w-auto object-contain rounded-lg" />
            <div>
              <span className="font-headline font-black text-lg text-slate-900">AutoGrade AI</span>
              <p className="text-xs text-on-surface-variant">Automated Academic Evaluation Platform</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-on-surface-variant">
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
            <button onClick={() => navigate('/privacy')} className="hover:text-primary transition-colors">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-primary transition-colors">Terms</button>
            <button onClick={() => navigate('/support')} className="text-primary font-bold">Support</button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-outline">
          <p className="uppercase tracking-widest font-black">Empowering the academic edge.</p>
          <p>© 2026 AutoGrade AI • All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Support;
