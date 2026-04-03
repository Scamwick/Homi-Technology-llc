'use client';

import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';

const PRODUCT_LINKS = [
  { href: '/homi-score', label: 'HōMI-Score' },
  { href: '/assess', label: 'Assessment' },
  { href: '/tools', label: 'Tools' },
  { href: '/agent', label: 'Agent' },
] as const;

const COMPANY_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
] as const;

const LEGAL_LINKS = [
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/disclaimer', label: 'Disclaimer' },
] as const;

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="text-sm text-text-secondary transition-colors duration-150 hover:text-white"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#0f172a',
        borderTop: '1px solid #1e293b',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* 4-column grid: 1 col mobile, 2 cols tablet, 4 cols desktop */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Logo + tagline */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size="md" showWordmark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-secondary">
              Decision Readiness Intelligence&trade;
            </p>
            <p className="mt-2 text-xs text-text-secondary">
              Measure, manage, and improve your readiness to make high-stakes decisions.
            </p>
          </div>

          {/* Column 2: Product */}
          <FooterLinkGroup title="Product" links={PRODUCT_LINKS} />

          {/* Column 3: Company */}
          <FooterLinkGroup title="Company" links={COMPANY_LINKS} />

          {/* Column 4: Legal */}
          <FooterLinkGroup title="Legal" links={LEGAL_LINKS} />
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 flex flex-col items-center justify-between gap-4 pt-8 sm:flex-row"
          style={{ borderTop: '1px solid #1e293b' }}
        >
          <p className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} HOMI TECHNOLOGIES LLC. All rights reserved.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/Homi_Tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary transition-colors duration-150 hover:text-white"
              aria-label="Follow HōMI on X (Twitter)"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
