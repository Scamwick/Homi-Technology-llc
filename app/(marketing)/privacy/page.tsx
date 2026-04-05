import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for HōMI — how we collect, use, and protect your data. HOMI TECHNOLOGIES LLC.",
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

function DataTable({
  rows,
}: {
  rows: { data: string; purpose: string }[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-dark/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-dark/60 bg-navy/40">
            <th className="px-4 py-3 text-left font-medium text-text-primary">
              Data
            </th>
            <th className="px-4 py-3 text-left font-medium text-text-primary">
              Purpose
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-slate-dark/30 last:border-b-0"
            >
              <td className="px-4 py-3 text-text-secondary">{row.data}</td>
              <td className="px-4 py-3 text-text-secondary">{row.purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-navy">
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-24">
        {/* Header */}
        <header className="mb-16">
          <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            Effective Date: April 1, 2026 &middot; Last Updated: April 1, 2026
          </p>
          <div className="mt-6 rounded-xl border border-slate-dark/60 bg-navy-light/50 p-4 text-sm text-text-secondary">
            HOMI TECHNOLOGIES LLC (&ldquo;HōMI,&rdquo; &ldquo;we,&rdquo;
            &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting
            your privacy. This Privacy Policy explains how we collect, use,
            share, and safeguard your personal information when you use our
            platform, applications, and services.
          </div>
        </header>

        {/* Sections */}
        <div className="space-y-12">
          <Section
            id="information-we-collect"
            number={1}
            title="Information We Collect"
          >
            <h3 className="font-semibold text-text-primary">
              Account Information
            </h3>
            <p>
              When you create an account, we collect your name, email address,
              and authentication credentials. If you subscribe to a paid plan,
              our payment processor (Stripe) collects your payment information
              directly. We do not store credit card numbers on our
              servers.
            </p>

            <h3 className="font-semibold text-text-primary">
              Assessment &amp; Financial Inputs
            </h3>
            <p>
              To generate your HōMI-Score, you may provide financial data such
              as income, debts, savings, credit information, and housing costs.
              If you opt into Plaid integration, we receive read-only financial
              account data (balances and transaction history) directly from your
              linked institutions.
            </p>

            <DataTable
              rows={[
                {
                  data: "Income & employment details",
                  purpose: "DTI calculation, readiness scoring",
                },
                {
                  data: "Debt balances & payment history",
                  purpose: "Liability analysis, score weighting",
                },
                {
                  data: "Savings & asset balances",
                  purpose: "Reserve ratio, emergency fund analysis",
                },
                {
                  data: "Credit score range (self-reported or Plaid)",
                  purpose: "Credit readiness factor",
                },
                {
                  data: "Housing costs & targets",
                  purpose: "Affordability modeling, mortgage estimates",
                },
              ]}
            />

            <h3 className="font-semibold text-text-primary">
              Usage &amp; Analytics Data
            </h3>
            <p>
              We automatically collect information about how you interact with
              the Service, including pages visited, features used, session
              duration, device type, operating system, browser type, and IP
              address. This data is used to improve the platform and diagnose
              technical issues.
            </p>

            <h3 className="font-semibold text-text-primary">
              Behavioral Genome Data
            </h3>
            <p>
              For Pro plan users, we analyze behavioral patterns across
              assessments to build a personalized behavioral genome: a
              model of your decision-making tendencies. This data is used
              exclusively to improve your AI coaching experience and is subject
              to automatic purge policies described in Section 5.
            </p>
          </Section>

          <Section
            id="how-we-use-data"
            number={2}
            title="How We Use Your Data"
          >
            <p>We use your information to:</p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-text-primary">
                  Provide the Service:
                </strong>{" "}
                Generate HōMI-Scores, run financial simulations, deliver AI
                coaching, and power the Agent platform
              </li>
              <li>
                <strong className="text-text-primary">
                  Improve the Platform:
                </strong>{" "}
                Analyze usage patterns, refine scoring algorithms, and train AI
                models using aggregated and anonymized data
              </li>
              <li>
                <strong className="text-text-primary">Communicate:</strong>{" "}
                Send account notifications, billing receipts, security alerts,
                and product updates (you can opt out of marketing emails at any
                time)
              </li>
              <li>
                <strong className="text-text-primary">
                  Ensure Security:
                </strong>{" "}
                Detect fraud, prevent abuse, and enforce our Terms of Service
              </li>
              <li>
                <strong className="text-text-primary">
                  Legal Compliance:
                </strong>{" "}
                Respond to legal requests and comply with applicable laws
              </li>
            </ul>
            <div className="rounded-xl border border-emerald/20 bg-emerald/5 p-4">
              <p className="font-semibold text-emerald">
                We NEVER sell your personal data to third parties.
              </p>
              <p className="mt-1 text-text-secondary">
                Your financial information, assessment results, and behavioral
                data are never sold, rented, or traded to advertisers, data
                brokers, or any third party.
              </p>
            </div>
          </Section>

          <Section
            id="data-sharing"
            number={3}
            title="Data Sharing &amp; Third-Party Services"
          >
            <p>
              We share data only with the following service providers, each of
              which is bound by contractual obligations to protect your data:
            </p>

            <DataTable
              rows={[
                {
                  data: "Supabase",
                  purpose:
                    "Database hosting, authentication, and real-time data storage. All data encrypted at rest.",
                },
                {
                  data: "Stripe",
                  purpose:
                    "Payment processing for subscriptions. PCI-DSS Level 1 compliant. We never see or store your full card number.",
                },
                {
                  data: "Plaid (opt-in only)",
                  purpose:
                    "Read-only bank account linking for automated financial data input. You must explicitly authorize each connection.",
                },
                {
                  data: "Vercel",
                  purpose:
                    "Application hosting and edge delivery. No user financial data is stored at the edge layer.",
                },
              ]}
            />

            <p>
              We may also share anonymized, aggregated data for research or
              statistical purposes. Such data cannot be used to identify any
              individual user.
            </p>
            <p>
              We will disclose personal information if required by law, court
              order, or governmental regulation, or if we believe in good faith
              that disclosure is necessary to protect our rights, your safety,
              or the safety of others.
            </p>
          </Section>

          <Section
            id="data-retention"
            number={4}
            title="Data Retention"
          >
            <p>We retain your data according to the following schedule:</p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-text-primary">Account Data:</strong>{" "}
                Retained for the duration of your account, plus 30 days after
                deletion to allow for account recovery
              </li>
              <li>
                <strong className="text-text-primary">
                  Assessment Results:
                </strong>{" "}
                Retained for the duration of your account. Historical scores are
                available for progress tracking
              </li>
              <li>
                <strong className="text-text-primary">
                  Behavioral Genome Data:
                </strong>{" "}
                Automatically purged after 90 days of account inactivity.
                Active users&apos; genome data is refreshed with each new
                assessment
              </li>
              <li>
                <strong className="text-text-primary">
                  Financial Inputs:
                </strong>{" "}
                Raw financial data submitted for assessments is retained for 90
                days, then anonymized and aggregated
              </li>
              <li>
                <strong className="text-text-primary">Usage Analytics:</strong>{" "}
                Retained in anonymized form for up to 24 months
              </li>
              <li>
                <strong className="text-text-primary">Billing Records:</strong>{" "}
                Retained for 7 years as required by tax and accounting
                regulations
              </li>
            </ul>
          </Section>

          <Section id="your-rights" number={5} title="Your Rights">
            <p>
              Depending on your jurisdiction, you may have the following rights
              regarding your personal data:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-text-primary">Access:</strong> Request
                a copy of all personal data we hold about you
              </li>
              <li>
                <strong className="text-text-primary">Export:</strong> Download
                your data in a portable, machine-readable format (JSON or CSV)
              </li>
              <li>
                <strong className="text-text-primary">Correction:</strong>{" "}
                Request correction of inaccurate or incomplete data
              </li>
              <li>
                <strong className="text-text-primary">Deletion:</strong>{" "}
                Request deletion of your account and associated data, subject
                to legal retention requirements
              </li>
              <li>
                <strong className="text-text-primary">Opt-Out:</strong> Opt out
                of marketing communications, analytics tracking, or Plaid
                integration at any time
              </li>
              <li>
                <strong className="text-text-primary">Restriction:</strong>{" "}
                Request that we limit processing of your data in certain
                circumstances
              </li>
              <li>
                <strong className="text-text-primary">Objection:</strong>{" "}
                Object to processing of your data for certain purposes
              </li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:legal@homitechnology.com"
                className="text-cyan hover:text-emerald"
              >
                legal@homitechnology.com
              </a>
              . We will respond within 30 days.
            </p>
            <p>
              California residents have additional rights under the CCPA/CPRA.
              Florida residents have additional rights under the Florida Digital
              Bill of Rights. Please contact us for jurisdiction-specific
              information.
            </p>
          </Section>

          <Section id="security" number={6} title="Security">
            <p>
              We implement industry-standard security measures to protect your
              data:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-text-primary">
                  Encryption at Rest:
                </strong>{" "}
                All data stored in our databases is encrypted using AES-256
                encryption
              </li>
              <li>
                <strong className="text-text-primary">
                  Encryption in Transit:
                </strong>{" "}
                All data transmitted between your device and our servers uses
                TLS 1.3 encryption
              </li>
              <li>
                <strong className="text-text-primary">
                  Row-Level Security (RLS):
                </strong>{" "}
                Database access is controlled by RLS policies that ensure users
                can only access their own data
              </li>
              <li>
                <strong className="text-text-primary">
                  Authentication:
                </strong>{" "}
                Secure authentication via Supabase Auth with support for email,
                OAuth, and multi-factor authentication
              </li>
              <li>
                <strong className="text-text-primary">
                  Regular Audits:
                </strong>{" "}
                We conduct regular security assessments and vulnerability scans
              </li>
              <li>
                <strong className="text-text-primary">
                  Access Controls:
                </strong>{" "}
                Internal access to user data is strictly limited on a
                need-to-know basis with audit logging
              </li>
            </ul>
            <p>
              While we strive to protect your data, no method of electronic
              storage or transmission is 100% secure. We cannot guarantee
              absolute security, but we are committed to promptly notifying
              affected users in the event of a data breach.
            </p>
          </Section>

          <Section
            id="cookies"
            number={7}
            title="Cookies &amp; Tracking"
          >
            <p>
              We use essential cookies required for the Service to function
              (authentication, session management). We use analytics cookies
              only with your consent to understand how the platform is used and
              improve the experience.
            </p>
            <p>
              We do not use third-party advertising cookies or trackers. We do
              not engage in cross-site tracking or sell data to advertising
              networks.
            </p>
          </Section>

          <Section
            id="children"
            number={8}
            title="Children&rsquo;s Privacy"
          >
            <p>
              The Service is not directed to children under the age of 13. We
              do not knowingly collect personal information from children under
              13. If we learn that we have collected personal information from a
              child under 13, we will delete that information promptly.
            </p>
            <p>
              Users between the ages of 13 and 18 may use the Service only with
              the involvement and consent of a parent or legal guardian. If you
              are a parent or guardian and believe your child has provided us
              with personal information without your consent, please contact us
              at{" "}
              <a
                href="mailto:legal@homitechnology.com"
                className="text-cyan hover:text-emerald"
              >
                legal@homitechnology.com
              </a>
              .
            </p>
          </Section>

          <Section
            id="changes"
            number={9}
            title="Changes to This Policy"
          >
            <p>
              We may update this Privacy Policy from time to time. Material
              changes will be communicated via email or a prominent notice in
              the Service at least 30 days before taking effect. The
              &ldquo;Last Updated&rdquo; date at the top of this page
              indicates when the policy was most recently revised.
            </p>
            <p>
              Your continued use of the Service after any changes take effect
              constitutes your acceptance of the revised Privacy Policy.
            </p>
          </Section>

          <Section id="contact" number={10} title="Contact Us">
            <p>
              If you have questions or concerns about this Privacy Policy or
              our data practices, please contact us:
            </p>
            <div className="mt-2 space-y-1">
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
              <p>
                Privacy inquiries:{" "}
                <a
                  href="mailto:privacy@homitechnology.com"
                  className="text-cyan hover:text-emerald"
                >
                  privacy@homitechnology.com
                </a>
              </p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
