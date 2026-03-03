'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { 
  Users, 
  Plus, 
  Key, 
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle,
  Building2
} from 'lucide-react'

interface Partner {
  id: string
  name: string
  email: string
  website: string | null
  status: 'active' | 'suspended' | 'inactive'
  created_at: string
  api_keys: Array<{
    id: string
    key_prefix: string
    is_active: boolean
    rate_limit: number
  }>
}

export default function PartnersAdminPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPartner, setNewPartner] = useState({
    name: '',
    email: '',
    website: '',
    companyName: '',
  })
  const [creating, setCreating] = useState(false)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partners')
      if (response.ok) {
        const data = await response.json()
        setPartners(data.partners || [])
      }
    } catch (error) {
      console.error('Error fetching partners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPartner),
      })

      if (response.ok) {
        const data = await response.json()
        setNewApiKey(data.apiKey)
        setPartners(prev => [data.partner, ...prev])
        setNewPartner({ name: '', email: '', website: '', companyName: '' })
      }
    } catch (error) {
      console.error('Error creating partner:', error)
    } finally {
      setCreating(false)
    }
  }

  const copyApiKey = () => {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Partner Management</h1>
            <p className="text-slate-400">Manage B2B partners and API access</p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Partner
        </Button>
      </div>

      {/* Create Partner Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
          <Card variant="elevated">
            <form onSubmit={handleCreate} className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Create New Partner</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Partner Name</label>
                  <Input
                    value={newPartner.name}
                    onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                    placeholder="e.g., Acme Financial"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Email</label>
                  <Input
                    type="email"
                    value={newPartner.email}
                    onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                    placeholder="partner@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Website</label>
                  <Input
                    value={newPartner.website}
                    onChange={(e) => setNewPartner({ ...newPartner, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Company Name (for branding)</label>
                  <Input
                    value={newPartner.companyName}
                    onChange={(e) => setNewPartner({ ...newPartner, companyName: e.target.value })}
                    placeholder="Acme Financial Advisors"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="primary" disabled={creating}>
                  {creating ? <Spinner size="sm" className="mr-2" /> : null}
                  Create Partner
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* API Key Display */}
      {newApiKey && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-emerald-500/10 border-emerald-500/30">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-emerald-400">API Key Generated</h3>
              </div>
              <p className="text-slate-400 text-sm mb-3">
                Copy this key now. It will not be shown again.
              </p>
              <div className="flex items-center gap-3">
                <code className="flex-1 p-3 bg-surface-900 rounded-lg text-sm text-white font-mono break-all">
                  {newApiKey}
                </code>
                <button
                  onClick={copyApiKey}
                  className="p-3 rounded-lg bg-surface-800 text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Partners List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Partners ({partners.length})
        </h3>

        {partners.length === 0 ? (
          <Card className="text-center py-12">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No partners yet</p>
            <p className="text-slate-500 text-sm">Add your first B2B partner to get started</p>
          </Card>
        ) : (
          partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:border-cyan-500/30 transition-colors">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">{partner.name}</h4>
                        <Badge 
                          'emerald'
                          className="text-xs"
                        >
                          {partner.status}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm">{partner.email}</p>
                      {partner.website && (
                        <a 
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 text-sm flex items-center gap-1 mt-1 hover:underline"
                        >
                          {partner.website}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-sm">
                        Created {new Date(partner.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        {partner.api_keys?.length || 0} API keys
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
