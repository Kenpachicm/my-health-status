import { Shield, Lock, Eye, Key, CheckCircle, AlertCircle, Download, Mail, ExternalLink, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SecurityCompliancePage() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const securityPractices = [
    {
      title: 'Data Encryption',
      content: 'All sensitive data is encrypted both at rest and in transit using industry-standard encryption protocols. We use AES-256 encryption for data at rest and TLS 1.3 for data in transit.'
    },
    {
      title: 'Access Management',
      content: 'We enforce strict access controls including multi-factor authentication, role-based access, and regular access reviews. Only authorized personnel can access systems containing protected health information.'
    },
    {
      title: 'Network Security',
      content: 'Our infrastructure includes firewalls, intrusion detection systems, and regular vulnerability scanning. We maintain separate development and production environments.'
    },
    {
      title: 'Audit Logging',
      content: 'All access to protected health information is logged and retained for 7 years. Logs are protected from unauthorized modification and regularly reviewed for suspicious activity.'
    },
    {
      title: 'Incident Response',
      content: 'We maintain a documented incident response plan with defined roles, escalation paths, and regular testing. All incidents are logged, investigated, and used for continuous improvement.'
    },
    {
      title: 'Vendor Management',
      content: 'All third-party vendors handling PHI are vetted through our security due diligence process and required to sign Business Associate Agreements.'
    },
    {
      title: 'Workforce Training',
      content: 'All team members complete security awareness training upon hire and annually thereafter. Training is role-based and documented.'
    },
    {
      title: 'Disaster Recovery',
      content: 'We maintain regular backups, test recovery procedures, and have documented disaster recovery plans to ensure business continuity.'
    }
  ];

  const retentionData = [
    { dataType: 'Test Results', retention: 'Until user deletion', purpose: 'User access and sharing' },
    { dataType: 'Deleted Results', retention: '30 days', purpose: 'Recovery period' },
    { dataType: 'Access Logs', retention: '7 years', purpose: 'HIPAA compliance' },
    { dataType: 'Audit Logs', retention: '7 years', purpose: 'Security and compliance' },
    { dataType: 'Account Data', retention: '30 days after deletion request', purpose: 'Grace period' },
    { dataType: 'Share Data', retention: 'Tied to share expiration + 90 days', purpose: 'Audit purposes' }
  ];

  const securityUpdates = [
    {
      month: 'December 2025',
      updates: [
        'Enhanced session management with auto-logout',
        'Improved suspicious activity detection',
        'Updated security notification system'
      ]
    },
    {
      month: 'November 2025',
      updates: [
        'SOC 2 alignment completed',
        'Annual HIPAA security risk assessment',
        'Vendor security reviews updated'
      ]
    },
    {
      month: 'October 2025',
      updates: [
        'Multi-factor authentication made mandatory',
        'Enhanced encryption protocols (TLS 1.3)',
        'Security awareness training refresh'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MyHealthStatus</span>
            </Link>
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-gradient-to-b from-blue-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Security & Compliance
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Your trust is our foundation. Here's how we protect your health information.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <Lock className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-sm font-semibold text-gray-900">HIPAA Compliant</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-sm font-semibold text-gray-900">SOC 2 Type I Ready</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <Key className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <div className="text-sm font-semibold text-gray-900">256-bit Encryption</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <CheckCircle className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                <div className="text-sm font-semibold text-gray-900">Annual Security Audits</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Our Security Commitment
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Industry-Leading Encryption
                </h3>
                <p className="text-gray-600 mb-4">
                  All data encrypted at rest with AES-256 and in transit with TLS 1.3
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Zero-knowledge architecture</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Encrypted file storage</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Secure key management</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Key className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Strict Access Controls
                </h3>
                <p className="text-gray-600 mb-4">
                  Multi-layered security ensures only authorized access
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Multi-factor authentication required</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Role-based access controls</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Regular access reviews</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Session management</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  24/7 Security Monitoring
                </h3>
                <p className="text-gray-600 mb-4">
                  Real-time threat detection and incident response
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Automated threat detection</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Comprehensive audit logging</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Incident response team</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Regular security assessments</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Compliance & Certifications
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-8 border-2 border-green-200 shadow-lg">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">HIPAA Compliant</h3>
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                      Fully Compliant
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  We meet all requirements of the Health Insurance Portability and Accountability Act
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Business Associate Agreements with all vendors</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Regular security risk assessments</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Workforce training and awareness</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Comprehensive policies and procedures</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">7-year audit log retention</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Last Assessment: <strong>November 2025</strong></p>
                  <a href="#hipaa-notice" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center">
                    View HIPAA Notice <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 border-2 border-blue-200 shadow-lg">
                <div className="flex items-center mb-4">
                  <Shield className="w-12 h-12 text-blue-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">SOC 2 Type I Ready</h3>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                      Audit-Ready
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  Our security controls align with SOC 2 Trust Services Criteria
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Documented security policies</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Risk assessment and management</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Change management processes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Vendor risk management</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Evidence-based controls</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Target Audit: <strong>Q1 2026</strong></p>
                  <a href="https://www.aicpa.org/soc" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center">
                    Learn About SOC 2 <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              How We Protect Your Data
            </h2>

            <div className="space-y-4">
              {securityPractices.map((practice, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition"
                  >
                    <span className="font-semibold text-gray-900 text-left">{practice.title}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        openAccordion === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openAccordion === index && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{practice.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Data Retention Policy
            </h2>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Data Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Retention Period</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {retentionData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.dataType}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{row.retention}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{row.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Rights</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Right to access your data</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Right to delete your data</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Right to export your data</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Right to correct your data</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Recent Security Updates
            </h2>

            <div className="space-y-8">
              {securityUpdates.map((update, index) => (
                <div key={index} className="relative pl-8 border-l-2 border-blue-200">
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-600"></div>
                  <div className="mb-1 text-sm font-semibold text-blue-600">{update.month}</div>
                  <ul className="space-y-2">
                    {update.updates.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
                View All Updates <ExternalLink className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Security Questions or Concerns?
            </h2>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
              <div className="flex items-start mb-6">
                <Mail className="w-8 h-8 text-blue-600 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Our security team is here to help</h3>
                  <p className="text-gray-600 mb-4">
                    We take security seriously and are committed to protecting your information.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-32">Email:</span>
                      <a href="mailto:security@myhealthstatus.org" className="text-blue-600 hover:text-blue-700 font-medium">
                        security@myhealthstatus.org
                      </a>
                    </div>
                    <div className="flex items-start">
                      <span className="text-sm font-medium text-gray-700 w-32">Response Time:</span>
                      <span className="text-sm text-gray-600">Within 24 hours for general inquiries, immediate for critical issues</span>
                    </div>
                  </div>
                </div>
              </div>
              <Link
                to="/profile?tab=security-incident"
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition text-center inline-block"
              >
                <AlertCircle className="w-5 h-5 inline-block mr-2" />
                Report a Security Issue
              </Link>
            </div>

            <div className="bg-orange-50 rounded-xl p-8 border border-orange-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Responsible Disclosure Policy</h3>
              <p className="text-gray-700 mb-4">
                If you discover a security vulnerability, please report it to{' '}
                <a href="mailto:security@myhealthstatus.org" className="text-blue-600 hover:text-blue-700 font-medium">
                  security@myhealthstatus.org
                </a>
              </p>
              <p className="text-gray-600 text-sm">
                We appreciate responsible disclosure and will work with you to address issues promptly and fairly.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Transparency & Trust
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
                <Download className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">2025 Security Report</h3>
                <p className="text-sm text-gray-600 mb-3">Coming Soon</p>
                <button disabled className="text-sm text-gray-400 cursor-not-allowed">
                  Download Report
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
                <Download className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Data Request Statistics</h3>
                <p className="text-sm text-gray-600 mb-3">Annual Report</p>
                <button disabled className="text-sm text-gray-400 cursor-not-allowed">
                  Download Report
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
                <Download className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Incident Response Summary</h3>
                <p className="text-sm text-gray-600 mb-3">2025 Report</p>
                <button disabled className="text-sm text-gray-400 cursor-not-allowed">
                  Download Report
                </button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-8 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Our Commitment to You</h3>
              <p className="text-gray-700 text-center mb-6">We believe in transparency. We will never:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Sell your data</span>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Share your data without your consent</span>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Access your data without authorization</span>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Compromise on security for convenience</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-lg font-bold mb-6 text-center">Related Documents</h3>
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <Link to="/privacy" className="text-gray-300 hover:text-white transition">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-300 hover:text-white transition">Terms of Service</Link>
              <a href="#hipaa-notice" className="text-gray-300 hover:text-white transition">HIPAA Notice</a>
              <Link to="/cookies" className="text-gray-300 hover:text-white transition">Cookie Policy</Link>
              <a href="#dpa" className="text-gray-300 hover:text-white transition">Data Processing Agreement</a>
            </div>
            <p className="text-center text-gray-400 text-sm">
              Last Updated: December 2025
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
