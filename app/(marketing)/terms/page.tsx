import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for HōMI — Decision Readiness Intelligence by HOMI TECHNOLOGIES LLC.",
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

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-navy">
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-24">
        {/* Header */}
        <header className="mb-16">
          <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            Effective Date: April 1, 2026 &middot; Last Updated: April 1, 2026
          </p>
          <div className="mt-6 rounded-xl border border-slate-dark/60 bg-navy-light/50 p-4 text-sm text-text-secondary">
            Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully
            before using the HōMI platform. By creating an account or using any
            HōMI service, you agree to be bound by these Terms.
          </div>
        </header>

        {/* Sections */}
        <div className="space-y-12">
          <Section id="acceptance" number={1} title="Acceptance of Terms">
            <p>
              By accessing or using the HōMI platform, mobile applications, APIs,
              or any related services (collectively, the &ldquo;Service&rdquo;)
              provided by HOMI TECHNOLOGIES LLC (&ldquo;Company,&rdquo;
              &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you
              agree to comply with and be bound by these Terms, our Privacy
              Policy, and our Financial Disclaimer, each of which is incorporated
              herein by reference.
            </p>
            <p>
              If you do not agree to these Terms, you must not access or use the
              Service. If you are using the Service on behalf of an organization,
              you represent and warrant that you have the authority to bind that
              organization to these Terms.
            </p>
          </Section>

          <Section
            id="service-description"
            number={2}
            title="Description of Service"
          >
            <p>
              HōMI is a Decision Readiness Intelligence&trade; platform that
              provides educational assessments, scoring tools, and AI-powered
              coaching to help users evaluate their readiness for major financial
              and life decisions. The Service includes, but is not limited to:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                The HōMI-Score&trade;, a proprietary readiness
                assessment metric
              </li>
              <li>Financial analysis and simulation tools</li>
              <li>AI coaching and agent-based guidance</li>
              <li>Behavioral genome analysis</li>
              <li>API access for third-party integrations</li>
            </ul>
            <p>
              The Service is educational in nature and does{" "}
              <strong className="text-text-primary">not</strong> constitute
              financial, investment, legal, or professional advice. See our
              Financial Disclaimer for details.
            </p>
          </Section>

          <Section id="accounts" number={3} title="User Accounts">
            <p>
              To access certain features of the Service, you must create an
              account. You agree to:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                Provide accurate, current, and complete information during
                registration
              </li>
              <li>
                Maintain the security of your password and account credentials
              </li>
              <li>
                Promptly update your account information if it changes
              </li>
              <li>
                Accept responsibility for all activities that occur under your
                account
              </li>
              <li>
                Notify us immediately of any unauthorized access or security
                breach
              </li>
            </ul>
            <p>
              You must be at least 13 years of age to create an account. Users
              between 13 and 18 must have parental or guardian consent. We
              reserve the right to suspend or terminate accounts that violate
              these Terms.
            </p>
          </Section>

          <Section
            id="billing"
            number={4}
            title="Subscriptions &amp; Billing"
          >
            <p>
              HōMI offers both free and paid subscription plans. By selecting a
              paid plan, you agree to pay the applicable fees as described on our
              Pricing page.
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-text-primary">Billing Cycle:</strong>{" "}
                Subscriptions are billed monthly in advance on a recurring
                basis.
              </li>
              <li>
                <strong className="text-text-primary">Payment Processing:</strong>{" "}
                All payments are processed securely through Stripe. We do not
                store your payment card details on our servers.
              </li>
              <li>
                <strong className="text-text-primary">Upgrades:</strong>{" "}
                Plan upgrades take effect immediately. You will be charged a
                prorated amount for the remainder of the current billing period.
              </li>
              <li>
                <strong className="text-text-primary">Downgrades:</strong>{" "}
                Plan downgrades take effect at the start of the next billing
                cycle.
              </li>
              <li>
                <strong className="text-text-primary">Cancellation:</strong>{" "}
                You may cancel your subscription at any time. Access to paid
                features continues until the end of your current billing
                period. No refunds are issued for partial months.
              </li>
              <li>
                <strong className="text-text-primary">Price Changes:</strong>{" "}
                We reserve the right to modify pricing. You will be notified at
                least 30 days in advance of any price increase.
              </li>
            </ul>
          </Section>

          <Section
            id="ip"
            number={5}
            title="Intellectual Property"
          >
            <p>
              The Service and its original content, features, and functionality
              are owned by HOMI TECHNOLOGIES LLC and are protected by
              international copyright, trademark, patent, trade secret, and
              other intellectual property laws.
            </p>
            <p>
              &ldquo;HōMI,&rdquo; &ldquo;HōMI-Score,&rdquo; &ldquo;Decision
              Readiness Intelligence,&rdquo; the HōMI logo, and all related
              names, logos, product and service names, designs, and slogans are
              trademarks of HOMI TECHNOLOGIES LLC. You may not use these marks
              without our prior written consent.
            </p>
            <p>
              The algorithms, scoring methodologies, behavioral genome models,
              and AI agent frameworks used in the Service are proprietary and
              confidential. Any reverse engineering, decompilation, or
              unauthorized use is strictly prohibited.
            </p>
          </Section>

          <Section id="user-content" number={6} title="User Content">
            <p>
              You retain ownership of any data, text, or materials you submit to
              the Service (&ldquo;User Content&rdquo;). By submitting User
              Content, you grant us a limited, non-exclusive, worldwide,
              royalty-free license to use, process, and analyze your content
              solely for the purpose of providing and improving the Service.
            </p>
            <p>
              You are solely responsible for your User Content and represent that
              you have the right to submit it. We reserve the right to remove
              any User Content that violates these Terms or is otherwise
              objectionable.
            </p>
          </Section>

          <Section id="disclaimer" number={7} title="Disclaimer of Warranties">
            <p>
              <strong className="text-text-primary">
                HŌMI IS NOT A FINANCIAL ADVISOR, LENDER, BROKER, OR FIDUCIARY.
              </strong>{" "}
              The Service provides educational tools and informational
              assessments only. Nothing in the Service constitutes financial
              advice, investment advice, tax advice, legal advice, or a
              recommendation to enter any transaction.
            </p>
            <p>
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
              AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
              UNINTERRUPTED, ERROR-FREE, OR SECURE.
            </p>
            <p>
              HōMI-Score results, readiness verdicts, and AI coaching outputs
              are estimates based on the data you provide and should not be the
              sole basis for any financial decision.
            </p>
          </Section>

          <Section
            id="liability"
            number={8}
            title="Limitation of Liability"
          >
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
              SHALL HOMI TECHNOLOGIES LLC, ITS OFFICERS, DIRECTORS, EMPLOYEES,
              AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT
              LIMITATION LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER
              INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Your access to or use of (or inability to use) the Service</li>
              <li>
                Any conduct or content of any third party on the Service
              </li>
              <li>
                Any financial decisions made based on information provided by
                the Service
              </li>
              <li>Unauthorized access, use, or alteration of your data</li>
            </ul>
            <p>
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE
              TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
            </p>
          </Section>

          <Section id="termination" number={9} title="Termination">
            <p>
              We may suspend or terminate your access to the Service at any
              time, with or without cause, with or without notice. Upon
              termination:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                Your right to use the Service ceases immediately
              </li>
              <li>
                We may delete your account data in accordance with our Privacy
                Policy and data retention practices
              </li>
              <li>
                Any fees owed prior to termination remain payable
              </li>
              <li>
                Sections regarding intellectual property, disclaimers,
                limitations of liability, and governing law survive
                termination
              </li>
            </ul>
            <p>
              You may terminate your account at any time by contacting us or
              using the account deletion feature in your settings.
            </p>
          </Section>

          <Section
            id="governing-law"
            number={10}
            title="Governing Law &amp; Dispute Resolution"
          >
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the State of Florida, United States, without regard to
              its conflict of law provisions.
            </p>
            <p>
              Any dispute arising out of or relating to these Terms or the
              Service shall be resolved through binding arbitration conducted
              in the State of Florida in accordance with the rules of the
              American Arbitration Association. You agree to waive any right to
              participate in a class action lawsuit or class-wide arbitration.
            </p>
            <p>
              Notwithstanding the foregoing, either party may seek injunctive or
              equitable relief in any court of competent jurisdiction.
            </p>
          </Section>

          <Section
            id="changes"
            number={11}
            title="Changes to Terms"
          >
            <p>
              We reserve the right to modify these Terms at any time. Material
              changes will be communicated via email or a prominent notice
              within the Service at least 30 days before taking effect.
            </p>
            <p>
              Your continued use of the Service after the effective date of any
              changes constitutes your acceptance of the revised Terms. If you
              do not agree to the updated Terms, you must stop using the Service
              and delete your account.
            </p>
          </Section>
        </div>

        {/* Contact */}
        <footer className="mt-16 rounded-xl border border-slate-dark/60 bg-navy-light/50 p-6">
          <h3 className="mb-3 font-display text-lg font-semibold text-text-primary">
            Contact Us
          </h3>
          <p className="text-sm leading-relaxed text-text-secondary">
            If you have questions about these Terms, please contact us at:
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
