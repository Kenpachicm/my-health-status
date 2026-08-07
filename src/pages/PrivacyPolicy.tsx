import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, ChevronRight, ExternalLink, Lock, Eye, Trash2,
  Database, Bell, Globe, Baby, AlertTriangle, Mail, FileText,
  CheckCircle, ChevronDown, Printer,
} from 'lucide-react';

const LAST_UPDATED = 'June 1, 2026';
const EFFECTIVE_DATE = 'June 1, 2026';

const SECTIONS = [
  { id: 'introduction',        label: 'Introduction' },
  { id: 'information-we-collect', label: 'Information We Collect' },
  { id: 'how-we-use',          label: 'How We Use Your Information' },
  { id: 'how-we-protect',      label: 'How We Protect Your Information' },
  { id: 'how-we-share',        label: 'How We Share Your Information' },
  { id: 'your-rights',         label: 'Your Privacy Rights' },
  { id: 'hipaa',               label: 'HIPAA Notice' },
  { id: 'data-retention',      label: 'Data Retention' },
  { id: 'third-party',         label: 'Third-Party Services' },
  { id: 'cookies',             label: 'Cookies & Tracking' },
  { id: 'childrens-privacy',   label: "Children's Privacy" },
  { id: 'breach-notification', label: 'Data Breach Notification' },
  { id: 'international',       label: 'International Users' },
  { id: 'changes',             label: 'Changes to This Policy' },
  { id: 'contact',             label: 'Contact Us' },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [tocOpen, setTocOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          const top = visible.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
          setActiveSection(top.target.id);
        }
      },
      { rootMargin: '-15% 0px -65% 0px', threshold: 0 },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
    setTocOpen(false);
  }

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 print:static print:border-b-2 print:border-gray-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                <Shield size={12} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors hidden sm:inline">
                MyHealthStatus
              </span>
            </Link>
            <ChevronRight size={13} className="text-gray-300 hidden sm:block" />
            <span className="text-sm text-gray-500 hidden sm:block">Privacy Policy</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden md:inline">Updated {LAST_UPDATED}</span>
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors print:hidden"
            >
              <Printer size={13} />
              Print
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-20 flex gap-10">
        {/* Sidebar TOC — desktop */}
        <aside className="hidden lg:block w-52 flex-shrink-0 print:hidden">
          <div className="sticky top-20">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">
              Contents
            </p>
            <nav className="space-y-0.5">
              {SECTIONS.map(({ id, label }, i) => {
                const isActive = activeSection === id;
                return (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className={`w-full flex items-center gap-2 text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-4 text-right flex-shrink-0 tabular-nums text-[10px] ${isActive ? 'text-blue-400' : 'text-gray-300'}`}>
                      {i + 1}.
                    </span>
                    {label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 pt-5 border-t border-gray-100 space-y-2">
              <a
                href="mailto:privacy@myhealthstatus.org"
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Mail size={11} />
                Privacy questions
              </a>
              <Link
                to="/docs#security"
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
              >
                <ExternalLink size={11} />
                Security docs
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 max-w-2xl">
          {/* Document header */}
          <div className="mb-10 pb-8 border-b border-gray-200">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <Lock size={11} />
              HIPAA-Aligned
            </div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Privacy Policy</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
              <span><span className="font-medium text-gray-700">Last Updated:</span> {LAST_UPDATED}</span>
              <span><span className="font-medium text-gray-700">Effective Date:</span> {EFFECTIVE_DATE}</span>
            </div>

            {/* Mobile TOC toggle */}
            <div className="mt-6 lg:hidden print:hidden">
              <button
                onClick={() => setTocOpen(o => !o)}
                className="flex items-center justify-between w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700"
              >
                <span className="flex items-center gap-2">
                  <FileText size={14} className="text-blue-600" />
                  Table of Contents
                </span>
                <ChevronDown size={15} className={`text-gray-400 transition-transform ${tocOpen ? 'rotate-180' : ''}`} />
              </button>
              {tocOpen && (
                <div className="mt-1 bg-gray-50 border border-gray-200 rounded-xl p-3 grid grid-cols-2 gap-1">
                  {SECTIONS.map(({ id, label }, i) => (
                    <button
                      key={id}
                      onClick={() => scrollTo(id)}
                      className="text-left text-xs text-gray-600 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-white transition-colors"
                    >
                      <span className="text-gray-400 mr-1 tabular-nums">{i + 1}.</span>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── 1. Introduction ───────────────────────────────────────────── */}
          <PolicySection id="introduction" number={1} title="Introduction" icon={<Shield size={16} className="text-blue-600" />}>
            <P>
              MyHealthStatus ("we," "us," or "our") is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our platform for secure sharing of health test results.
            </P>
            <P>
              We comply with applicable privacy laws, including the Health Insurance Portability and
              Accountability Act (HIPAA) where applicable.
            </P>
            <Callout type="info">
              By using MyHealthStatus, you agree to the collection and use of information in
              accordance with this policy. If you do not agree with these terms, please do not use
              our services.
            </Callout>
          </PolicySection>

          {/* ── 2. Information We Collect ─────────────────────────────────── */}
          <PolicySection id="information-we-collect" number={2} title="Information We Collect" icon={<Database size={16} className="text-blue-600" />}>
            <P>We collect the following categories of information:</P>

            <InfoGroup
              title="Personal Information"
              items={[
                'Name and contact information (email address)',
                'Account credentials',
                'Member ID (unique identifier)',
              ]}
            />
            <InfoGroup
              title="Health Information"
              items={[
                'Test results uploaded by healthcare providers',
                'Test types and dates',
                'Healthcare facility information',
              ]}
            />
            <InfoGroup
              title="Usage Information"
              items={[
                'Login activity',
                'Sharing activity',
                'Access logs (for security and audit purposes)',
              ]}
            />
            <InfoGroup
              title="Technical Information"
              items={[
                'IP address',
                'Browser type',
                'Device information',
              ]}
            />
          </PolicySection>

          {/* ── 3. How We Use ─────────────────────────────────────────────── */}
          <PolicySection id="how-we-use" number={3} title="How We Use Your Information" icon={<Eye size={16} className="text-blue-600" />}>
            <P>We use your information to:</P>
            <CheckList
              items={[
                'Provide and maintain our services',
                'Store and display your test results',
                'Enable secure sharing of results',
                'Send notifications about your account',
                'Maintain security and prevent fraud',
                'Comply with legal obligations',
                'Improve our services',
              ]}
            />
            <Callout type="tip">
              We use the minimum amount of information necessary to deliver each service and do not
              process health data for advertising or unrelated commercial purposes.
            </Callout>
          </PolicySection>

          {/* ── 4. How We Protect ─────────────────────────────────────────── */}
          <PolicySection id="how-we-protect" number={4} title="How We Protect Your Information" icon={<Lock size={16} className="text-blue-600" />}>
            <P>
              We implement comprehensive security measures across all layers of our infrastructure:
            </P>

            <div className="grid sm:grid-cols-3 gap-3 my-5">
              {[
                { label: 'AES-256', desc: 'Encryption at rest' },
                { label: 'TLS 1.3', desc: 'Encryption in transit' },
                { label: 'Row-Level', desc: 'Database security' },
              ].map(({ label, desc }) => (
                <div key={label} className="text-center bg-blue-50 border border-blue-100 rounded-xl py-4 px-3">
                  <div className="text-xl font-bold text-blue-700 mb-1">{label}</div>
                  <div className="text-xs text-blue-600">{desc}</div>
                </div>
              ))}
            </div>

            <CheckList
              items={[
                'AES-256 encryption for all stored data',
                'TLS 1.3 encryption for all data in transit',
                'Row-level security enforced at the database layer',
                'Multi-factor authentication support',
                'Access controls and role-based permissions',
                'Regular security audits and penetration testing',
                'HIPAA-compliant infrastructure and procedures',
              ]}
            />
          </PolicySection>

          {/* ── 5. How We Share ───────────────────────────────────────────── */}
          <PolicySection id="how-we-share" number={5} title="How We Share Your Information" icon={<Bell size={16} className="text-blue-600" />}>
            <Callout type="tip">
              <strong>We do NOT sell your personal or health information.</strong> Your data is
              never monetized or traded.
            </Callout>

            <P>We share information only in the following limited circumstances:</P>
            <CheckList
              items={[
                'With your explicit consent (when you share results via link or QR code)',
                'With healthcare providers you directly authorize',
                'With service providers under strict confidentiality agreements (e.g., hosting, database infrastructure)',
                'When required by law, court order, or government authority',
                'To protect the rights, property, or safety of our users or the public',
              ]}
            />

            <H3>You Control Sharing</H3>
            <P>You retain full control over your health information at all times:</P>
            <CheckList
              items={[
                'You decide who sees your results — no one can access them without your explicit share',
                'Set expiration dates so access automatically ends',
                'Revoke any share instantly from your dashboard',
                'Track who viewed your information and when via access logs',
              ]}
            />
          </PolicySection>

          {/* ── 6. Your Rights ────────────────────────────────────────────── */}
          <PolicySection id="your-rights" number={6} title="Your Privacy Rights" icon={<CheckCircle size={16} className="text-blue-600" />}>
            <P>You have the following rights regarding your personal information:</P>

            <div className="space-y-2 my-5">
              {[
                { right: 'Right to Access', desc: 'Request a copy of all personal information we hold about you.' },
                { right: 'Right to Correct', desc: 'Update or correct any inaccurate information in your account.' },
                { right: 'Right to Delete', desc: 'Request deletion of your account and all associated data.' },
                { right: 'Right to Restrict', desc: 'Request that we limit how we process your information.' },
                { right: 'Data Portability', desc: 'Receive your data in a structured, machine-readable format.' },
                { right: 'Withdraw Consent', desc: 'Revoke consent for optional data processing at any time.' },
              ].map(({ right, desc }) => (
                <div key={right} className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <CheckCircle size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{right}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <P>To exercise any of these rights, contact us at:</P>
            <ContactBadge email="privacy@myhealthstatus.org" label="Privacy Rights Requests" />
          </PolicySection>

          {/* ── 7. HIPAA ─────────────────────────────────────────────────── */}
          <PolicySection id="hipaa" number={7} title="HIPAA Notice" icon={<Shield size={16} className="text-blue-600" />}>
            <Callout type="info">
              This section applies specifically to protected health information (PHI) as defined
              under HIPAA.
            </Callout>
            <P>
              For health information protected under HIPAA, we maintain the safeguards required
              by the HIPAA Security Rule:
            </P>
            <CheckList
              items={[
                'Administrative safeguards — policies, training, and risk management',
                'Physical safeguards — secure data centers and access controls',
                'Technical safeguards — encryption, audit logging, and access controls',
                'Access limited to authorized personnel on a need-to-know basis',
                'Comprehensive audit logs of all access to PHI',
                'Documented breach notification procedures',
              ]}
            />
            <P>
              Under the HIPAA Privacy Rule, you have additional rights regarding your protected
              health information, including the right to receive a Notice of Privacy Practices
              and the right to file a complaint with the U.S. Department of Health and Human
              Services (HHS).
            </P>
          </PolicySection>

          {/* ── 8. Data Retention ─────────────────────────────────────────── */}
          <PolicySection id="data-retention" number={8} title="Data Retention" icon={<Database size={16} className="text-blue-600" />}>
            <div className="overflow-hidden border border-gray-200 rounded-xl my-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Data Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Retention Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Account & profile data', 'Duration of active account'],
                    ['Test results', 'Duration of active account or until deleted'],
                    ['Audit logs', '7 years (HIPAA compliance requirement)'],
                    ['Share access logs', '3 years'],
                    ['Technical logs', '90 days'],
                    ['Deleted account data', 'Purged within 30 days of deletion request'],
                  ].map(([type, period]) => (
                    <tr key={type} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">{type}</td>
                      <td className="px-4 py-3 text-gray-500">{period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <P>
              You may request deletion of your account and data at any time through your account
              settings or by contacting privacy@myhealthstatus.org. Some information may be
              retained longer when required by law or for legitimate legal purposes.
            </P>
          </PolicySection>

          {/* ── 9. Third-Party Services ───────────────────────────────────── */}
          <PolicySection id="third-party" number={9} title="Third-Party Services" icon={<Globe size={16} className="text-blue-600" />}>
            <P>
              We rely on a small number of carefully selected third-party providers to operate our
              platform. Each processes your data only as necessary to deliver their service and is
              bound by strict confidentiality obligations.
            </P>

            <div className="space-y-3 my-5">
              {[
                {
                  name: 'Firebase',
                  role: 'Database & Authentication',
                  note: 'SOC 2 Type II certified, HIPAA-eligible infrastructure on Google Cloud.',
                },
                {
                  name: 'Netlify',
                  role: 'Web Hosting & CDN',
                  note: 'SOC 2 certified hosting for the application frontend.',
                },
                {
                  name: 'SendGrid',
                  role: 'Transactional Email',
                  note: 'Used only for account notifications. No health data is included in emails.',
                },
              ].map(({ name, role, note }) => (
                <div key={name} className="flex items-start gap-3 border border-gray-200 rounded-xl px-4 py-3.5 bg-white">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-600">
                    {name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{name} <span className="font-normal text-gray-500">— {role}</span></div>
                    <div className="text-xs text-gray-500 mt-0.5">{note}</div>
                  </div>
                </div>
              ))}
            </div>

            <P>
              We do not share your information with advertising networks, data brokers, or
              analytics platforms that profile you for commercial purposes.
            </P>
          </PolicySection>

          {/* ── 10. Cookies ───────────────────────────────────────────────── */}
          <PolicySection id="cookies" number={10} title="Cookies & Tracking" icon={<Eye size={16} className="text-blue-600" />}>
            <P>
              We use only essential cookies required to operate the platform securely. We do not
              use advertising cookies, third-party tracking pixels, or behavioral analytics.
            </P>

            <div className="grid sm:grid-cols-3 gap-3 my-5">
              {[
                { label: 'Authentication', desc: 'Maintain your login session securely.' },
                { label: 'Security', desc: 'CSRF protection and request validation.' },
                { label: 'Preferences', desc: 'Remember your in-app settings.' },
              ].map(({ label, desc }) => (
                <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-center">
                  <div className="text-sm font-semibold text-gray-800 mb-1">{label}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
              ))}
            </div>

            <Callout type="tip">
              We do not use advertising or cross-site tracking cookies. You will never see
              MyHealthStatus ads following you around the web.
            </Callout>
          </PolicySection>

          {/* ── 11. Children's Privacy ────────────────────────────────────── */}
          <PolicySection id="childrens-privacy" number={11} title="Children's Privacy" icon={<Baby size={16} className="text-blue-600" />}>
            <P>
              Our services are intended exclusively for individuals 18 years of age or older.
              We do not knowingly collect, solicit, or process personal information from anyone
              under the age of 18.
            </P>
            <P>
              If you believe we have inadvertently collected information from a minor, please
              contact us immediately at privacy@myhealthstatus.org and we will take prompt steps
              to delete that information.
            </P>
          </PolicySection>

          {/* ── 12. Breach Notification ───────────────────────────────────── */}
          <PolicySection id="breach-notification" number={12} title="Data Breach Notification" icon={<AlertTriangle size={16} className="text-blue-600" />}>
            <P>
              In the event of a data breach that affects your information, we are committed to
              prompt, transparent communication:
            </P>
            <CheckList
              items={[
                'Notify affected users within 60 days (HIPAA Breach Notification Rule)',
                'Notify the U.S. Department of Health and Human Services (HHS) as required',
                'Notify relevant state authorities as required by applicable state law',
                'Provide a clear description of what happened and what information was affected',
                'Take immediate steps to contain the breach and mitigate harm',
                'Offer guidance on protective steps you can take',
              ]}
            />
            <P>
              To report a suspected security issue, please email us immediately:
            </P>
            <ContactBadge email="security@myhealthstatus.org" label="Security Incident Reporting" urgent />
          </PolicySection>

          {/* ── 13. International ─────────────────────────────────────────── */}
          <PolicySection id="international" number={13} title="International Users" icon={<Globe size={16} className="text-blue-600" />}>
            <P>
              MyHealthStatus is operated and headquartered in the United States. If you access
              our services from outside the United States, please be aware that your information
              will be transferred to, stored, and processed in the United States.
            </P>
            <P>
              The data protection laws in the United States may differ from those in your
              jurisdiction. By using our services, you consent to your information being processed
              in the United States in accordance with this Privacy Policy.
            </P>
          </PolicySection>

          {/* ── 14. Changes ───────────────────────────────────────────────── */}
          <PolicySection id="changes" number={14} title="Changes to This Policy" icon={<FileText size={16} className="text-blue-600" />}>
            <P>
              We may update this Privacy Policy from time to time to reflect changes in our
              practices, services, or applicable law. When we make material changes, we will:
            </P>
            <CheckList
              items={[
                'Update the "Last Updated" date at the top of this page',
                'Notify you by email to the address associated with your account',
                'Display a notice within the platform for at least 30 days',
              ]}
            />
            <P>
              Your continued use of MyHealthStatus after any changes constitutes acceptance of
              the updated policy. We encourage you to review this page periodically.
            </P>
          </PolicySection>

          {/* ── 15. Contact ───────────────────────────────────────────────── */}
          <PolicySection id="contact" number={15} title="Contact Us" icon={<Mail size={16} className="text-blue-600" />}>
            <P>
              If you have questions, concerns, or requests related to this Privacy Policy or our
              data practices, please contact us:
            </P>

            <div className="grid sm:grid-cols-2 gap-3 my-5">
              <ContactCard
                label="Privacy Questions"
                email="privacy@myhealthstatus.org"
                desc="General privacy inquiries and rights requests"
              />
              <ContactCard
                label="Security Issues"
                email="security@myhealthstatus.org"
                desc="Report vulnerabilities or suspected breaches"
              />
            </div>

            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-sm text-gray-600 space-y-1">
              <div className="font-semibold text-gray-800 mb-2">Mailing Address</div>
              <div>Privacy Officer</div>
              <div>MyHealthStatus</div>
              <div>United States</div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-400">
                This Privacy Policy was last updated on {LAST_UPDATED} and is effective as of {EFFECTIVE_DATE}.
              </p>
              <div className="flex items-center justify-center gap-4 mt-3">
                <Link to="/docs#security" className="text-xs text-blue-600 hover:underline">Security Documentation</Link>
                <span className="text-gray-300">·</span>
                <Link to="/" className="text-xs text-blue-600 hover:underline">Back to MyHealthStatus</Link>
              </div>
            </div>
          </PolicySection>
        </main>
      </div>
    </div>
  );
}

// ── Shared layout components ──────────────────────────────────────────────────

function PolicySection({
  id, number, title, icon, children,
}: {
  id: string;
  number: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-14 scroll-mt-6 print:mb-8 print:break-inside-avoid">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-gray-400 tabular-nums w-5 text-right">{number}.</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="pl-[52px]">{children}</div>
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-gray-800 mt-6 mb-2">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 leading-relaxed mb-3 text-[15px]">{children}</p>;
}

function Callout({ type, children }: { type: 'info' | 'tip' | 'warning'; children: React.ReactNode }) {
  const styles = {
    info:    'bg-blue-50 border-blue-200 text-blue-800',
    tip:     'bg-teal-50 border-teal-200 text-teal-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  };
  return (
    <div className={`border rounded-xl px-4 py-3.5 my-4 text-sm leading-relaxed ${styles[type]}`}>
      {children}
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 my-4">
      {items.map(item => (
        <li key={item} className="flex items-start gap-2.5 text-[15px] text-gray-600">
          <CheckCircle size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function InfoGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      </div>
      <ul className="space-y-1.5 pl-3.5">
        {items.map(item => (
          <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
            <ChevronRight size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactBadge({ email, label, urgent }: { email: string; label: string; urgent?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-3 border rounded-xl px-4 py-3 my-3 ${
      urgent ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        urgent ? 'bg-red-100' : 'bg-blue-100'
      }`}>
        <Mail size={14} className={urgent ? 'text-red-600' : 'text-blue-600'} />
      </div>
      <div>
        <div className={`text-xs font-semibold ${urgent ? 'text-red-700' : 'text-gray-600'}`}>{label}</div>
        <a href={`mailto:${email}`} className={`text-sm font-medium hover:underline ${
          urgent ? 'text-red-600' : 'text-blue-600'
        }`}>
          {email}
        </a>
      </div>
    </div>
  );
}

function ContactCard({ label, email, desc }: { label: string; email: string; desc: string }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="text-sm font-semibold text-gray-800 mb-0.5">{label}</div>
      <a href={`mailto:${email}`} className="text-sm text-blue-600 hover:underline font-medium">{email}</a>
      <p className="text-xs text-gray-500 mt-1.5">{desc}</p>
    </div>
  );
}
