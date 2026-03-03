import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | HōMI',
  description: 'Privacy Policy for HōMI - Decision Readiness Intelligence Platform',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface-0 py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-text-3 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-text-2 mb-4">
              HOMI TECHNOLOGIES LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the HōMI platform. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-medium mb-3">Personal Information</h3>
            <p className="text-text-2 mb-4">
              We collect personal information that you voluntarily provide when using our service:
            </p>
            <ul className="list-disc list-inside text-text-2 mb-4 space-y-2">
              <li>Name and email address (for account creation)</li>
              <li>Profile information (avatar, preferences)</li>
              <li>Assessment responses and results</li>
              <li>Payment information (processed securely by Stripe)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Usage Data</h3>
            <p className="text-text-2 mb-4">
              We automatically collect certain information about your device and usage:
            </p>
            <ul className="list-disc list-inside text-text-2 mb-4 space-y-2">
              <li>IP address and browser type</li>
              <li>Device information</li>
              <li>Pages visited and features used</li>
              <li>Time spent on assessments</li>
              <li>Anonymous usage analytics (if you opt in)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-text-2 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-text-2 mb-4 space-y-2">
              <li>Provide and maintain our service</li>
              <li>Generate your personalized assessments and reports</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send you service-related notifications and updates</li>
              <li>Improve our platform and develop new features</li>
              <li>Respond to your inquiries and support requests</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
            <p className="text-text-2 mb-4">
              We do not sell your personal information. We may share information with:
            </p>
            <ul className="list-disc list-inside text-text-2 mb-4 space-y-2">
              <li>
                <strong>Stripe:</strong> For payment processing (your full payment information is 
                never stored on our servers)
              </li>
              <li>
                <strong>Anthropic:</strong> For AI advisor functionality (assessment data is 
                anonymized before being sent)
              </li>
              <li>
                <strong>Resend:</strong> For transactional email delivery
              </li>
              <li>
                <strong>B2B Partners:</strong> Only dimension scores and verdicts (NEVER raw 
                assessment responses)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-text-2 mb-4">
              We implement appropriate technical and organizational security measures to protect 
              your personal information:
            </p>
            <ul className="list-disc list-inside text-text-2 mb-4 space-y-2">
              <li>Encryption in transit (TLS/SSL) and at rest</li>
              <li>Row-Level Security (RLS) on all database tables</li>
              <li>Regular security audits and penetration testing</li>
              <li>Access controls and authentication requirements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
            <p className="text-text-2 mb-4">
              We retain your personal information:
            </p>
            <ul className="list-disc list-inside text-text-2 mb-4 space-y-2">
              <li>While your account is active: All data is retained</li>
              <li>After account deletion: 30-day grace period, then permanent deletion</li>
              <li>Anonymous analytics data: Retained indefinitely (cannot identify individuals)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights (GDPR/CCPA)</h2>
            <p className="text-text-2 mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-text-2 mb-4 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to certain processing of your data</li>
              <li><strong>Restriction:</strong> Request limitation of processing</li>
            </ul>
            <p className="text-text-2 mb-4">
              To exercise these rights, visit your Settings page or contact us at 
              info@xn--hmi-qxa.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
            <p className="text-text-2 mb-4">
              We use:
            </p>
            <ul className="list-disc list-inside text-text-2 mb-4 space-y-2">
              <li>
                <strong>Essential cookies:</strong> Required for authentication and session management 
                (cannot be disabled)
              </li>
              <li>
                <strong>Analytics cookies:</strong> Optional usage analytics via PostHog (can be 
                disabled in Settings)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Children&apos;s Privacy</h2>
            <p className="text-text-2 mb-4">
              HōMI is not intended for use by individuals under 18 years of age. We do not knowingly 
              collect personal information from children. If you believe we have collected information 
              from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-text-2 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new policy on this page and updating the &quot;Last updated&quot; date. 
              Significant changes will be communicated via email.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-text-2 mb-4">
              If you have questions about this Privacy Policy, please contact us:
            </p>
            <p className="text-text-2">
              <strong>Email:</strong> info@xn--hmi-qxa.com<br />
              <strong>Entity:</strong> HOMI TECHNOLOGIES LLC<br />
              <strong>EIN:</strong> 39-3779378
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
