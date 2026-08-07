import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield, Menu, X, Search, ChevronRight, BookOpen, User, Building2,
  Lock, HelpCircle, Check, AlertTriangle, Info, Share2, QrCode,
  Upload, Eye, Bell, Key, FileText, ArrowRight, ExternalLink, Copy, CheckCheck,
} from 'lucide-react';

// ── Nav structure ─────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: BookOpen,
    items: ['What is MyHealthStatus?', 'How it works', 'Key features'],
  },
  {
    id: 'patients',
    label: 'For Patients',
    icon: User,
    items: ['Creating your account', 'Your Member ID', 'Receiving results', 'Sharing results', 'Managing privacy'],
  },
  {
    id: 'providers',
    label: 'For Healthcare Providers',
    icon: Building2,
    items: ['Provider portal', 'Uploading results', 'Searching patients', 'Activity logs'],
  },
  {
    id: 'security',
    label: 'Security & Privacy',
    icon: Lock,
    items: ['Data protection', 'Your privacy', 'Security features', 'Compliance'],
  },
  {
    id: 'faqs',
    label: 'FAQs',
    icon: HelpCircle,
    items: ['Account', 'Results & sharing', 'Security'],
  },
];

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const location = useLocation();

  // Scroll to hash on first load (e.g. /docs#security)
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'auto', block: 'start' });
        setActiveSection(hash);
      }, 80);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track which section is in view
  useEffect(() => {
    const ids = NAV_SECTIONS.map(s => s.id);
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
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
    setSidebarOpen(false);
  }

  const filteredSections = query.trim()
    ? NAV_SECTIONS.filter(
        s =>
          s.label.toLowerCase().includes(query.toLowerCase()) ||
          s.items.some(i => i.toLowerCase().includes(query.toLowerCase())),
      )
    : NAV_SECTIONS;

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield size={14} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900 leading-none">MyHealthStatus</div>
          <div className="text-xs text-gray-400 mt-0.5">Documentation</div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search docs…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-7 pr-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {filteredSections.map(section => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <div key={section.id} className="mb-1">
              <button
                onClick={() => scrollTo(section.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  size={14}
                  className={isActive ? 'text-blue-600' : 'text-gray-400'}
                />
                {section.label}
              </button>
              {isActive && (
                <div className="ml-3 mt-0.5 border-l-2 border-blue-100 pl-3 space-y-0.5">
                  {section.items.map(item => (
                    <button
                      key={item}
                      onClick={() => scrollTo(section.id)}
                      className="w-full text-left text-xs text-gray-500 hover:text-blue-600 py-1 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <p className="text-xs text-gray-400 px-3 py-4 text-center">No results for "{query}"</p>
        )}
      </nav>

      {/* Footer links */}
      <div className="border-t border-gray-100 px-4 py-3 space-y-1">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowRight size={11} /> Back to App
        </Link>
        <a href="mailto:support@myhealthstatus.org" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors">
          <ExternalLink size={11} /> Contact Support
        </a>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile top bar */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40 flex items-center justify-between px-4 h-13 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
            <Shield size={12} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">Docs</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:block">{NAV_SECTIONS.find(s => s.id === activeSection)?.label}</span>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-0 h-screen overflow-hidden border-r border-gray-200">
            <Sidebar />
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 shadow-xl">
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 min-w-0 px-6 lg:px-12 py-10 max-w-3xl">
          <SectionGettingStarted />
          <SectionPatients />
          <SectionProviders />
          <SectionSecurity />
          <SectionFAQs />
        </main>
      </div>
    </div>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function SectionWrapper({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-20 scroll-mt-6">
      {children}
    </section>
  );
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-8 pb-6 border-b border-gray-200">
      <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">{eyebrow}</div>
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{title}</h1>
      {subtitle && <p className="text-gray-500 text-base leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-gray-800 mt-6 mb-2">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 leading-relaxed mb-3">{children}</p>;
}

function Callout({ type = 'info', children }: { type?: 'info' | 'tip' | 'warning'; children: React.ReactNode }) {
  const styles = {
    info:    'bg-blue-50 border-blue-200 text-blue-800',
    tip:     'bg-teal-50 border-teal-200 text-teal-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  };
  const icons = {
    info:    <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />,
    tip:     <Check size={15} className="text-teal-600 flex-shrink-0 mt-0.5" />,
    warning: <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />,
  };
  return (
    <div className={`flex gap-3 border rounded-xl px-4 py-3.5 my-5 text-sm leading-relaxed ${styles[type]}`}>
      {icons[type]}
      <div>{children}</div>
    </div>
  );
}

function Steps({ items }: { items: { title: string; body?: string }[] }) {
  return (
    <ol className="space-y-4 my-5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-4">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {i + 1}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">{item.title}</div>
            {item.body && <div className="text-sm text-gray-500 mt-0.5 leading-relaxed">{item.body}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function FeatureGrid({ items }: { items: { icon: React.ReactNode; label: string; desc: string }[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3 my-5">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            {item.icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">{item.label}</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-gray-100 text-gray-800 text-xs font-mono px-2 py-0.5 rounded border border-gray-200">
      {children}
    </code>
  );
}

function ContactCard({ label, email }: { label: string; email: string }) {
  return (
    <div className="inline-flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 my-4">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
        <ExternalLink size={14} className="text-blue-600" />
      </div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <a href={`mailto:${email}`} className="text-sm font-medium text-blue-600 hover:underline">{email}</a>
      </div>
    </div>
  );
}

// ── Section: Getting Started ──────────────────────────────────────────────────
function SectionGettingStarted() {
  return (
    <SectionWrapper id="getting-started">
      <SectionTitle
        eyebrow="Getting Started"
        title="Welcome to MyHealthStatus"
        subtitle="A secure, HIPAA-compliant platform for sharing verified STD/STI test results — privately, on your terms."
      />

      <H2>What is MyHealthStatus?</H2>
      <P>
        MyHealthStatus is a privacy-first platform that bridges the gap between testing clinics and patients.
        Verified results are delivered securely to your personal dashboard, where you choose exactly how and
        with whom you share them — no more awkward conversations, no paper printouts, no uncertainty.
      </P>
      <P>
        Every result on our platform carries a cryptographic watermark, ensuring authenticity and preventing
        tampering. You're always in control.
      </P>

      <Callout type="info">
        MyHealthStatus is HIPAA-aligned and built on enterprise-grade infrastructure. Your health information
        is encrypted end-to-end and never sold or shared without your explicit consent.
      </Callout>

      <H2>How it works</H2>
      <Steps
        items={[
          { title: 'Create your account', body: 'Sign up with your email and receive a unique Member ID (format: MH-XXXXXX).' },
          { title: 'Provide your Member ID to your clinic', body: 'Give your Member ID to your testing clinic at the time of your visit.' },
          { title: 'Your clinic uploads your results', body: 'Once results are ready, the clinic uploads them to your account securely.' },
          { title: 'Share on your terms', body: 'Share via QR code or a secure link — with optional expiration and access codes.' },
        ]}
      />

      <H2>Key features</H2>
      <FeatureGrid
        items={[
          { icon: <Lock size={15} className="text-blue-600" />, label: 'Secure storage', desc: 'AES-256 encrypted at rest, TLS 1.3 in transit.' },
          { icon: <FileText size={15} className="text-blue-600" />, label: 'Tamper-proof results', desc: 'Watermarked documents that verify authenticity.' },
          { icon: <QrCode size={15} className="text-blue-600" />, label: 'QR code sharing', desc: 'Instant sharing in person or digitally.' },
          { icon: <Eye size={15} className="text-blue-600" />, label: 'Full privacy control', desc: 'You decide who sees your results and for how long.' },
          { icon: <Bell size={15} className="text-blue-600" />, label: 'Instant notifications', desc: 'Alerted the moment new results are uploaded.' },
          { icon: <Shield size={15} className="text-blue-600" />, label: 'HIPAA-compliant', desc: 'Built to meet healthcare privacy standards.' },
        ]}
      />
    </SectionWrapper>
  );
}

// ── Section: Patients ─────────────────────────────────────────────────────────
function SectionPatients() {
  return (
    <SectionWrapper id="patients">
      <SectionTitle
        eyebrow="For Patients"
        title="Patient Guide"
        subtitle="Everything you need to manage, receive, and share your test results."
      />

      <H2>Creating your account</H2>
      <Steps
        items={[
          { title: 'Visit the homepage and click "Sign Up"', body: 'Enter your email address and choose a strong password.' },
          { title: 'Verify your email address', body: 'Check your inbox for a verification link and click it to confirm.' },
          { title: 'Receive your unique Member ID', body: 'After verification, your Member ID (MH-XXXXXX format) appears in your dashboard.' },
        ]}
      />
      <Callout type="tip">
        Your Member ID is generated automatically and cannot be changed. Write it down or screenshot it —
        you'll need to give it to your testing clinic.
      </Callout>

      <H2>Your Member ID</H2>
      <P>
        Your Member ID is the cornerstone of the platform. It looks like this:
      </P>
      <div className="flex items-center gap-3 bg-gray-900 rounded-xl px-5 py-4 my-5">
        <Key size={16} className="text-blue-400" />
        <span className="font-mono text-lg font-bold text-white tracking-widest">MH-A3F9K2</span>
        <span className="text-gray-500 text-xs ml-2">example</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 my-4">
        {[
          ['Unique to you', 'No two accounts share the same ID.'],
          ['Clinic-facing', 'Give it to clinics, not partners — share results, not your ID.'],
          ['Permanent', 'It never changes and is tied to your account forever.'],
          ['Safe to share with clinics', 'Clinics need it to associate your results with your account.'],
        ].map(([title, desc]) => (
          <div key={title} className="flex items-start gap-2 p-3.5 bg-white border border-gray-200 rounded-xl">
            <Check size={14} className="text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-gray-800">{title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <H2>Receiving results</H2>
      <P>
        When your clinic uploads results linked to your Member ID, you receive an instant notification.
        Results appear immediately in your dashboard under "My Results."
      </P>
      <P>
        Each result entry shows the test date, facility name, test types performed, and a link to view
        or download the full document.
      </P>
      <Callout type="info">
        Results are never viewable by anyone else until you explicitly create a share. Your dashboard is
        private and accessible only with your credentials.
      </Callout>

      <H2>Sharing results</H2>
      <Steps
        items={[
          { title: 'Open a result from your dashboard' },
          { title: 'Click the "Share" button' },
          { title: 'Choose your sharing method', body: 'QR Code for in-person sharing, or Secure Link for digital delivery.' },
          { title: 'Set an optional expiration date', body: 'The share automatically deactivates after this date.' },
          { title: 'Add an optional access code', body: 'The recipient must enter this code before viewing.' },
          { title: 'Send or display the QR code / link' },
        ]}
      />

      <div className="grid sm:grid-cols-2 gap-4 my-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <QrCode size={16} className="text-blue-600" />
            <span className="font-semibold text-gray-800 text-sm">QR Code</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Best for in-person sharing. The recipient scans with any phone camera. No app required.
            Ideal for partner or provider check-ins.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Share2 size={16} className="text-blue-600" />
            <span className="font-semibold text-gray-800 text-sm">Secure Link</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Best for digital sharing over text or messaging apps. The link opens a watermarked view
            — no login required for the recipient.
          </p>
        </div>
      </div>

      <H2>Understanding watermarks</H2>
      <P>
        Every result shared through MyHealthStatus is rendered with a security watermark overlaid on
        the document. Watermarks:
      </P>
      <ul className="space-y-2 my-4 pl-1">
        {[
          'Confirm the result originates from MyHealthStatus',
          'Include a timestamp and verification code',
          'Cannot be removed without visibly corrupting the document',
          'Let recipients know the result is genuine and unaltered',
        ].map(text => (
          <li key={text} className="flex items-start gap-2 text-sm text-gray-600">
            <Check size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
            {text}
          </li>
        ))}
      </ul>

      <H2>Managing privacy</H2>
      <P>
        You have complete control over every share you create. From your "My Shares" dashboard you can:
      </P>
      <ul className="space-y-2 my-4 pl-1">
        {[
          'See every active share and when it expires',
          'Revoke any share instantly — the link stops working immediately',
          'View the access log showing when and from where your result was viewed',
          'Set or update expiration dates on existing shares',
        ].map(text => (
          <li key={text} className="flex items-start gap-2 text-sm text-gray-600">
            <ChevronRight size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
            {text}
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}

// ── Section: Providers ────────────────────────────────────────────────────────
function SectionProviders() {
  return (
    <SectionWrapper id="providers">
      <SectionTitle
        eyebrow="For Healthcare Providers"
        title="Provider Guide"
        subtitle="Integrate seamless, verified result delivery into your clinic workflow."
      />

      <H2>Provider portal access</H2>
      <P>
        Healthcare providers access a dedicated portal separate from the patient-facing app.
        The portal is available to licensed clinics and facilities that have completed the
        MyHealthStatus onboarding process.
      </P>
      <Callout type="tip">
        To set up a clinic account, contact our partnerships team. Onboarding typically takes
        5 business days and includes a dedicated technical walkthrough.
      </Callout>
      <ContactCard label="Partnership inquiries" email="partners@myhealthstatus.org" />

      <P>
        Each clinic receives a unique <InlineCode>Hospital Code</InlineCode> and a set of admin
        credentials. The admin can log in at the hospital dashboard and begin uploading results
        immediately.
      </P>

      <H2>Uploading results</H2>
      <Steps
        items={[
          { title: 'Log into the provider portal', body: 'Use your admin email and password at the hospital dashboard.' },
          { title: 'Click "Upload Results"', body: 'Navigate to the upload section from the main dashboard.' },
          { title: 'Enter the patient\'s Member ID', body: 'The patient provides this — format MH-XXXXXX. The system looks up and validates the account.' },
          { title: 'Upload the result document', body: 'Accepted format: PDF. Max size: 10MB. The document is encrypted at upload.' },
          { title: 'Enter test details', body: 'Fill in the test date, test types performed (HIV, Chlamydia, Gonorrhea, etc.), and your facility name.' },
          { title: 'Submit', body: 'The patient is notified instantly. The result appears in their dashboard.' },
        ]}
      />

      <Callout type="warning">
        Double-check the Member ID before submitting. Results uploaded to an incorrect Member ID
        cannot be automatically re-assigned. Contact support if a correction is needed.
      </Callout>

      <H2>Searching patients</H2>
      <P>
        The provider portal includes a patient search function. Enter a full Member ID to:
      </P>
      <ul className="space-y-2 my-4 pl-1">
        {[
          'View the patient\'s upload history (results uploaded by your facility only)',
          'Confirm a Member ID is valid before an appointment',
          'Track result delivery status',
        ].map(text => (
          <li key={text} className="flex items-start gap-2 text-sm text-gray-600">
            <ChevronRight size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
            {text}
          </li>
        ))}
      </ul>
      <Callout type="info">
        For privacy reasons, providers can only search by Member ID — not by name or email.
        Patient identity is controlled entirely by the patient.
      </Callout>

      <H2>Activity logs</H2>
      <P>
        All provider actions are logged automatically in a HIPAA-compliant audit trail. The activity
        log records:
      </P>
      <div className="grid sm:grid-cols-2 gap-3 my-4">
        {[
          ['Result uploads', 'Date, time, patient Member ID, and uploader.'],
          ['Patient lookups', 'Every Member ID searched and when.'],
          ['Login events', 'Successful and failed authentication attempts.'],
          ['Admin changes', 'Any credential or settings modifications.'],
        ].map(([title, desc]) => (
          <div key={title} className="p-3.5 bg-white border border-gray-200 rounded-xl">
            <div className="text-sm font-semibold text-gray-800">{title}</div>
            <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
          </div>
        ))}
      </div>
      <P>
        Activity logs are exportable as CSV from the provider dashboard. Records are retained for a
        minimum of 6 years per HIPAA requirements.
      </P>
    </SectionWrapper>
  );
}

// ── Section: Security ─────────────────────────────────────────────────────────
function SectionSecurity() {
  return (
    <SectionWrapper id="security">
      <SectionTitle
        eyebrow="Security & Privacy"
        title="Security & Privacy"
        subtitle="How we protect your most sensitive health information."
      />

      <AuditLinkBanner />

      <H2>Data protection</H2>
      <div className="grid sm:grid-cols-3 gap-3 my-5">
        {[
          { label: 'AES-256', desc: 'Encryption at rest' },
          { label: 'TLS 1.3', desc: 'Encryption in transit' },
          { label: 'HIPAA', desc: 'Aligned infrastructure' },
        ].map(({ label, desc }) => (
          <div key={label} className="text-center bg-white border border-gray-200 rounded-xl py-5 px-3">
            <div className="text-2xl font-bold text-blue-600 mb-1">{label}</div>
            <div className="text-xs text-gray-500">{desc}</div>
          </div>
        ))}
      </div>
      <P>
        All result files are encrypted before being written to disk using AES-256. Data in transit
        is protected by TLS 1.3 — the same standard used by major financial institutions. Database
        access is restricted to application-layer service accounts with least-privilege permissions.
      </P>

      <H2>Your privacy</H2>
      <ul className="space-y-3 my-4">
        {[
          ['You own your data', 'Your health information belongs to you. We are a custodian, not an owner.'],
          ['No data selling', 'We never sell, rent, or monetize your personal health information.'],
          ['You control sharing', 'We cannot share your results — only you can create a share.'],
          ['Auto-expiry', 'Set expiration dates on shares so access automatically ends.'],
          ['Account deletion', 'Request full account deletion and all associated data is purged within 30 days.'],
        ].map(([title, desc]) => (
          <li key={title} className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
            <Check size={15} className="text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-gray-800">{title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
            </div>
          </li>
        ))}
      </ul>

      <H2>Security features</H2>
      <FeatureGrid
        items={[
          { icon: <FileText size={15} className="text-blue-600" />, label: 'Watermarked results', desc: 'Tamper-evident overlays on all shared documents.' },
          { icon: <Eye size={15} className="text-blue-600" />, label: 'Access logging', desc: 'See every view event for your shared results.' },
          { icon: <Key size={15} className="text-blue-600" />, label: 'Access codes', desc: 'Require a PIN before a share can be viewed.' },
          { icon: <Shield size={15} className="text-blue-600" />, label: 'Two-factor auth', desc: 'Optional TOTP-based MFA on your account.' },
          { icon: <Bell size={15} className="text-blue-600" />, label: 'Login alerts', desc: 'Email notification on any new device login.' },
          { icon: <Lock size={15} className="text-blue-600" />, label: 'Revocable links', desc: 'Instantly invalidate any share at any time.' },
        ]}
      />

      <H2>Compliance</H2>
      <P>
        MyHealthStatus is designed to align with HIPAA Security and Privacy Rules, covering
        administrative, physical, and technical safeguards required for electronic protected
        health information (ePHI).
      </P>
      <div className="space-y-2 my-4">
        {[
          'HIPAA-aligned security controls for ePHI',
          'SOC 2-certified cloud infrastructure (Firebase / Google Cloud)',
          'Regular internal security reviews',
          'Independent penetration testing',
          'Business Associate Agreements (BAA) available for provider partners',
        ].map(text => (
          <div key={text} className="flex items-center gap-2.5 text-sm text-gray-600">
            <Check size={13} className="text-blue-500 flex-shrink-0" />
            {text}
          </div>
        ))}
      </div>

      <Callout type="warning">
        Found a security vulnerability? Please do not open a public issue. Report it privately.
      </Callout>
      <ContactCard label="Security disclosures" email="security@myhealthstatus.org" />
    </SectionWrapper>
  );
}

// ── Audit Link Banner ─────────────────────────────────────────────────────────
const AUDIT_URL = 'https://myhealthstatus.netlify.app/docs#security';

function AuditLinkBanner() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(AUDIT_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden my-6">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Shield size={14} className="text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Security Audit Package</span>
        </div>
        <p className="text-white font-semibold text-base mb-1">Share this link with security partners</p>
        <p className="text-gray-400 text-xs leading-relaxed">
          Submit this URL to third-party auditors, penetration testers, or compliance reviewers.
          It links directly to our Security &amp; Privacy documentation section.
        </p>
      </div>

      <div className="mx-5 mb-5 flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
        <span className="flex-1 font-mono text-sm text-green-400 truncate select-all">{AUDIT_URL}</span>
        <button
          onClick={copy}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
          }`}
        >
          {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="border-t border-gray-800 px-5 py-3 flex flex-wrap gap-4">
        {[
          'Security controls overview',
          'HIPAA alignment details',
          'Compliance certifications',
          'Vulnerability reporting',
        ].map(label => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <Check size={11} className="text-blue-500" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Section: FAQs ─────────────────────────────────────────────────────────────
function SectionFAQs() {
  const faqs: { q: string; a: React.ReactNode }[] = [
    {
      q: 'How do I create an account?',
      a: 'Click "Sign Up" on the homepage, enter your email and a password, verify your email, and your account plus Member ID will be ready in under a minute.',
    },
    {
      q: 'What is my Member ID?',
      a: <>A permanent, unique identifier in the format <InlineCode>MH-XXXXXX</InlineCode> assigned to your account. Provide it to your testing clinic — they use it to upload your results.</>,
    },
    {
      q: 'How do I share my results?',
      a: 'Open a result from your dashboard, click "Share," choose QR Code or Secure Link, set optional expiry and access code, then send or display it.',
    },
    {
      q: 'Is my data secure?',
      a: 'Yes. We use AES-256 encryption at rest, TLS 1.3 in transit, and HIPAA-aligned infrastructure. Your data is never sold or shared without your consent.',
    },
    {
      q: 'Who can see my results?',
      a: 'Only you — until you explicitly create a share. Even then, only the person with the link (and access code, if set) can view the result.',
    },
    {
      q: 'How long are results stored?',
      a: 'Results are stored securely for as long as your account is active. You can delete individual results or your entire account at any time.',
    },
    {
      q: 'Can I revoke a shared link?',
      a: 'Yes. Go to "My Shares" in your dashboard, find the share, and click "Revoke." The link stops working instantly.',
    },
    {
      q: 'What if I forget my password?',
      a: 'Click "Forgot Password" on the login screen and enter your email. You\'ll receive a reset link within a few minutes.',
    },
    {
      q: 'How do watermarks work?',
      a: 'A security overlay is rendered on top of your result document when it\'s viewed or downloaded through a share. It includes a verification code and timestamp, making tampering immediately visible.',
    },
    {
      q: 'Is MyHealthStatus HIPAA compliant?',
      a: 'We follow HIPAA security and privacy standards and operate on SOC 2-certified infrastructure. Provider partners can request a Business Associate Agreement (BAA).',
    },
    {
      q: 'What file types does the clinic upload?',
      a: <>Clinics upload result documents as <InlineCode>PDF</InlineCode> files. The platform handles secure storage, encryption, and watermarking automatically.</>,
    },
    {
      q: 'I\'m a clinic. How do I get set up?',
      a: <>Contact our partnerships team at <a href="mailto:partners@myhealthstatus.org" className="text-blue-600 underline">partners@myhealthstatus.org</a>. Onboarding typically takes 5 business days.</>,
    },
  ];

  return (
    <SectionWrapper id="faqs">
      <SectionTitle
        eyebrow="FAQs"
        title="Frequently Asked Questions"
        subtitle="Quick answers to the most common questions."
      />

      <div className="space-y-3">
        {faqs.map(({ q, a }) => (
          <FAQItem key={q} question={q} answer={a} />
        ))}
      </div>

      <div className="mt-12 bg-blue-600 rounded-2xl p-7 text-center">
        <p className="text-white font-bold text-lg mb-1">Still have questions?</p>
        <p className="text-blue-100 text-sm mb-5">
          Our support team is available via email and typically responds within one business day.
        </p>
        <a
          href="mailto:support@myhealthstatus.org"
          className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
        >
          <ExternalLink size={14} />
          Contact Support
        </a>
      </div>
    </SectionWrapper>
  );
}

function FAQItem({ question, answer }: { question: string; answer: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-800">{question}</span>
        <ChevronRight
          size={15}
          className={`text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
          {answer}
        </div>
      )}
    </div>
  );
}
