import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import logo from '../assets/logo.png';

const Privacy = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('scope');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Privacy Policy — AutoGrade AI';
  }, []);

  const sections = [
    { id: 'scope', title: '1. Institutional Scope' },
    { id: 'collection', title: '2. Information Collected' },
    { id: 'student-data', title: '3. Student Exam Data & OCR' },
    { id: 'ai-safeguards', title: '4. AI Engine & Zero-Training Guarantee' },
    { id: 'security', title: '5. Encryption & Security Controls' },
    { id: 'retention', title: '6. Data Retention & Deletion' },
    { id: 'rights', title: '7. Academic & Student Rights' },
    { id: 'subprocessors', title: '8. Subprocessors & Hosting' },
    { id: 'contact', title: '9. Data Protection Contact' },
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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black tracking-wider uppercase mb-5">
            <i className="ri-shield-check-fill text-sm" />
            <span>Academic Data Protection Standard</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-headline tracking-tight text-slate-900 mb-4">
            Privacy Policy
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            AutoGrade AI is engineered with rigorous educational privacy standards. We treat student answer sheets, examination rubrics, and faculty evaluations with bank-grade security and zero public AI model training.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-outline-variant/60 shadow-sm">
              <i className="ri-calendar-line text-primary" />
              Effective: January 1, 2026
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-outline-variant/60 shadow-sm">
              <i className="ri-award-line text-secondary" />
              FERPA & GDPR Aligned
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-outline-variant/60 shadow-sm">
              <i className="ri-lock-2-line text-success" />
              AES-256 & TLS 1.3 Encrypted
            </span>
          </div>
        </div>
      </section>

      {/* Core Privacy Guarantees */}
      <section className="py-10 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-surface p-6 rounded-2xl border border-outline-variant/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl mb-4">
              <i className="ri-cpu-line" />
            </div>
            <h3 className="font-headline font-black text-slate-900 text-base mb-2">Zero AI Model Training</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Student submissions, handwritten responses, and instructor rubrics are processed ephemerally. They are <strong>never</strong> fed into public LLMs or used to train foundational AI models.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-outline-variant/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-xl mb-4">
              <i className="ri-building-4-line" />
            </div>
            <h3 className="font-headline font-black text-slate-900 text-base mb-2">Institutional Ownership</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Your institution, faculty, and students retain 100% intellectual property and ownership over all questions, student responses, marks, and exported gradebooks.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-outline-variant/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center text-xl mb-4">
              <i className="ri-delete-bin-6-line" />
            </div>
            <h3 className="font-headline font-black text-slate-900 text-base mb-2">Configurable Data Purges</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Departments can schedule automated deletion of student scan artifacts post-evaluation (e.g., 30, 60, or 90 days) to comply with internal university retention schedules.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content with Sticky Quick Nav */}
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
                        ? 'bg-primary text-white shadow-sm shadow-primary/30'
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
                  Need a signed Data Processing Addendum (DPA) for your college?
                </p>
                <button
                  onClick={() => navigate('/support')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <i className="ri-mail-send-line" />
                  <span>Request Institutional DPA</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Detailed Policy Text */}
          <main className="lg:col-span-8 bg-surface p-6 sm:p-10 rounded-2xl border border-outline-variant/60 shadow-sm space-y-10">
            
            {/* Section 1 */}
            <div id="scope" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-primary text-lg">1.</span> Institutional Scope & Roles
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                This Privacy Policy describes how AutoGrade AI ("AutoGrade AI", "we", "our", or "us") handles personal data and educational records when instructors, academic departments, schools, and universities ("Institutions", "Subscribers") use our web application, automated grading APIs, and scanning pipelines.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Under relevant educational privacy frameworks (such as the Family Educational Rights and Privacy Act - <strong>FERPA</strong> in the United States and the General Data Protection Regulation - <strong>GDPR</strong> in the European Economic Area), AutoGrade AI acts strictly as a <em>"School Official"</em> or <em>"Data Processor"</em>. The educational institution remains the sole <em>"Data Controller"</em> with full authority over student records.
              </p>
            </div>

            <hr className="border-outline-variant/40" />

            {/* Section 2 */}
            <div id="collection" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-primary text-lg">2.</span> Information We Collect
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                We collect only the minimum required information necessary to provide automated exam grading, rubric calibration, and analytical reporting:
              </p>
              <ul className="space-y-2 text-sm text-slate-600 pl-4 list-disc marker:text-primary">
                <li>
                  <strong>Instructor Account Data:</strong> Full name, institutional email address, department affiliation, encrypted password hash, and subscription tier status.
                </li>
                <li>
                  <strong>Exam Configuration:</strong> Exam titles, subject codes, total marks, question structures, and instructor-provided rubric guidelines or model answer keys.
                </li>
                <li>
                  <strong>Uploaded Answer Scripts:</strong> Scanned images (PNG, JPEG, WebP) or multi-page PDF documents submitted by instructors for automated vision parsing and grading.
                </li>
                <li>
                  <strong>System Telemetry:</strong> Log timestamps, API latencies, error codes, and browser user-agent tokens utilized solely for diagnostics and security monitoring.
                </li>
              </ul>
            </div>

            <hr className="border-outline-variant/40" />

            {/* Section 3 */}
            <div id="student-data" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-primary text-lg">3.</span> Student Exam Data & Vision OCR
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                When student exam papers are uploaded, our vision pipeline performs optical character recognition (OCR) and semantic transcription to read handwritten math formulas, code blocks, diagrams, and written paragraphs.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong>Student Identification:</strong> Student names or roll numbers printed on answer sheets are matched strictly against the instructor’s roster. We do not correlate student performance across disparate universities or use student profiles for advertising, tracking, or profiling.
              </div>
            </div>

            <hr className="border-outline-variant/40" />

            {/* Section 4 */}
            <div id="ai-safeguards" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-primary text-lg">4.</span> AI Engine & Zero-Training Guarantee
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                AutoGrade AI leverages dedicated enterprise inference connections (powered by Google Cloud Vertex AI / Gemini Enterprise API). Under our enterprise service agreements:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant/60">
                  <i className="ri-checkbox-circle-fill text-success text-base shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-slate-700">
                    <strong>Zero Data Ingestion for Training:</strong> No customer input prompts, student handwriting transcripts, or grading rubrics are logged or used to train Google’s or AutoGrade AI’s foundation models.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant/60">
                  <i className="ri-checkbox-circle-fill text-success text-base shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-slate-700">
                    <strong>Ephemeral Inference:</strong> AI inference calls execute in memory. Once evaluation marks and feedback are returned to your database, the inference buffer is immediately cleared.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant/60">
                  <i className="ri-checkbox-circle-fill text-success text-base shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-slate-700">
                    <strong>Deterministic Rubric Adherence:</strong> The AI model evaluates answers strictly against the instructor’s specified criteria and points breakdown, without external hallucinated criteria.
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-outline-variant/40" />

            {/* Section 5 */}
            <div id="security" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-primary text-lg">5.</span> Encryption & Security Architecture
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                We implement defense-in-depth security controls across all application tiers:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <i className="ri-shield-keyhole-line text-primary" />
                    Data In Transit
                  </div>
                  <p className="text-slate-600">All browser traffic and API payloads are encrypted with TLS 1.3 and HSTS preloading enforced.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <i className="ri-hard-drive-2-line text-secondary" />
                    Data At Rest
                  </div>
                  <p className="text-slate-600">All relational databases and object storage buckets are encrypted using AES-256 with managed KMS keys.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <i className="ri-user-shared-line text-tertiary" />
                    Row-Level Security
                  </div>
                  <p className="text-slate-600">Database multi-tenancy employs strict PostgreSQL Row-Level Security (RLS) ensuring professors access only their assigned exams.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <i className="ri-alarm-warning-line text-warning" />
                    Automated Threat Defense
                  </div>
                  <p className="text-slate-600">Continuous rate limiting, DDoS mitigation, SQL injection barriers, and daily automated dependency audits.</p>
                </div>
              </div>
            </div>

            <hr className="border-outline-variant/40" />

            {/* Section 6 */}
            <div id="retention" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-primary text-lg">6.</span> Data Retention & Permanent Deletion
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Unlike consumer tools, AutoGrade AI empowers educators to dictate retention windows:
              </p>
              <ul className="space-y-2 text-sm text-slate-600 pl-4 list-disc marker:text-primary">
                <li>
                  <strong>Active Course Window:</strong> Exam evaluations and exported marksheets remain accessible during the active semester or academic year.
                </li>
                <li>
                  <strong>Instructor-Initiated Purge:</strong> Instructors can delete an entire exam batch, answer sheets, or individual student results at any moment from the Dashboard. Deletion is instantaneous and propagates across primary databases and backup replicas within 7 days.
                </li>
                <li>
                  <strong>Account Termination:</strong> Upon cancellation of an institutional subscription, all stored files, grading keys, and rosters are purged within 30 days unless legal retention is requested by the university administration.
                </li>
              </ul>
            </div>

            <hr className="border-outline-variant/40" />

            {/* Section 7 */}
            <div id="rights" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-primary text-lg">7.</span> Academic & Student Privacy Rights
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Students wishing to inspect their evaluated exam papers, dispute scores, or request erasure must coordinate directly with their course instructor or university registrar. As a data processor, AutoGrade AI provides instructors with one-click export tools to service student Subject Access Requests (SAR) promptly.
              </p>
            </div>

            <hr className="border-outline-variant/40" />

            {/* Section 8 */}
            <div id="subprocessors" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-primary text-lg">8.</span> Authorized Subprocessors
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                We partner only with industry-leading cloud infrastructure providers maintaining active SOC 2 Type II, ISO 27001, and HIPAA compliance:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-outline-variant/60 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 border-b border-outline-variant/60 font-bold text-slate-700">
                    <tr>
                      <th className="p-3">Partner / Provider</th>
                      <th className="p-3">Service Role</th>
                      <th className="p-3">Data Center Region</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40 text-slate-600">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Google Cloud / Vertex AI</td>
                      <td className="p-3">Enterprise LLM & Vision Processing (Zero Retention)</td>
                      <td className="p-3">United States / India / EU</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Supabase Inc.</td>
                      <td className="p-3">PostgreSQL Encrypted Database & Object Storage</td>
                      <td className="p-3">AWS us-east-1 / ap-south-1</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Render / Vercel Inc.</td>
                      <td className="p-3">Application Hosting & Edge Delivery</td>
                      <td className="p-3">Global Edge Network</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <hr className="border-outline-variant/40" />

            {/* Section 9 */}
            <div id="contact" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 flex items-center gap-2">
                <span className="text-primary text-lg">9.</span> Contact Our Data Protection Team
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                If you are a university security officer, dean, or instructor with questions about this policy, FERPA compliance, or security audits, contact our designated Data Protection Officer:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2 text-xs sm:text-sm">
                <p><strong>AutoGrade AI Security & Compliance Office</strong></p>
                <p className="text-slate-600">Email: <a href="mailto:connectautogradeai@gmail.com" className="text-primary font-bold hover:underline">connectautogradeai@gmail.com</a></p>
                <p className="text-slate-600">Support Desk: <button onClick={() => navigate('/support')} className="text-primary font-bold hover:underline">autogradeai.com/support</button></p>
                <p className="text-slate-500 text-xs">Response SLA for academic compliance queries: within 24 business hours.</p>
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
            <button onClick={() => navigate('/privacy')} className="text-primary font-bold">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-primary transition-colors">Terms</button>
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

export default Privacy;
