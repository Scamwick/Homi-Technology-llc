import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Financial Disclaimer",
  description:
    "Financial disclaimers and legal disclosures for HōMI by HOMI TECHNOLOGIES LLC. HōMI is not a lender or financial advisor.",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-4 flex items-baseline gap-3 font-display text-xl font-bold text-text-primary sm:text-2xl">
        <span className="text-cyan">{number}.</span>
        {title}
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-text-secondary">
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-navy">
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-24">
        {/* Header */}
        <header className="mb-16">
          <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Financial Disclaimer &amp; Legal Disclosures
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            Effective Date: April 1, 2026 &middot; Last Updated: April 1, 2026
          </p>

          <div className="mt-6 flex gap-4 rounded-xl border border-homi-amber/30 bg-homi-amber/5 p-5">
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-homi-amber" />
            <div className="text-sm leading-relaxed text-text-secondary">
              <p className="font-semibold text-homi-amber">
                Important Notice
              </p>
              <p className="mt-1">
                HōMI is a Decision Readiness Intelligence&trade; tool designed
                for educational and informational purposes only. HOMI
                TECHNOLOGIES LLC is not a lender, financial advisor, broker,
                credit counselor, or fiduciary. Nothing on the HōMI platform
                constitutes financial, investment, tax, or legal advice.
              </p>
            </div>
          </div>
        </header>

        {/* Sections */}
        <div className="space-y-12">
          <Section id="not-a-lender" number={1} title="Not a Lender">
            <p>
              HOMI TECHNOLOGIES LLC does not make loans, offer credit, or
              underwrite any financial product. We do not originate, fund,
              service, or guarantee any mortgage, personal loan, auto loan, or
              other lending product.
            </p>
            <p>
              The HōMI platform does not connect users with lenders or serve as
              a loan marketplace. Any references to lending products,
              interest rates, or mortgage terms within the Service are for
              educational illustration only and do not represent an offer to
              lend or a guarantee of terms.
            </p>
            <p>
              Users seeking financing should contact licensed lenders,
              mortgage brokers, or financial institutions directly.
            </p>
          </Section>

          <Section
            id="not-financial-advice"
            number={2}
            title="Not Financial Advice"
          >
            <p>
              All content, assessments, scores, tools, simulations, AI coaching
              outputs, and recommendations provided by HōMI are for
              educational and informational purposes only. They are designed
              to help users better understand their financial readiness and
              decision-making patterns.
            </p>
            <p>
              <strong className="text-text-primary">
                HōMI does not provide:
              </strong>
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Financial planning or investment advice</li>
              <li>Tax advice or tax preparation services</li>
              <li>Legal advice or legal representation</li>
              <li>
                Credit repair or credit counseling services
              </li>
              <li>Insurance advice or brokerage</li>
              <li>
                Recommendations to purchase, sell, or hold any financial
                instrument
              </li>
            </ul>
            <p>
              The HōMI-Score and Decision Readiness verdicts reflect patterns
              in user-provided data and should be considered one input among
              many in your decision-making process &mdash; never the sole
              basis for any financial decision.
            </p>
          </Section>

          <Section
            id="estimates-accuracy"
            number={3}
            title="Estimates &amp; Accuracy"
          >
            <p>
              All calculations, projections, and estimates provided by the HōMI
              platform are approximations based on the information you provide
              and publicly available data. These include but are not limited to:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Mortgage payment estimates</li>
              <li>Debt-to-income ratio calculations</li>
              <li>Affordability analyses</li>
              <li>Savings projections</li>
              <li>Investment return simulations</li>
              <li>HōMI-Score readiness assessments</li>
            </ul>
            <p>
              Actual results will vary based on individual circumstances,
              market conditions, lender requirements, and factors not captured
              by the platform. We make no guarantee as to the accuracy,
              completeness, or timeliness of any information provided.
            </p>
            <p>
              Interest rates, property values, tax rates, insurance costs, and
              other financial variables used in our tools are estimates and may
              not reflect current market conditions or rates available to you.
            </p>
          </Section>

          <Section
            id="no-guarantee"
            number={4}
            title="No Guarantee of Loan Approval"
          >
            <p>
              A favorable HōMI-Score or &ldquo;Ready&rdquo; verdict does{" "}
              <strong className="text-text-primary">not</strong> guarantee
              that you will be approved for any loan, mortgage, or line of
              credit. Lending decisions are made by licensed financial
              institutions based on their own underwriting criteria, which may
              differ significantly from the factors assessed by HōMI.
            </p>
            <p>
              Conversely, an unfavorable HōMI-Score does not mean you will be
              denied credit. The HōMI-Score is not a credit score and is not
              used by lenders in their decision-making process.
            </p>
            <p>
              HOMI TECHNOLOGIES LLC bears no responsibility for any lending
              decisions made by third parties, regardless of whether the user
              utilized HōMI&apos;s tools in their preparation.
            </p>
          </Section>

          <Section
            id="fair-housing"
            number={5}
            title="Fair Housing Compliance"
          >
            <p>
              HOMI TECHNOLOGIES LLC is committed to the principles of fair
              housing and equal opportunity. Our platform does not discriminate
              on the basis of race, color, national origin, religion, sex,
              familial status, disability, or any other characteristic protected
              by federal, state, or local fair housing laws.
            </p>
            <p>
              The HōMI-Score algorithm evaluates financial readiness factors
              only and does not consider any protected characteristics in its
              calculations. Our AI coaching models are regularly audited for
              bias to ensure equitable treatment across all user demographics.
            </p>
            <p>
              If you believe you have experienced housing discrimination, you
              may file a complaint with the U.S. Department of Housing and
              Urban Development (HUD) at{" "}
              <span className="text-text-primary">1-800-669-9777</span> or
              online at{" "}
              <span className="text-text-primary">hud.gov</span>.
            </p>
          </Section>

          <Section
            id="respa"
            number={6}
            title="RESPA Compliance"
          >
            <p>
              HOMI TECHNOLOGIES LLC does not engage in activities regulated
              under the Real Estate Settlement Procedures Act (RESPA). We do
              not:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                Provide settlement services or act as a settlement agent
              </li>
              <li>
                Accept referral fees or kickbacks from settlement service
                providers
              </li>
              <li>
                Require the use of any specific title company, appraiser,
                attorney, or other settlement service provider
              </li>
              <li>
                Serve as a conduit for lead generation on behalf of lenders or
                real estate professionals
              </li>
            </ul>
            <p>
              Any educational content regarding real estate transactions,
              closing costs, or settlement procedures is provided for
              informational purposes only and does not constitute a referral
              or endorsement of any service provider.
            </p>
          </Section>

          <Section
            id="data-privacy"
            number={7}
            title="Data Privacy &amp; Third-Party Sales"
          >
            <p>
              HOMI TECHNOLOGIES LLC does not sell, rent, lease, or trade your
              personal financial data to any third party for any reason. This
              includes but is not limited to:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Lenders or mortgage companies</li>
              <li>Insurance companies</li>
              <li>Data brokers or aggregators</li>
              <li>Marketing companies or advertisers</li>
              <li>Real estate agents or brokerages</li>
              <li>Credit bureaus or credit reporting agencies</li>
            </ul>
            <p>
              Your financial information is used exclusively to power the
              HōMI platform&apos;s features and is protected by
              industry-standard security measures. For full details, see our{" "}
              <a href="/privacy" className="text-cyan hover:text-emerald">
                Privacy Policy
              </a>
              .
            </p>
          </Section>

          <Section
            id="state-variations"
            number={8}
            title="State &amp; Regional Variations"
          >
            <p>
              Financial calculations, tax estimates, insurance costs, and
              regulatory references within the HōMI platform are based on
              national averages and general guidelines. These may not reflect
              the specific laws, regulations, tax rates, or market conditions
              in your state, county, or municipality.
            </p>
            <p>
              In particular, users should be aware that the following vary
              significantly by location:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Property tax rates and assessment methods</li>
              <li>State income tax rates (or absence thereof)</li>
              <li>
                Homestead exemptions and property tax deductions
              </li>
              <li>Transfer taxes and recording fees</li>
              <li>Insurance requirements and costs</li>
              <li>Consumer protection laws and disclosures</li>
              <li>
                First-time homebuyer programs and assistance
              </li>
            </ul>
            <p>
              Users should consult local professionals and government agencies
              for location-specific information relevant to their decisions.
            </p>
          </Section>

          <Section
            id="monte-carlo"
            number={9}
            title="Monte Carlo Simulation Disclaimer"
          >
            <p>
              The HōMI platform offers Monte Carlo simulation tools that
              generate probabilistic projections based on historical data and
              statistical modeling. These simulations are subject to the
              following limitations:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-text-primary">
                  Historical performance does not guarantee future results.
                </strong>{" "}
                Past market returns, interest rates, and economic conditions
                used in simulations may not be indicative of future outcomes.
              </li>
              <li>
                <strong className="text-text-primary">
                  Simulations are probabilistic, not predictive.
                </strong>{" "}
                Results represent a range of possible outcomes based on
                statistical models, not certainties.
              </li>
              <li>
                <strong className="text-text-primary">
                  Model assumptions may not reflect reality.
                </strong>{" "}
                Simulations use simplified models that may not capture all
                relevant variables, black swan events, or structural changes
                in financial markets.
              </li>
              <li>
                <strong className="text-text-primary">
                  Input sensitivity:
                </strong>{" "}
                Small changes in input assumptions (inflation rate, return
                expectations, time horizon) can produce significantly different
                results.
              </li>
              <li>
                <strong className="text-text-primary">
                  Not a substitute for professional planning.
                </strong>{" "}
                Monte Carlo results should inform but not replace comprehensive
                financial planning with a qualified professional.
              </li>
            </ul>
            <p>
              The number of iterations, distribution assumptions, and
              confidence intervals used in HōMI&apos;s simulations are designed
              for educational clarity, not institutional-grade analysis.
            </p>
          </Section>

          <Section
            id="professional-review"
            number={10}
            title="Professional Review Recommended"
          >
            <p>
              HOMI TECHNOLOGIES LLC strongly recommends that all users consult
              with qualified, licensed professionals before making major
              financial decisions. These include but are not limited to:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-text-primary">
                  Certified Financial Planners (CFP):
                </strong>{" "}
                For comprehensive financial planning, investment strategy, and
                retirement planning
              </li>
              <li>
                <strong className="text-text-primary">
                  Mortgage Loan Officers:
                </strong>{" "}
                For specific mortgage rates, terms, pre-approval, and loan
                options
              </li>
              <li>
                <strong className="text-text-primary">
                  Certified Public Accountants (CPA):
                </strong>{" "}
                For tax planning, tax implications of financial decisions, and
                accounting matters
              </li>
              <li>
                <strong className="text-text-primary">
                  Licensed Real Estate Attorneys:
                </strong>{" "}
                For legal review of contracts, title matters, and real estate
                transactions
              </li>
              <li>
                <strong className="text-text-primary">
                  Licensed Insurance Agents:
                </strong>{" "}
                For appropriate insurance coverage, policy selection, and risk
                management
              </li>
              <li>
                <strong className="text-text-primary">
                  Credit Counselors (NFCC-certified):
                </strong>{" "}
                For debt management, credit improvement strategies, and
                financial hardship guidance
              </li>
            </ul>
            <p>
              HōMI is designed to complement, not replace, professional
              financial guidance. The Decision Readiness assessment can help
              you prepare informed questions and understand your financial
              position before engaging with professionals.
            </p>
          </Section>
        </div>

        {/* Contact */}
        <footer className="mt-16 rounded-xl border border-slate-dark/60 bg-navy-light/50 p-6">
          <h3 className="mb-3 font-display text-lg font-semibold text-text-primary">
            Questions About These Disclosures?
          </h3>
          <p className="text-sm leading-relaxed text-text-secondary">
            If you have questions about these financial disclaimers or need
            clarification on any of the disclosures above, please contact us:
          </p>
          <div className="mt-4 space-y-1 text-sm text-text-secondary">
            <p>
              <strong className="text-text-primary">
                HOMI TECHNOLOGIES LLC
              </strong>
            </p>
            <p>
              Email:{" "}
              <a
                href="mailto:legal@homitechnology.com"
                className="text-cyan hover:text-emerald"
              >
                legal@homitechnology.com
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
