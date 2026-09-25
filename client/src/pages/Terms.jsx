import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import logo from '../assets/logo.png';

const Terms = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('acceptance');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Terms of Service — AutoGrade AI';
  }, []);

  const sections = [
    { id: 'acceptance', title: '1. Acceptance & Scope' },
    { id: 'eligibility', title: '2. Faculty & Institutional Eligibility' },
    { id: 'ip', title: '3. Intellectual Property & Exam Ownership' },
    { id: 'ai-disclaimer', title: '4. AI Grading Disclaimer & Human-in-the-Loop' },
    { id: 'billing', title: '5. Subscriptions, Quotas & Credits' },
    { id: 'conduct', title: '6. Acceptable Use & Academic Honesty' },
    { id: 'sla', title: '7. Availability, Maintenance & Uptime SLA' },
    { id: 'termination', title: '8. Termination & Data Portability' },
    { id: 'liability', title: '9. Limitation of Liability' },
    { id: 'governing-law', title: '10. Governing Law & Dispute Terms' },
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-14 px-4 sm:px-6 md:px-8 bg-radial-gradient border-b border-outline-variant/40 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-secondary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-xs font-black tracking-wider uppercase mb-5">
            <i className="ri-file-text-fill text-sm" />
            <span>Academic User Agreement</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-headline tracking-tight text-slate-900 mb-4">
            Terms of Service
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully. By accessing or using the AutoGrade AI evaluation platform, you agree to be bound by these academic licensing and service terms.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-outline-variant/60 shadow-sm">
              <i className="ri-calendar-line text-secondary" />
              Last Revised: January 1, 2026
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-outline-variant/60 shadow-sm">
              <i className="ri-file-paper-line text-primary" />
              Version 3.1
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-outline-variant/60 shadow-sm">
              <i className="ri-scales-3-line text-tertiary" />
              Standard Faculty License
            </span>
          </div>
        </div>
      </section>

      {/* Key Highlights */}
      <section className="py-10 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface p-5 rounded-2xl border border-outline-variant/60 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg mb-3">
              <i className="ri-user-star-line" />
            </div>
            <h3 className="font-headline font-black text-slate-900 text-sm mb-1.5">Human In The Loop</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              AutoGrade AI is an evaluation accelerator. Instructors maintain ultimate authority to verify, modify, or override any score.
            </p>
          </div>

          <div className="bg-surface p-5 rounded-2xl border border-outline-variant/60 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-lg mb-3">
              <i className="ri-copyright-line" />
            </div>
            <h3 className="font-headline font-black text-slate-900 text-sm mb-1.5">100% IP Ownership</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Institutions and students retain full intellectual property rights to question papers, student solutions, and marksheets.
            </p>
          </div>

          <div className="bg-surface p-5 rounded-2xl border border-outline-variant/60 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center text-lg mb-3">
              <i className="ri-coin-line" />
            </div>
            <h3 className="font-headline font-black text-slate-900 text-sm mb-1.5">Transparent Metering</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Evaluation quotas are deducted per submitted student script. No hidden bandwidth or storage surcharges.
            </p>
          </div>

          <div className="bg-surface p-5 rounded-2xl border border-outline-variant/60 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-success/10 text-success flex items-center justify-center text-lg mb-3">
              <i className="ri-shield-check-line" />
            </div>
            <h3 className="font-headline font-black text-slate-900 text-sm mb-1.5">99.9% Season Uptime</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Engineered with horizontal autoscaling to guarantee high performance even during midterm and final exam weeks.
            </p>
          </div>
        </div>
      </section>

      {/* Main Legal Content with Sticky Quick Nav */}
      <section className="py-8 pb-20 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Quick Nav (Sidebar on lg screens) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-surface p-5 rounded-2xl border border-outline-variant/60 shadow-sm">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 px-2">Table of Contents</h4>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      activeSection === sec.id
                        ? 'bg-secondary text-white shadow-sm shadow-secondary/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{sec.title}</span>
                    <i className="ri-arrow-right-s-line text-xs opacity-60" />
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-5 border-t border-outline-variant/40">
                <p className="text-xs text-on-surface-variant font-medium mb-3">
                  Have questions regarding university procurement or custom Master Services Agreements (MSA)?
                </p>
                <button
                  onClick={() => navigate('/support')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <i className="ri-customer-service-2-line" />
                  <span>Talk with Legal & Support</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Detailed Legal Text */}
          <main className="lg:col-span-8 bg-surface p-6 sm:p-10 rounded-2xl border border-outline-variant/60 shadow-sm space-y-10">
            
            {/* Section 1 */}
            <div id="acceptance" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-secondary text-lg">1.</span> Acceptance & Scope
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                These Terms of Service ("Terms") constitute a legally binding agreement between you (whether individually as an educator, researcher, or teaching assistant, or collectively on behalf of an academic institution, department, or university) and AutoGrade AI ("AutoGrade AI", "we", "us").
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                By registering for an account, accessing our portal, uploading examination materials, or utilizing our automated grading vision APIs, you agree that you have read, understood, and agreed to be bound by these Terms and our <button onClick={() => navigate('/privacy')} className="text-primary font-bold hover:underline">Privacy Policy</button>.
              </p>
            </div>

            <hr className="border-outline-variant/40" />

            {/* Section 2 */}
            <div id="eligibility" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-secondary text-lg">2.</span> Faculty & Institutional Eligibility
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                AutoGrade AI is designed exclusively for educators, academic staff, teaching assistants, examination boards, and educational administrators. You represent and warrant that:
              </p>
              <ul className="space-y-2 text-sm text-slate-600 pl-4 list-disc marker:text-secondary">
                <li>You are at least 18 years of age or possess legal authorization from your academic institution.</li>
                <li>All registration information you submit is accurate, current, and verifiable.</li>
                <li>You have appropriate institutional authority to upload course examination materials and student answer sheets for automated assessment.</li>
                <li>You will safeguard account credentials and immediately notify AutoGrade AI of any unauthorized access.</li>
              </ul>
            </div>

            <hr className="border-outline-variant/40" />

            {/* Section 3 */}
            <div id="ip" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-secondary text-lg">3.</span> Intellectual Property & Exam Ownership
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                We believe firmly in institutional ownership of academic content:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
                <p>
                  <strong>Your Content:</strong> You, your institution, and your students retain exclusive copyright and all intellectual property rights to question papers, marking schemes, handwritten student responses, marks transcripts, and rubric assets uploaded to AutoGrade AI.
                </p>
                <p>
                  <strong>Limited Processing License:</strong> You grant AutoGrade AI a non-exclusive, worldwide, royalty-free license solely to host, parse, OCR, and execute evaluation prompts on your files for the express purpose of delivering the service to you.
                </p>
              </div>
            </div>

            <hr className="border-outline-variant/40" />

            {/* Section 4 */}
            <div id="ai-disclaimer" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-secondary text-lg">4.</span> AI Grading Disclaimer & Human-in-the-Loop
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                AutoGrade AI uses state-of-the-art multimodal vision and reasoning models to transcribe handwriting and evaluate student answers against instructor rubrics. However, machine-generated outputs can occasionally contain misinterpretations or edge-case discrepancies.
              </p>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <i className="ri-alert-line text-base" />
                  <span>Important Instructor Responsibility</span>
                </div>
                <p>
                  AutoGrade AI is designed to augment and expedite grading, <strong>not to replace professional pedagogical judgment</strong>. Instructors are solely responsible for reviewing marks, verifying partial credit allocations, resolving student grade disputes, and submitting official grades to their institution’s registrar.
                </p>
              </div>
            </div>

            <hr className="border-outline-variant/40" />

            {/* Section 5 */}
            <div id="billing" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-secondary text-lg">5.</span> Subscriptions, Quotas & Credits
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Usage of AutoGrade AI is structured around monthly or annual evaluation quotas (e.g., 150 evaluations/mo on Starter, 500 evaluations/mo on Pro):
              </p>
              <ul className="space-y-2 text-sm text-slate-600 pl-4 list-disc marker:text-secondary">
                <li>
                  <strong>Quota Metering:</strong> One credit is consumed when an individual student's complete answer sheet is parsed and evaluated against the exam rubric.
                </li>
                <li>
                  <strong>Plan Renewals:</strong> Paid plans renew automatically at the end of each billing cycle unless cancelled prior to the renewal date via the Billing Manager.
                </li>
                <li>
                  <strong>Refunds:</strong> If you experience persistent technical difficulties or system failure during an active evaluation batch, contact support within 7 days for credit reimbursement or prorated refund review.
                </li>
              </ul>
            </div>

            <hr className="border-outline-variant/40" />

            {/* Section 6 */}
            <div id="conduct" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-secondary text-lg">6.</span> Acceptable Use & Academic Honesty
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                You agree not to misuse AutoGrade AI services. Prohibited actions include:
              </p>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 pl-4 list-disc marker:text-secondary">
                <li>Uploading malicious payloads, infected PDFs, or attempting prompt injection against the AI evaluator.</li>
                <li>Reverse engineering, scraping, or attempting to extract proprietary vision model weights or backend heuristics.</li>
                <li>Reselling access or white-labeling the software without an authorized institutional partnership agreement.</li>
                <li>Uploading content that infringes upon third-party copyrights or violates applicable educational privacy standards.</li>
              </ul>
            </div>

            <hr className="border-outline-variant/40" />

            {/* Section 7 */}
            <div id="sla" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-secondary text-lg">7.</span> Service Availability & Uptime SLA
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                We strive to maintain 99.9% platform availability. Scheduled maintenance windows are announced at least 48 hours in advance and executed during off-peak weekend hours to avoid disrupting critical grading cycles.
              </p>
            </div>

            <hr className="border-outline-variant/40" />

            {/* Section 8 */}
            <div id="termination" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-secondary text-lg">8.</span> Termination & Data Portability
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                You may terminate your account at any time. Prior to account closure, instructors can download all evaluated student papers, analytical CSVs, and PDF reports using the bulk export tools. Upon termination, remaining stored documents are permanently purged within 30 days.
              </p>
            </div>

            <hr className="border-outline-variant/40" />

            {/* Section 9 */}
            <div id="liability" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-secondary text-lg">9.</span> Limitation of Liability
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                To the maximum extent permitted by applicable law, AutoGrade AI shall not be liable for any indirect, incidental, punitive, or consequential damages, including loss of data, grade calculation disputes, or educational penalties arising from the use or inability to use the platform. In all events, our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.
              </p>
            </div>

            <hr className="border-outline-variant/40" />

            {/* Section 10 */}
            <div id="governing-law" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-secondary text-lg">10.</span> Governing Law & Inquiries
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. For legal notices, contract modifications, or institutional agreements, please contact:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2 text-xs sm:text-sm">
                <p><strong>AutoGrade AI Legal Affairs</strong></p>
                <p className="text-slate-600">Email: <a href="mailto:connectautogradeai@gmail.com" className="text-secondary font-bold hover:underline">connectautogradeai@gmail.com</a></p>
                <p className="text-slate-600">Institutional Licensing: <button onClick={() => navigate('/support')} className="text-secondary font-bold hover:underline">autogradeai.com/support</button></p>
              </div>
            </div>

          </main>
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
            <button onClick={() => navigate('/terms')} className="text-primary font-bold">Terms</button>
            <button onClick={() => navigate('/support')} className="hover:text-primary transition-colors">Support</button>
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

export default Terms;
