import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import Button from '../components/ui/Button';
import autoGradeLogo from '../assets/AutoGrade Ai.png';

const PublicPricing = () => {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const plans = [
    {
      name: 'Starter',
      desc: 'Ideal for individual professors & lecturers',
      price: annual ? '₹799' : '₹999',
      period: '/month',
      perPaper: annual ? '₹5.3/paper' : '₹6.6/paper',
      save: annual ? 'Save ₹2,400/yr' : null,
      annualTotal: annual ? '₹9,588 billed annually' : null,
      evalCount: '150 evaluations/mo',
      features: [
        '150 AI Evaluations / month',
        'Handwritten OCR & parsing',
        'Custom rubric alignment',
        'Personalized student feedback',
        'Detailed marks breakdown',
        'One-click PDF result export',
        'Standard email support',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Professional',
      desc: 'For department leads, multi-course faculty & active departments',
      price: annual ? '₹1,999' : '₹2,499',
      period: '/month',
      perPaper: annual ? '₹4.0/paper' : '₹5.0/paper',
      save: annual ? 'Save ₹6,000/yr' : null,
      annualTotal: annual ? '₹23,988 billed annually' : null,
      evalCount: '500 evaluations/mo',
      features: [
        '500 AI Evaluations / month',
        'High-speed batch upload (50+ files)',
        'Parallel evaluation pipeline',
        'Interactive analytics dashboard',
        'Question-level difficulty curves',
        'Custom rubrics & marking schemes',
        'Priority evaluation queue',
        'Excel & PDF bulk export',
        'Priority email & chat support',
      ],
      cta: 'Get Started with Pro',
      popular: true,
      badge: 'Most Popular for Faculty',
    },
    {
      name: 'Advanced',
      desc: 'For universities, colleges & large examination departments',
      price: annual ? '₹3,999' : '₹4,999',
      period: '/month',
      perPaper: annual ? '₹3.3/paper' : '₹4.2/paper',
      save: annual ? 'Save ₹12,000/yr' : null,
      annualTotal: annual ? '₹47,988 billed annually' : null,
      evalCount: '1,200 evaluations/mo',
      features: [
        '1,200 AI Evaluations / month',
        'Multi-faculty collaboration',
        'Department-wide analytics & trends',
        'Batch export with student roll mapping',
        'Direct CSV/LMS grading export',
        'Dedicated grading pipeline queue',
        'Custom question taxonomy tagging',
        'Dedicated account manager',
        'SLA 99.9% uptime guarantee',
      ],
      cta: 'Get Advanced Access',
      popular: false,
    },
  ];

  const faqs = [
    {
      q: 'Do I need a credit card to get started?',
      a: 'No credit card is required! Every registered faculty member receives 3 free AI evaluations every day forever. You only need to add payment details when you choose to upgrade to a higher monthly or annual tier.',
    },
    {
      q: 'Can I switch between monthly and annual billing?',
      a: 'Yes, you can upgrade, downgrade, or switch billing intervals anytime. Switching to annual saves you 20% on all plans.',
    },
    {
      q: 'What formats are supported for answer sheets?',
      a: 'AutoGrade AI natively supports PDF files, scanned documents, and direct photos taken with mobile cameras (JPEG, PNG, WebP). Handwritten and printed papers are both handled with high accuracy.',
    },
    {
      q: 'How fast is the evaluation process?',
      a: 'With our optimized parallel pipeline, a single answer sheet is evaluated in 8 to 15 seconds. A batch of 10 answer sheets completes in approximately 45 to 60 seconds with live progress streaming.',
    },
    {
      q: 'Can institutions purchase site licenses or custom volumes?',
      a: 'Yes! We offer customized institution-wide deployments, on-premise solutions, and LMS integration (Canvas, Moodle, Google Classroom). Contact us for institutional pilot programs.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* iOS 16 Liquid Glass Navbar */}
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-16 px-4 sm:px-6 flex flex-col items-center text-center bg-radial-gradient">
        {/* Glow backdrop */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-primary/15 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute top-12 right-1/4 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-secondary/15 rounded-full blur-[90px] animate-pulse delay-700" />
        </div>

        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-6">
          <i className="ri-sparkling-fill text-primary text-xs" />
          <span className="text-[11px] font-black uppercase tracking-wider text-primary font-headline">
            Transparent Academic Pricing
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-headline tracking-tight max-w-4xl leading-[1.15] mb-5">
          Simple, Fair Plans for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
            Every Educator
          </span>
        </h1>

        <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-8">
          Grade with confidence. Scale with zero friction. All plans include automated rubric evaluation, actionable student diagnostics, and exportable grade reports.
        </p>

        {/* Free daily quota highlight pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-50 border border-emerald-200/80 rounded-full shadow-sm mb-10">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-emerald-800">
            <strong>Free Daily Allowance:</strong> 3 evaluations every day forever — no credit card needed!
          </span>
        </div>

        {/* Billing Toggle (Monthly / Annual) */}
        <div className="inline-flex items-center gap-3 p-1.5 bg-white/80 backdrop-blur-md border border-outline-variant/40 rounded-full shadow-sm">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              !annual
                ? 'bg-primary text-white shadow-sm shadow-primary/25'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              annual
                ? 'bg-primary text-white shadow-sm shadow-primary/25'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[9px] font-black uppercase bg-emerald-500 text-white px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-3xl p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 ${
                p.popular
                  ? 'bg-white shadow-[0_20px_50px_rgba(32,54,189,0.15)] border-2 border-primary ring-4 ring-primary/10'
                  : 'bg-white/90 backdrop-blur-md shadow-xl shadow-slate-200/60 border border-slate-200/80 hover:shadow-2xl'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md shadow-primary/30 flex items-center gap-1">
                  <i className="ri-fire-fill text-xs" />
                  <span>{p.badge}</span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold font-headline text-slate-900 mb-1">{p.name}</h3>
                <p className="text-xs text-on-surface-variant min-h-[32px]">{p.desc}</p>
              </div>

              {/* Price display */}
              <div className="mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black font-headline text-slate-900 tracking-tight">
                    {p.price}
                  </span>
                  <span className="text-outline font-bold text-sm">{p.period}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {p.perPaper}
                  </span>
                  {p.save && (
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {p.save}
                    </span>
                  )}
                </div>
                {p.annualTotal && (
                  <p className="text-[11px] text-outline mt-1 font-medium">{p.annualTotal}</p>
                )}
              </div>

              {/* Feature list */}
              <div className="flex-1 space-y-3 mb-8">
                <p className="text-[11px] font-black uppercase tracking-widest text-outline">What's Included</p>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <i className="ri-checkbox-circle-fill text-primary text-base shrink-0 mt-[-1px]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => navigate('/signup')}
                variant={p.popular ? 'primary' : 'outline'}
                size="lg"
                className={`w-full rounded-xl font-bold text-sm py-3 transition-all ${
                  p.popular
                    ? 'shadow-lg shadow-primary/25 hover:shadow-primary/40'
                    : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                {p.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise / Institutional Callout */}
      <section className="pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-slate-900 via-primary/95 to-slate-900 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-wider text-secondary-container">
                Universities & Colleges
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-headline mt-3 mb-3">
                Need an Institution-Wide Evaluation Solution?
              </h2>
              <p className="text-white/80 text-sm leading-relaxed">
                Deploy AutoGrade AI across entire departments or university campuses. Includes LMS integrations, custom role management, automated grading rubric harmonization, and dedicated onboarding support.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-3.5 bg-white text-slate-900 rounded-xl font-bold text-sm shadow-xl hover:bg-slate-100 transition-all text-center"
              >
                Contact Academic Sales
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3.5 border border-white/30 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all text-center"
              >
                Faculty Log In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase rounded-full">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-headline mt-3 mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-on-surface-variant">Everything you need to know about plans and billing.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={faq.q}
              className="border border-outline-variant/30 rounded-2xl bg-white/70 backdrop-blur-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex justify-between items-center gap-4 font-bold text-sm text-slate-800 hover:text-primary transition-colors"
              >
                <span>{faq.q}</span>
                <i
                  className={`ri-arrow-down-s-line text-lg text-slate-400 transition-transform duration-300 ${
                    openFaq === idx ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-on-surface-variant leading-relaxed border-t border-slate-100 animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Public Footer */}
      <footer className="py-12 sm:py-16 px-4 sm:px-8 border-t border-outline-variant/50 bg-white/80">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src={autoGradeLogo} alt="AutoGrade Ai Logo" className="h-9 w-auto object-contain" />
            <div>
              <span className="font-headline font-black text-lg text-slate-900">AutoGrade AI</span>
              <p className="text-xs text-on-surface-variant">Automated Exam Evaluation Platform</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-on-surface-variant">
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
            <button onClick={() => navigate('/login')} className="hover:text-primary transition-colors">Log In</button>
            <button onClick={() => navigate('/signup')} className="hover:text-primary transition-colors">Sign Up</button>
            <button onClick={() => navigate('/pricing')} className="text-primary font-bold">Pricing</button>
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

export default PublicPricing;
