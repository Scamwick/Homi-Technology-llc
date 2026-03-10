'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Ring } from '@/components/ui/Ring'
import { Award, CheckCircle, XCircle, Copy, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const TIERS = [
  { name: 'Bronze',   range: '60–74', label: 'Basic Readiness',  variant: 'yellow'  as const, min: 60, max: 74  },
  { name: 'Silver',   range: '75–89', label: 'Strong Readiness', variant: 'default' as const, min: 75, max: 89  },
  { name: 'Gold',     range: '90+',   label: 'Peak Readiness',   variant: 'yellow'  as const, min: 90, max: 100 },
]

function getTier(score: number) {
  return TIERS.find((t) => score >= t.min && score <= t.max) ?? null
}

function genCertId(userId: string, score: number): string {
  const hash = Math.abs(userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + score * 31)
  return `HOMI-2026-${String(hash).padStart(7, '0')}`
}

function ringColor(score: number): 'emerald' | 'yellow' | 'amber' | 'crimson' {
  if (score >= 75) return 'emerald'
  if (score >= 60) return 'yellow'
  return 'amber'
}

export default function CertificationPage() {
  const [assessment, setAssessment] = useState<any>(null)
  const [user, setUser]             = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [verifyId, setVerifyId]     = useState('')
  const [verifyResult, setVerifyResult] = useState<'valid' | 'invalid' | null>(null)
  const [copied, setCopied]         = useState(false)
  const supabase = createClient()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) return
      setUser(u)
      const { data } = await supabase
        .from('assessments')
        .select('id, overall_score, verdict, created_at')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      setAssessment(data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>

  const score  = assessment?.overall_score ?? 0
  const tier   = getTier(score)
  const certId = user ? genCertId(user.id, score) : 'HOMI-0000-0000000'
  const eligible = score >= 60

  const handleCopy = () => {
    navigator.clipboard.writeText(certId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerify = () => {
    setVerifyResult(verifyId.trim().toUpperCase() === certId ? 'valid' : 'invalid')
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Award className="w-6 h-6 text-brand-yellow" />
        <h1 className="text-xl font-semibold text-text-1">Readiness Certification</h1>
        {tier && <Badge variant={tier.variant} size="sm">{tier.name}</Badge>}
      </div>

      {/* Certificate */}
      {eligible && tier ? (
        <Card variant="elevated" className="border-brand-yellow/40 text-center p-10 space-y-4">
          <Award className="w-12 h-12 text-brand-yellow mx-auto" />
          <p className="text-xs text-text-3 font-mono uppercase tracking-widest">Official HōMI Certification</p>
          <div className="space-y-1">
            <Ring value={score} size={96} color={ringColor(score)} label="Score" className="mx-auto" />
            <h2 className="text-2xl font-bold text-brand-yellow mt-4">{tier.name} Certification</h2>
            <p className="text-text-2">{tier.label}</p>
          </div>
          <div className="pt-2 space-y-1">
            <p className="text-xs text-text-3 font-mono">Certification ID</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-sm text-brand-cyan font-mono bg-surface-2 px-3 py-1.5 rounded-brand-sm border border-surface-3">
                {certId}
              </code>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded text-text-3 hover:text-brand-cyan transition-colors"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-brand-emerald" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-text-4 font-mono">
              Issued {new Date(assessment?.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </Card>
      ) : (
        <Card variant="elevated" className="text-center py-12 space-y-4">
          <Award className="w-10 h-10 text-text-4 mx-auto" />
          <p className="text-text-2">Reach a score of 60+ to earn your HōMI Certification.</p>
          <p className="text-text-3 text-sm">Current score: <span className="text-text-1 font-semibold">{score}/100</span></p>
          {!assessment && (
            <Link href="/assessments/new">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>Start Assessment</Button>
            </Link>
          )}
        </Card>
      )}

      {/* Tiers */}
      <Card variant="elevated" className="space-y-3">
        <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide font-mono">Certification Tiers</h3>
        <div className="space-y-2">
          {TIERS.map((t) => (
            <div key={t.name} className={`flex items-center justify-between p-3 rounded-brand-sm border ${tier?.name === t.name ? 'border-brand-yellow/30 bg-brand-yellow/5' : 'border-surface-3 bg-surface-2'}`}>
              <div>
                <p className="text-sm font-medium text-text-1">{t.name}</p>
                <p className="text-xs text-text-3">{t.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-3 font-mono">{t.range}</span>
                {tier?.name === t.name && <CheckCircle className="w-4 h-4 text-brand-emerald" />}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Verify */}
      <Card variant="elevated" className="space-y-3">
        <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide font-mono">Verify a Certificate</h3>
        <div className="flex gap-2">
          <Input
            value={verifyId}
            onChange={(e) => setVerifyId(e.target.value)}
            placeholder="HOMI-2026-0000000"
            className="flex-1 font-mono text-sm"
          />
          <Button variant="outline" size="sm" onClick={handleVerify}>Verify</Button>
        </div>
        {verifyResult === 'valid' && (
          <div className="flex items-center gap-2 text-brand-emerald text-sm">
            <CheckCircle className="w-4 h-4" /> Valid HōMI Certificate
          </div>
        )}
        {verifyResult === 'invalid' && (
          <div className="flex items-center gap-2 text-brand-crimson text-sm">
            <XCircle className="w-4 h-4" /> Certificate not found
          </div>
        )}
      </Card>
    </div>
  )
}
