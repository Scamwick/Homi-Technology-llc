import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Marketing Layout — shared chrome for all public pages.
 * Nav (sticky top) + page content (flex-1) + Footer (bottom).
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: '#0a1628' }}
    >
      <Nav />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
