'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Ring } from '@/components/ui/Ring'
import { Store, Search, CheckCircle } from 'lucide-react'

const ADVISORS = [
  { id: 1, name: 'Maria Chen',    specialty: "Buyer's Agent", city: 'Austin, TX',    score: 94, bio: '10+ years helping first-time buyers navigate competitive markets with confidence.',              color: 'cyan'    as const },
  { id: 2, name: 'David Patel',   specialty: 'Mortgage',      city: 'Denver, CO',    score: 91, bio: 'Licensed mortgage broker specializing in creative financing for complex situations.',           color: 'emerald' as const },
  { id: 3, name: 'Sarah Kim',     specialty: 'Financial',     city: 'Nashville, TN', score: 88, bio: 'CFP with deep expertise in pre-purchase financial planning and readiness optimization.',       color: 'yellow'  as const },
  { id: 4, name: 'James Torres',  specialty: "Buyer's Agent", city: 'Phoenix, AZ',   score: 86, bio: "Veteran buyer's agent known for negotiation skills and transparent communication.",            color: 'cyan'    as const },
]

const SPECIALTIES = ['All', "Buyer's Agent", 'Mortgage', 'Financial']

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

const accentClasses: Record<string, string> = {
  cyan:    'bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan',
  emerald: 'bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald',
  yellow:  'bg-brand-yellow/10 border-brand-yellow/20 text-brand-yellow',
}

export default function MarketplacePage() {
  const [specialty, setSpecialty] = useState('All')
  const [cityFilter, setCityFilter] = useState('')
  const [minScore, setMinScore] = useState(80)
  const [connecting, setConnecting] = useState<number | null>(null)
  const [connected, setConnected] = useState<Set<number>>(new Set())

  const filtered = ADVISORS.filter((a) => {
    if (specialty !== 'All' && a.specialty !== specialty) return false
    if (cityFilter && !a.city.toLowerCase().includes(cityFilter.toLowerCase())) return false
    if (a.score < minScore) return false
    return true
  })

  const handleConnect = (id: number) => {
    setConnecting(id)
    setTimeout(() => {
      setConnected((prev) => new Set(prev).add(id))
      setConnecting(null)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Store className="w-6 h-6 text-brand-cyan" />
        <h1 className="text-xl font-semibold text-text-1">Advisor Marketplace</h1>
        <Badge variant="emerald" size="sm">{filtered.length} available</Badge>
      </div>

      {/* Filters */}
      <Card variant="elevated" className="space-y-4">
        <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide font-mono">Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-text-3 font-mono uppercase">Specialty</label>
            <div className="flex flex-wrap gap-1">
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpecialty(s)}
                  className={`px-2 py-1 text-xs rounded-brand-sm border transition-all ${
                    specialty === s
                      ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan'
                      : 'border-surface-3 text-text-3 hover:border-brand-cyan/30'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-text-3 font-mono uppercase">City</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-4" />
              <Input
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Filter by city…"
                className="pl-6 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-text-3 font-mono uppercase">Min HōMI Score: {minScore}</label>
            <input
              type="range"
              min={70}
              max={98}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-[#22d3ee]"
            />
          </div>
        </div>
      </Card>

      {/* Advisor cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((a) => (
          <Card key={a.id} variant="elevated" className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-bold flex-shrink-0 ${accentClasses[a.color]}`}>
                {initials(a.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-1">{a.name}</p>
                <p className="text-xs text-text-3">{a.specialty} · {a.city}</p>
              </div>
              <Ring value={a.score} size={44} color={a.color} label="Rep" />
            </div>
            <p className="text-xs text-text-2">{a.bio}</p>
            {connected.has(a.id) ? (
              <div className="flex items-center gap-2 text-brand-emerald text-sm">
                <CheckCircle className="w-4 h-4" /> Request sent
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleConnect(a.id)}
                disabled={connecting === a.id}
              >
                {connecting === a.id ? 'Connecting…' : 'Connect'}
              </Button>
            )}
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-10 text-text-3 text-sm">
            No advisors match your filters. Try adjusting the minimum score or specialty.
          </div>
        )}
      </div>
    </div>
  )
}
