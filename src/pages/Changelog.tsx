import { Shield, Zap, Building2, Share2, Rocket, ChevronRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Release {
  version: string;
  date: string;
  tag: string;
  tagColor: string;
  tagIcon: React.ReactNode;
  changes: string[];
}

const releases: Release[] = [
  {
    version: '1.4.0',
    date: 'May 2026',
    tag: 'Security & Compliance',
    tagColor: 'bg-red-50 text-red-700 border border-red-200',
    tagIcon: <Shield size={13} />,
    changes: [
      'Added comprehensive security documentation',
      'Implemented automated security scanning (Dependabot, CodeQL)',
      'Published system status page',
      'Added security.txt for responsible disclosure',
      'Completed third-party penetration testing',
    ],
  },
  {
    version: '1.3.0',
    date: 'April 2026',
    tag: 'Provider Features',
    tagColor: 'bg-green-50 text-green-700 border border-green-200',
    tagIcon: <Building2 size={13} />,
    changes: [
      'Launched Healthcare Provider Dashboard',
      'Added patient result upload functionality',
      'Implemented provider activity logging',
      'Added Member ID patient search',
      'Created provider authentication system',
    ],
  },
  {
    version: '1.2.0',
    date: 'November 2025',
    tag: 'Security Enhancement',
    tagColor: 'bg-orange-50 text-orange-700 border border-orange-200',
    tagIcon: <Shield size={13} />,
    changes: [
      'Implemented result watermarking system',
      'Added tamper-detection features',
      'Enhanced result verification',
      'Improved screenshot protection',
      'Added print watermarking',
    ],
  },
  {
    version: '1.1.0',
    date: 'October 2025',
    tag: 'Sharing Features',
    tagColor: 'bg-blue-50 text-blue-700 border border-blue-200',
    tagIcon: <Share2 size={13} />,
    changes: [
      'Added QR code sharing',
      'Implemented secure link sharing',
      'Added share expiration dates',
      'Implemented access codes for shares',
      'Added view tracking for shared results',
    ],
  },
  {
    version: '1.0.0',
    date: 'Launch 2025',
    tag: 'Initial Release',
    tagColor: 'bg-purple-50 text-purple-700 border border-purple-200',
    tagIcon: <Rocket size={13} />,
    changes: [
      'Secure user registration with Member ID',
      'Test result storage and viewing',
      'HIPAA-compliant infrastructure',
      'Encrypted data storage (AES-256)',
      'Row-level security implementation',
      'Email verification system',
    ],
  },
];

export default function Changelog() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top nav bar */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <img src="/my_health.png" alt="MyHealthStatus" className="w-8 h-8" />
            <span className="text-lg font-bold text-gray-900">MyHealthStatus</span>
          </Link>
          <nav className="flex items-center space-x-1 text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight size={14} className="mx-1 text-gray-300" />
            <span className="text-gray-900 font-medium">Changelog</span>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Page header */}
        <div className="mb-16">
          <div className="flex items-center space-x-2 mb-4">
            <Zap size={18} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Product Updates</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Changelog</h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Product updates and improvements to MyHealthStatus.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-100 hidden sm:block" />

          <div className="space-y-0">
            {releases.map((release, index) => (
              <article
                key={release.version}
                className={`relative sm:pl-10 ${index !== releases.length - 1 ? 'pb-14' : ''}`}
              >
                {/* Timeline dot */}
                <div className="absolute left-[-5px] top-2 w-[11px] h-[11px] rounded-full bg-white border-2 border-gray-300 hidden sm:block" />

                {/* Version + date row */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-gray-900 tabular-nums">v{release.version}</span>
                  <span className="text-sm text-gray-400 font-medium">{release.date}</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${release.tagColor}`}
                  >
                    {release.tagIcon}
                    {release.tag}
                  </span>
                </div>

                {/* Changes card */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 hover:border-gray-200 transition-colors">
                  <ul className="space-y-3">
                    {release.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                        <span className="text-sm leading-relaxed">{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-16 pt-10 border-t border-gray-100">
          <div className="flex items-start gap-4 p-6 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Mail size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                We continuously improve MyHealthStatus. For feature requests or to report issues, contact{' '}
                <a
                  href="mailto:support@myhealthstatus.org"
                  className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  support@myhealthstatus.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">&copy; 2025 MyHealthStatus. All rights reserved.</p>
          <div className="flex items-center space-x-5 text-sm text-gray-400">
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link to="/security" className="hover:text-blue-600 transition-colors">Security</Link>
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
