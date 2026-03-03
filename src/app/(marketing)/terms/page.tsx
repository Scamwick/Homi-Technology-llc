import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | HōMI',
  description: 'Terms of Service for HōMI - Decision Readiness Intelligence Platform',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-0 py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-text-3 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Service Description</h2>
            <p className="text-text-2 mb-4">
              HōMI is a decision readiness assessment platform that evaluates user preparedness 
              across three dimensions: Financial Reality, Emotional Truth, and Perfect Timing. 
              Our platform provides informational assessments and recommendations, not professional 
              financial, legal, or investment advice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Not Financial Advice</h2>
            <p className="text-text-2 mb-4">
              <strong>IMPORTANT:</strong> HōMI is NOT a financial advisor, investment advisor, 
              mortgage broker, real estate agent, or legal professional. The assessments, reports, 
              and recommendations provided by HōMI are for informational purposes only and should 
              not be construed as professional advice.
            </p>
            <p className="text-text-2 mb-4">
              Always consult with qualified licensed professionals (financial advisors, attorneys, 
              tax professionals, mortgage brokers) before making significant financial decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Responsibilities</h2>
            <p className="text-text-2 mb-4">
              To use HōMI, you must create an account with accurate and complete information. 
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-text-2 mb-4 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate information in assessments</li>
              <li>Not sharing your account with others</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Subscription Terms</h2>
            <p className="text-text-2 mb-4">
              HōMI offers both free and paid subscription plans. By subscribing to a paid plan:
            </p>
            <ul className="list-disc list-inside text-text-2 mb-4 space-y-2">
              <li>You agree to pay all fees associated with your selected plan</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>You may cancel at any time; cancellation takes effect at the end of the current billing period</li>
              <li>We offer pro-rated refunds within 7 days of purchase if you are not satisfied</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
            <p className="text-text-2 mb-4">
              All content, features, and functionality of HōMI, including but not limited to the 
              HōMI name, logo, Threshold Compass visualization, scoring methodology, and assessment 
              questions, are the exclusive property of HOMI TECHNOLOGIES LLC and are protected by 
              copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="text-text-2 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, HOMI TECHNOLOGIES LLC SHALL NOT BE LIABLE 
              FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING 
              WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, 
              RESULTING FROM:
            </p>
            <ul className="list-disc list-inside text-text-2 mb-4 space-y-2">
              <li>Your use or inability to use the service</li>
              <li>Any decisions made based on HōMI assessments or recommendations</li>
              <li>Any unauthorized access to or use of our servers and/or personal information</li>
              <li>Any interruption or cessation of transmission to or from our service</li>
            </ul>
            <p className="text-text-2 mb-4">
              <strong>You acknowledge that all decisions are your own responsibility.</strong> HōMI 
              provides tools for self-assessment, but the ultimate decision to act (or not act) is 
              solely yours.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p className="text-text-2 mb-4">
              We retain your data while your account is active. If you delete your account, we 
              maintain a 30-day grace period during which you can recover your account. After 
              30 days, all personal data is permanently deleted from our systems.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
            <p className="text-text-2 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the 
              State of Florida, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p className="text-text-2 mb-4">
              For questions about these Terms, please contact us at:
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
