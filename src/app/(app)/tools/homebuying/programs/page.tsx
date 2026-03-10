'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Gift, ChevronLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Program {
  name: string
  state: string  // 'Federal' or 2-letter state code
  type: 'Down Payment Assistance' | 'Low Down Payment' | 'Grant' | 'Deferred Loan'
  maxAssistance: string
  minCreditScore?: number
  description: string
  requirements: string[]
  learnMore: string
}

const PROGRAMS: Program[] = [
  {
    name: 'FHA Loan',
    state: 'Federal',
    type: 'Low Down Payment',
    maxAssistance: '3.5% down minimum',
    minCreditScore: 580,
    description: 'Government-backed mortgage with lower down payment requirements and flexible credit guidelines.',
    requirements: ['580+ credit score for 3.5% down', '500–579 credit score requires 10% down', 'Primary residence only', 'FHA-approved lender'],
    learnMore: 'https://www.hud.gov/buying/loans',
  },
  {
    name: 'VA Loan',
    state: 'Federal',
    type: 'Low Down Payment',
    maxAssistance: '0% down payment',
    description: 'Zero down payment mortgage for veterans, active duty service members, and eligible surviving spouses.',
    requirements: ['Veteran, active duty, or eligible surviving spouse', 'Certificate of Eligibility required', 'No PMI required', 'Primary residence only'],
    learnMore: 'https://www.va.gov/housing-assistance/home-loans/',
  },
  {
    name: 'USDA Loan',
    state: 'Federal',
    type: 'Low Down Payment',
    maxAssistance: '0% down payment',
    description: 'Zero down payment loan for rural and suburban homebuyers who meet income limits.',
    requirements: ['Rural or suburban eligible area', 'Income at or below 115% of area median income', 'U.S. citizen or permanent resident', 'Primary residence only'],
    learnMore: 'https://www.rd.usda.gov/programs-services/single-family-housing-programs',
  },
  {
    name: 'Fannie Mae HomeReady',
    state: 'Federal',
    type: 'Low Down Payment',
    maxAssistance: '3% down minimum',
    minCreditScore: 620,
    description: 'Conventional mortgage with low down payment, reduced PMI, and flexible income sources including rental income.',
    requirements: ['620+ credit score', 'Income at or below 80% of area median income', 'Homebuyer education course required', 'Primary residence'],
    learnMore: 'https://singlefamily.fanniemae.com/originating-underwriting/mortgage-products/homeready-mortgage',
  },
  {
    name: 'Freddie Mac Home Possible',
    state: 'Federal',
    type: 'Low Down Payment',
    maxAssistance: '3% down minimum',
    minCreditScore: 660,
    description: 'Conventional mortgage option designed for low- and moderate-income borrowers.',
    requirements: ['660+ credit score', 'Income at or below 80% AMI', 'Homebuyer education course', 'Primary residence'],
    learnMore: 'https://myhome.freddiemac.com/buying/home-possible',
  },
  {
    name: 'Good Neighbor Next Door',
    state: 'Federal',
    type: 'Down Payment Assistance',
    maxAssistance: '50% off list price on HUD homes',
    description: 'HUD program offering 50% discount on home price for eligible public servants in revitalization areas.',
    requirements: ['Teacher, police officer, firefighter, or EMT', 'Must commit to living in home 3 years', 'HUD-designated revitalization area', 'Must use FHA, VA, or conventional financing'],
    learnMore: 'https://www.hud.gov/program_offices/housing/sfh/reo/goodn/gnndabot',
  },
  {
    name: 'HUD $100 Down Program',
    state: 'Federal',
    type: 'Down Payment Assistance',
    maxAssistance: '$100 down payment',
    description: 'Purchase HUD-owned properties with just $100 down using FHA financing.',
    requirements: ['HUD-owned property only', 'Must use FHA financing', 'Owner-occupant purchase', 'As-is condition'],
    learnMore: 'https://www.hud.gov/program_offices/housing/sfh/reo',
  },
  {
    name: 'CalHFA MyHome Assistance',
    state: 'CA',
    type: 'Down Payment Assistance',
    maxAssistance: 'Up to 3.5% of purchase price',
    description: 'Deferred-payment junior loan for down payment and/or closing costs for California first-time buyers.',
    requirements: ['First-time homebuyer', 'CalHFA income limits', 'Must use CalHFA first mortgage', 'Homebuyer education required'],
    learnMore: 'https://www.calhfa.ca.gov/homebuyer/programs/myhome.htm',
  },
  {
    name: 'My First Texas Home',
    state: 'TX',
    type: 'Down Payment Assistance',
    maxAssistance: 'Up to 5% down payment assistance',
    description: '30-year fixed-rate mortgage with down payment and closing cost assistance for Texas first-time buyers.',
    requirements: ['First-time homebuyer or no home in past 3 years', 'Texas residency', 'Income and purchase price limits apply', 'Homebuyer education required'],
    learnMore: 'https://www.tdhca.state.tx.us/homeownership/my-first-texas-home.htm',
  },
  {
    name: 'Florida Assist',
    state: 'FL',
    type: 'Deferred Loan',
    maxAssistance: 'Up to $10,000 deferred loan',
    description: 'Zero-interest deferred second mortgage for down payment assistance. No monthly payments until sale or refinance.',
    requirements: ['First-time homebuyer', 'Florida Housing first mortgage required', 'Income and purchase price limits', 'Homebuyer education course'],
    learnMore: 'https://www.floridahousing.org/programs/homebuyer-overview-page/florida-assist-(fl-assist)',
  },
  {
    name: 'SONYMA Low Interest Rate',
    state: 'NY',
    type: 'Low Down Payment',
    maxAssistance: 'Below-market rate + DPA',
    description: 'New York State below-market-rate mortgages with down payment assistance for first-time buyers.',
    requirements: ['First-time homebuyer', 'Income limits apply', 'Purchase price limits by county', 'Owner-occupied primary residence'],
    learnMore: 'https://hcr.ny.gov/sonyma',
  },
  {
    name: 'WSHFC Home Advantage',
    state: 'WA',
    type: 'Down Payment Assistance',
    maxAssistance: 'Up to 4% DPA',
    description: 'Washington State Housing Finance Commission programs offering below-market rates and down payment assistance.',
    requirements: ['Income limits apply', 'Purchase price limits', 'Homebuyer education seminar', 'Primary residence'],
    learnMore: 'https://www.wshfc.org/buyers/homeadvantage.htm',
  },
  {
    name: 'CHFA Down Payment Assistance',
    state: 'CO',
    type: 'Down Payment Assistance',
    maxAssistance: 'Up to 4% of first mortgage',
    description: 'Colorado Housing and Finance Authority offers DPA as a second mortgage at very low interest rates.',
    requirements: ['Income limits based on county and household size', 'Purchase price limits', 'CHFA-approved lender', 'Homebuyer education'],
    learnMore: 'https://www.chfainfo.com/homeownership/buy-a-home',
  },
  {
    name: 'IHDA Access Forgivable',
    state: 'IL',
    type: 'Grant',
    maxAssistance: 'Up to $6,000 forgivable',
    description: 'Illinois Housing Development Authority forgivable assistance for down payment and closing costs. Forgiven over 10 years.',
    requirements: ['Income limits', 'Purchase price limits', 'Minimum credit score 640', '30-year fixed mortgage required'],
    learnMore: 'https://www.ihda.org/my-home/buying-a-home/',
  },
  {
    name: 'Georgia Dream',
    state: 'GA',
    type: 'Down Payment Assistance',
    maxAssistance: '$10,000 (up to $12,500 for protectors/educators/healthcare)',
    description: 'Georgia Department of Community Affairs program offering zero-interest loans for down payment.',
    requirements: ['First-time homebuyer or eligible area', 'Income limits apply', 'Minimum 640 credit score', '60-day homebuyer education'],
    learnMore: 'https://www.dca.ga.gov/safe-affordable-housing/homeownership/georgia-dream-homeownership-program',
  },
  {
    name: 'Home+Plus Arizona',
    state: 'AZ',
    type: 'Down Payment Assistance',
    maxAssistance: '0–3% of loan amount',
    description: 'Arizona program providing down payment and closing cost assistance through participating lenders.',
    requirements: ['Income at or below $122,100', 'Purchase price limits', 'Minimum 640 credit score', 'Owner-occupied primary residence'],
    learnMore: 'https://housing.az.gov/general-public/homeplus-mortgage',
  },
]

const ALL_STATES = Array.from(new Set(PROGRAMS.map(p => p.state))).sort((a, b) => {
  if (a === 'Federal') return -1
  if (b === 'Federal') return 1
  return a.localeCompare(b)
})

const ALL_TYPES = Array.from(new Set(PROGRAMS.map(p => p.type)))

export default function ProgramsPage() {
  const [stateFilter, setStateFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')

  const filtered = useMemo(() => PROGRAMS.filter(p => {
    if (stateFilter !== 'All' && p.state !== stateFilter) return false
    if (typeFilter !== 'All' && p.type !== typeFilter) return false
    return true
  }), [stateFilter, typeFilter])

  const typeColor: Record<string, string> = {
    'Down Payment Assistance': 'cyan',
    'Low Down Payment': 'emerald',
    'Grant': 'amber',
    'Deferred Loan': 'yellow',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/tools/homebuying" className="flex items-center gap-1 text-sm text-text-3 hover:text-text-1 mb-3">
          <ChevronLeft className="w-4 h-4" /> Homebuying Tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-brand bg-brand-emerald/10 flex items-center justify-center">
            <Gift className="w-5 h-5 text-brand-emerald" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">First-Time Buyer Programs</h1>
            <p className="text-sm text-text-2">Federal and state down payment assistance, grants, and programs.</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card variant="elevated" className="p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-xs text-text-3 block mb-1">State / Program Type</label>
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}
              className="bg-surface-2 border border-surface-3 rounded px-2 py-1.5 text-sm text-text-1">
              <option value="All">All States</option>
              {ALL_STATES.map(s => <option key={s} value={s}>{s === 'Federal' ? 'Federal Programs' : s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-3 block mb-1">Program Type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="bg-surface-2 border border-surface-3 rounded px-2 py-1.5 text-sm text-text-1">
              <option value="All">All Programs</option>
              {ALL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="ml-auto flex items-end">
            <span className="text-sm text-text-4">{filtered.length} programs</span>
          </div>
        </div>
      </Card>

      {/* Program cards */}
      <div className="space-y-3">
        {filtered.map((program, i) => (
          <Card key={i} variant="elevated" className="p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-semibold text-text-1">{program.name}</p>
                  <Badge variant={typeColor[program.type] as 'cyan' | 'emerald' | 'amber' | 'yellow'} size="sm">{program.type}</Badge>
                  <Badge variant={program.state === 'Federal' ? 'cyan' : 'emerald'} size="sm">
                    {program.state === 'Federal' ? 'Federal' : program.state}
                  </Badge>
                </div>
                <p className="text-sm text-text-2">{program.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-text-4 mb-0.5">Max Assistance</p>
                <p className="text-sm font-bold text-brand-emerald">{program.maxAssistance}</p>
                {program.minCreditScore && (
                  <p className="text-xs text-text-4 mt-0.5">{program.minCreditScore}+ credit</p>
                )}
              </div>
            </div>
            <div className="mb-3">
              <p className="text-xs text-text-4 mb-1">Requirements</p>
              <ul className="space-y-0.5">
                {program.requirements.map((r, j) => (
                  <li key={j} className="text-xs text-text-3 flex items-start gap-1">
                    <span className="text-brand-emerald mt-0.5">•</span> {r}
                  </li>
                ))}
              </ul>
            </div>
            <a href={program.learnMore} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand-cyan hover:text-brand-cyan/80">
              Learn More <ExternalLink className="w-3 h-3" />
            </a>
          </Card>
        ))}
      </div>

      <Card variant="elevated" className="p-4 border-surface-3">
        <p className="text-xs text-text-4">
          Program details, income limits, and availability change frequently. Always verify current terms with the program administrator or a HUD-approved housing counselor.
        </p>
      </Card>
    </div>
  )
}
