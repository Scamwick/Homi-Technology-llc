'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Wrench, ChevronLeft, ChevronDown, ChevronRight, FileText } from 'lucide-react'
import Link from 'next/link'

type Severity = 'none' | 'minor' | 'major' | 'safety'

interface CheckItem {
  id: string
  name: string
  checked: boolean
  severity: Severity
  estimatedCost: number
  notes: string
}

interface Category {
  name: string
  items: CheckItem[]
}

function makeItems(names: string[]): CheckItem[] {
  return names.map((name, i) => ({
    id: `${name}-${i}`,
    name,
    checked: false,
    severity: 'none',
    estimatedCost: 0,
    notes: '',
  }))
}

const INITIAL_CATEGORIES: Category[] = [
  { name: 'Exterior', items: makeItems(['Roof condition', 'Gutters & downspouts', 'Siding / cladding', 'Foundation', 'Driveway & walkways', 'Landscaping drainage']) },
  { name: 'Interior', items: makeItems(['Walls & ceilings', 'Floors', 'Windows & doors', 'Stairs & railings', 'Attic access & insulation']) },
  { name: 'Systems', items: makeItems(['HVAC system', 'Electrical panel', 'Plumbing', 'Water heater', 'Smoke & CO detectors']) },
  { name: 'Kitchen', items: makeItems(['Appliances', 'Cabinet condition', 'Countertops', 'Sink & faucet', 'Ventilation / range hood']) },
  { name: 'Bathrooms', items: makeItems(['Toilet function', 'Shower / tub', 'Sink & faucet', 'Exhaust fan', 'Tile & grout']) },
  { name: 'Basement / Crawlspace', items: makeItems(['Water intrusion / moisture', 'Structural beams', 'Sump pump', 'Radon mitigation', 'Insulation']) },
]

const SEVERITY_LABELS: Record<Severity, string> = {
  none: 'None',
  minor: 'Minor',
  major: 'Major',
  safety: 'Safety',
}

const SEVERITY_COLORS: Record<Severity, string> = {
  none: 'text-text-3',
  minor: 'text-brand-amber',
  major: 'text-brand-crimson',
  safety: 'text-brand-crimson',
}

export default function InspectionPage() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [showExport, setShowExport] = useState(false)

  function updateItem(catName: string, itemId: string, field: keyof CheckItem, value: unknown) {
    setCategories(prev => prev.map(cat => {
      if (cat.name !== catName) return cat
      return {
        ...cat,
        items: cat.items.map(item => item.id === itemId ? { ...item, [field]: value } : item),
      }
    }))
  }

  const allItems = useMemo(() => categories.flatMap(c => c.items), [categories])
  const checkedItems = allItems.filter(i => i.checked)
  const issueItems = checkedItems.filter(i => i.severity !== 'none')
  const totalCost = issueItems.reduce((s, i) => s + i.estimatedCost, 0)
  const bySeverity = {
    minor: issueItems.filter(i => i.severity === 'minor'),
    major: issueItems.filter(i => i.severity === 'major'),
    safety: issueItems.filter(i => i.severity === 'safety'),
  }

  function exportSummary() {
    let text = '=== INSPECTION SUMMARY ===\n\n'
    text += `Items Inspected: ${checkedItems.length} / ${allItems.length}\n`
    text += `Issues Found: ${issueItems.length}\n`
    text += `Estimated Repair Cost: $${totalCost.toLocaleString()}\n\n`
    for (const [sev, items] of Object.entries(bySeverity)) {
      if (items.length === 0) continue
      text += `── ${sev.toUpperCase()} (${items.length}) ──\n`
      items.forEach(item => {
        text += `• ${item.name}${item.estimatedCost > 0 ? ` — $${item.estimatedCost.toLocaleString()}` : ''}`
        if (item.notes) text += ` — ${item.notes}`
        text += '\n'
      })
      text += '\n'
    }
    return text
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/tools/homebuying" className="flex items-center gap-1 text-sm text-text-3 hover:text-text-1 mb-3">
          <ChevronLeft className="w-4 h-4" /> Homebuying Tools
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-brand bg-brand-yellow/10 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-brand-yellow" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Inspection Checklist</h1>
              <p className="text-sm text-text-2">Room-by-room walkthrough with severity ratings.</p>
            </div>
          </div>
          <button
            onClick={() => setShowExport(!showExport)}
            className="flex items-center gap-2 bg-surface-2 text-text-2 border border-surface-3 px-3 py-1.5 rounded text-sm font-medium hover:text-text-1"
          >
            <FileText className="w-4 h-4" /> Export Summary
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-3">
        <Card variant="elevated" className="p-3">
          <p className="text-xs text-text-4 mb-1">Inspected</p>
          <p className="text-xl font-bold text-text-1">{checkedItems.length} <span className="text-sm text-text-4">/ {allItems.length}</span></p>
        </Card>
        <Card variant="elevated" className="p-3 border-brand-amber/30">
          <p className="text-xs text-text-4 mb-1">Minor Issues</p>
          <p className="text-xl font-bold text-brand-amber">{bySeverity.minor.length}</p>
        </Card>
        <Card variant="elevated" className="p-3 border-brand-crimson/30">
          <p className="text-xs text-text-4 mb-1">Major / Safety</p>
          <p className="text-xl font-bold text-brand-crimson">{bySeverity.major.length + bySeverity.safety.length}</p>
        </Card>
        <Card variant="elevated" className="p-3">
          <p className="text-xs text-text-4 mb-1">Est. Repair Cost</p>
          <p className="text-xl font-bold text-text-1">${totalCost.toLocaleString()}</p>
        </Card>
      </div>

      {/* Export panel */}
      {showExport && (
        <Card variant="elevated" className="p-4">
          <p className="font-semibold text-text-1 mb-2 text-sm">Inspection Summary Export</p>
          <pre className="bg-surface-2 rounded p-3 text-xs text-text-2 whitespace-pre-wrap font-mono overflow-auto max-h-64">{exportSummary()}</pre>
        </Card>
      )}

      {/* Categories */}
      <div className="space-y-3">
        {categories.map(cat => {
          const isOpen = !collapsed[cat.name]
          const catIssues = cat.items.filter(i => i.checked && i.severity !== 'none').length
          return (
            <Card key={cat.name} variant="elevated" className="overflow-hidden">
              <button
                onClick={() => setCollapsed(prev => ({ ...prev, [cat.name]: !prev[cat.name] }))}
                className="w-full flex items-center justify-between p-4 hover:bg-surface-2/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronDown className="w-4 h-4 text-text-4" /> : <ChevronRight className="w-4 h-4 text-text-4" />}
                  <span className="font-semibold text-text-1 text-sm">{cat.name}</span>
                  {catIssues > 0 && <Badge variant="crimson" size="sm">{catIssues} issues</Badge>}
                </div>
                <span className="text-xs text-text-4">
                  {cat.items.filter(i => i.checked).length}/{cat.items.length} checked
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-surface-3 divide-y divide-surface-3/50">
                  {cat.items.map(item => (
                    <div key={item.id} className="p-3">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={item.checked}
                          onChange={e => updateItem(cat.name, item.id, 'checked', e.target.checked)}
                          className="rounded" />
                        <span className={`text-sm flex-1 ${item.checked ? 'text-text-1' : 'text-text-3'}`}>{item.name}</span>
                        {item.checked && (
                          <>
                            <select value={item.severity}
                              onChange={e => updateItem(cat.name, item.id, 'severity', e.target.value as Severity)}
                              className={`bg-surface-2 border border-surface-3 rounded px-2 py-1 text-xs ${SEVERITY_COLORS[item.severity]}`}>
                              {(Object.keys(SEVERITY_LABELS) as Severity[]).map(s => (
                                <option key={s} value={s}>{SEVERITY_LABELS[s]}</option>
                              ))}
                            </select>
                            {item.severity === 'safety' && <Badge variant="crimson" size="sm">Safety</Badge>}
                          </>
                        )}
                      </div>
                      {item.checked && item.severity !== 'none' && (
                        <div className="mt-2 ml-6 flex gap-2">
                          <div className="relative w-28">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-4 text-xs">$</span>
                            <input type="number" value={item.estimatedCost} step={100} placeholder="Est. cost"
                              onChange={e => updateItem(cat.name, item.id, 'estimatedCost', parseFloat(e.target.value) || 0)}
                              className="w-full bg-surface-2 border border-surface-3 rounded pl-4 pr-2 py-1 text-xs text-text-1" />
                          </div>
                          <input value={item.notes} placeholder="Notes..."
                            onChange={e => updateItem(cat.name, item.id, 'notes', e.target.value)}
                            className="flex-1 bg-surface-2 border border-surface-3 rounded px-2 py-1 text-xs text-text-1" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
