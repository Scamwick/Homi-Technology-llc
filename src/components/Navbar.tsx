'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0a1628]/95 backdrop-blur-md border-b border-[#1e293b]' : ''
    }`}>
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-[1.75rem] font-black tracking-tight no-underline">
          <span className="text-[#22d3ee]">H</span>
          <span className="text-[#34d399]">ō</span>
          <span className="text-[#facc15]">M</span>
          <span className="text-[#22d3ee]">I</span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden flex flex-col gap-[5px] bg-none border-none cursor-pointer p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`w-6 h-0.5 bg-white transition-all duration-150 ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`w-6 h-0.5 bg-white transition-all duration-150 ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-0.5 bg-white transition-all duration-150 ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>

        {/* Menu */}
        <div className={`lg:flex items-center gap-8 ${
          mobileOpen 
            ? 'flex flex-col absolute top-full left-0 right-0 bg-[#0a1628] border-b border-[#1e293b] p-6 gap-4' 
            : 'hidden lg:flex'
        }`}>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <Link href="/features" className="text-[0.9375rem] font-medium text-[#94a3b8] hover:text-[#e2e8f0] transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-[0.9375rem] font-medium text-[#94a3b8] hover:text-[#e2e8f0] transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-[0.9375rem] font-medium text-[#94a3b8] hover:text-[#e2e8f0] transition-colors">
              About
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-4 mt-4 lg:mt-0">
            <Link 
              href="/login" 
              className="text-[0.9375rem] font-medium text-[#94a3b8] hover:text-[#e2e8f0] transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#22d3ee] text-[#0a1628] font-semibold text-[0.9375rem] hover:bg-[#06b6d4] transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
