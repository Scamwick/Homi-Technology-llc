'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/homi-score', label: 'HōMI-Score' },
  { href: '/pricing', label: 'Pricing' },
] as const;

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = useCallback(() => setMobileOpen((prev) => !prev), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #1e293b',
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <Logo size="md" showWordmark />

        {/* Center: Desktop navigation */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-cyan'
                      : 'text-text-primary hover:bg-slate-dark/50 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right: CTA buttons (desktop) */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="rounded-lg border border-slate-mid px-4 py-2 text-sm font-medium text-text-primary transition-colors duration-150 hover:border-cyan/40 hover:text-white"
          >
            Log In
          </Link>
          <Link
            href="/assess"
            className="rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-150 hover:brightness-110"
            style={{
              backgroundColor: '#34d399',
              color: '#0a1628',
            }}
          >
            Get Your Score
          </Link>
        </div>

        {/* Mobile: Hamburger toggle */}
        <button
          type="button"
          onClick={toggleMobile}
          className="inline-flex items-center justify-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-slate-dark hover:text-white lg:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile: Slide-down panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ borderTop: mobileOpen ? '1px solid #1e293b' : 'none' }}
      >
        <div className="space-y-1 px-4 pb-4 pt-3">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={closeMobile}
                className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-slate-dark/60 text-cyan'
                    : 'text-text-primary hover:bg-slate-dark/40 hover:text-white'
                }`}
              >
                {label}
              </Link>
            );
          })}

          <div className="mt-4 flex flex-col gap-2 border-t border-slate-mid/50 pt-4">
            <Link
              href="/login"
              onClick={closeMobile}
              className="rounded-lg border border-slate-mid px-4 py-2.5 text-center text-sm font-medium text-text-primary transition-colors hover:border-cyan/40 hover:text-white"
            >
              Log In
            </Link>
            <Link
              href="/assess"
              onClick={closeMobile}
              className="rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-[#0a1628] transition-all hover:brightness-110"
              style={{ backgroundColor: '#34d399' }}
            >
              Get Your Score
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Nav;
