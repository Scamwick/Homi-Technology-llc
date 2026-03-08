import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#0f172a] border-t border-[#1e293b] pt-16 pb-8 mt-auto">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 max-w-[300px]">
            <Link href="/" className="text-2xl font-black tracking-tight no-underline inline-block mb-4">
              <span className="text-[#22d3ee]">H</span>
              <span className="text-[#34d399]">ō</span>
              <span className="text-[#facc15]">M</span>
              <span className="text-[#22d3ee]">I</span>
            </Link>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Decision Readiness Intelligence. Are you actually ready for your biggest financial decision?
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-[#e2e8f0] mb-4 uppercase tracking-wider">Product</h4>
            <div className="flex flex-col gap-2">
              <Link href="/features" className="text-sm text-[#94a3b8] hover:text-[#22d3ee] transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-sm text-[#94a3b8] hover:text-[#22d3ee] transition-colors">
                Pricing
              </Link>
              <Link href="/assess" className="text-sm text-[#94a3b8] hover:text-[#22d3ee] transition-colors">
                Take Assessment
              </Link>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-[#e2e8f0] mb-4 uppercase tracking-wider">Company</h4>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-[#94a3b8] hover:text-[#22d3ee] transition-colors">
                About
              </Link>
              <a 
                href="https://x.com/homi_tech" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-[#94a3b8] hover:text-[#22d3ee] transition-colors"
              >
                Twitter
              </a>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-[#e2e8f0] mb-4 uppercase tracking-wider">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link href="/privacy" className="text-sm text-[#94a3b8] hover:text-[#22d3ee] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-[#94a3b8] hover:text-[#22d3ee] transition-colors">
                Terms of Service
              </Link>
              <p className="text-xs text-[#64748b] italic mt-2">
                HōMI is NOT a financial advisor.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-[#1e293b] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#64748b]">
            © {new Date().getFullYear()} HōMI TECHNOLOGIES LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
