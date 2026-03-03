import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Financial Disclaimer | HōMI',
  description: 'Financial Disclaimer for HōMI - Decision Readiness Intelligence Platform',
}

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-surface-0 py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Financial Disclaimer</h1>
        <p className="text-text-3 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-brand p-6 mb-8">
              <h2 className="text-xl font-semibold text-brand-yellow mb-2">Important Notice</h2>
              <p className="text-text-2">
                Please read this disclaimer carefully before using the HōMI platform. By using our 
                service, you acknowledge and agree to the terms outlined below.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Not a Financial Advisor</h2>
            <p className="text-text-2 mb-4">
              <strong>HōMI is NOT a financial advisor, investment advisor, mortgage broker, real 
              estate agent, tax professional, or legal advisor.</strong> We do not provide financial, 
              investment, legal, or tax advice.
            </p>
            <p className="text-text-2 mb-4">
              The information, assessments, reports, and recommendations provided through the HōMI 
              platform are for <strong>informational and educational purposes only</strong>. They 
              should not be construed as professional advice of any kind.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">No Recommendations to Act</h2>
            <p className="text-text-2 mb-4">
              A &quot;READY&quot; verdict from HōMI means that, based on the information you provided, 
              your scores across our three dimensions (Financial Reality, Emotional Truth, and Perfect 
              Timing) meet our internal thresholds for decision readiness.
            </p>
            <p className="text-text-2 mb-4">
              <strong>This does NOT constitute a recommendation to proceed with any financial 
              transaction, investment, or major life decision.</strong> A &quot;READY&quot; verdict 
              is not a guarantee of positive outcomes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Consult Licensed Professionals</h2>
            <p className="text-text-2 mb-4">
              Before making any significant financial decision, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-text-2 mb-4 space-y-2">
              <li>Purchasing a home or real estate</li>
              <li>Making investment decisions</li>
              <li>Changing careers or jobs</li>
              <li>Starting a business</li>
              <li>Making major purchases</li>
            </ul>
            <p className="text-text-2 mb-4">
              You should consult with qualified, licensed professionals, including:
            </p>
            <ul className="list-disc list-inside text-text-2 mb-4 space-y-2">
              <li>Certified Financial Planners (CFP)</li>
              <li>Registered Investment Advisors (RIA)</li>
              <li>Mortgage brokers and lenders</li>
              <li>Real estate agents and attorneys</li>
              <li>Tax professionals (CPA, EA)</li>
              <li>Legal counsel</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">No Liability for Decisions</h2>
            <p className="text-text-2 mb-4">
              HOMI TECHNOLOGIES LLC and its affiliates, officers, employees, and agents shall not 
              be liable for any losses, damages, or claims arising from:
            </p>
            <ul className="list-disc list-inside text-text-2 mb-4 space-y-2">
              <li>Decisions made based on HōMI assessments or recommendations</li>
              <li>Financial losses from transactions undertaken after receiving a &quot;READY&quot; verdict</li>
              <li>Opportunity costs from delaying decisions after receiving a &quot;NOT YET&quot; verdict</li>
              <li>Any outcomes related to the use of our platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">No Commissions or Product Sales</h2>
            <p className="text-text-2 mb-4">
              HōMI does not sell financial products, investments, real estate, insurance, or any 
              other goods or services related to the decisions we assess. We do not receive 
              commissions, referral fees, or any form of compensation from financial institutions, 
              real estate brokers, investment firms, or other third parties based on decisions you 
              make using our platform.
            </p>
            <p className="text-text-2 mb-4">
              Our revenue comes exclusively from:
            </p>
            <ul className="list-disc list-inside text-text-2 mb-4 space-y-2">
              <li>User subscription fees</li>
              <li>B2B partnership agreements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Assessments Are Self-Reported</h2>
            <p className="text-text-2 mb-4">
              HōMI assessments are based entirely on information you provide. The accuracy of our 
              verdicts depends on the accuracy and completeness of your responses. We do not verify 
              your financial information, credit scores, income, or other data you input.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Market and Economic Risks</h2>
            <p className="text-text-2 mb-4">
              Financial markets, real estate markets, interest rates, and economic conditions can 
              change rapidly and unpredictably. A &quot;READY&quot; verdict reflects your readiness 
              at a specific point in time based on current conditions and cannot predict future 
              market movements or economic changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Individual Circumstances Vary</h2>
            <p className="text-text-2 mb-4">
              Every individual&apos;s financial situation is unique. Factors not captured in our 
              assessments may significantly impact your readiness for any given decision. Our 
              three-dimensional model is a framework for self-reflection, not a comprehensive 
              financial analysis.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="text-text-2 mb-4">
              If you have questions about this disclaimer, please contact us:
            </p>
            <div className="bg-surface-1 border border-surface-3 rounded-brand p-6">
              <p className="text-text-2">
                <strong>Entity:</strong> HOMI TECHNOLOGIES LLC<br />
                <strong>EIN:</strong> 39-3779378<br />
                <strong>Email:</strong> info@xn--hmi-qxa.com
              </p>
            </div>
          </section>

          <section className="mb-8">
            <p className="text-text-3 text-sm">
              By using the HōMI platform, you acknowledge that you have read, understood, and agree 
              to this Financial Disclaimer. If you do not agree with any part of this disclaimer, 
              please discontinue use of our service immediately.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
