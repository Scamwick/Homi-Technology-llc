'use client'

import { useState } from 'react'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Calculator, DollarSign, Wallet, PiggyBank, CreditCard, Target } from 'lucide-react'

interface SimulationInputFormProps {
  assessmentId: string
  decisionType: string
  onSimulationComplete: (results: any) => void
}

interface FormData {
  monthlyIncome: string
  monthlyExpenses: string
  currentSavings: string
  currentDebt: string
  targetAmount: string
}

export function SimulationInputForm({ assessmentId, decisionType, onSimulationComplete }: SimulationInputFormProps) {
  const [formData, setFormData] = useState<FormData>({
    monthlyIncome: '',
    monthlyExpenses: '',
    currentSavings: '',
    currentDebt: '',
    targetAmount: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof FormData, value: string) => {
    // Only allow numbers and decimals
    if (value && !/^\d*\.?\d*$/.test(value)) return
    
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const formatCurrency = (value: string) => {
    if (!value) return ''
    const num = parseFloat(value)
    if (isNaN(num)) return ''
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate inputs
    const monthlyIncome = parseFloat(formData.monthlyIncome)
    const monthlyExpenses = parseFloat(formData.monthlyExpenses)
    const currentSavings = parseFloat(formData.currentSavings) || 0
    const currentDebt = parseFloat(formData.currentDebt) || 0
    const targetAmount = parseFloat(formData.targetAmount)

    if (!monthlyIncome || monthlyIncome <= 0) {
      setError('Please enter a valid monthly income')
      setLoading(false)
      return
    }

    if (!monthlyExpenses || monthlyExpenses <= 0) {
      setError('Please enter valid monthly expenses')
      setLoading(false)
      return
    }

    if (!targetAmount || targetAmount <= 0) {
      setError('Please enter a valid target amount')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/simulation/monte-carlo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          userInputs: {
            monthlyIncome,
            monthlyExpenses,
            currentSavings,
            currentDebt,
            targetAmount,
          },
          iterations: 10000,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to run simulation')
      }

      const results = await response.json()
      onSimulationComplete(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getDecisionLabel = () => {
    const labels: Record<string, string> = {
      home_buying: 'Home Purchase',
      career_change: 'Career Transition',
      investment: 'Investment',
      business_launch: 'Business Launch',
      major_purchase: 'Major Purchase',
    }
    return labels[decisionType] || 'Decision'
  }

  return (
    <Card variant="elevated">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Financial Simulation</h3>
            <p className="text-slate-400 text-sm">
              Run 10,000 scenarios for your {getDecisionLabel().toLowerCase()}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Monthly Income
              </label>
              <Input
                type="text"
                placeholder="e.g., 5000"
                value={formData.monthlyIncome}
                onChange={(e) => handleChange('monthlyIncome', e.target.value)}
                disabled={loading}
              />
              {formData.monthlyIncome && (
                <p className="text-xs text-slate-500 mt-1">
                  {formatCurrency(formData.monthlyIncome)}/month
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Wallet className="w-4 h-4 inline mr-1" />
                Monthly Expenses
              </label>
              <Input
                type="text"
                placeholder="e.g., 3500"
                value={formData.monthlyExpenses}
                onChange={(e) => handleChange('monthlyExpenses', e.target.value)}
                disabled={loading}
              />
              {formData.monthlyExpenses && (
                <p className="text-xs text-slate-500 mt-1">
                  {formatCurrency(formData.monthlyExpenses)}/month
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <PiggyBank className="w-4 h-4 inline mr-1" />
                Current Savings
              </label>
              <Input
                type="text"
                placeholder="e.g., 25000"
                value={formData.currentSavings}
                onChange={(e) => handleChange('currentSavings', e.target.value)}
                disabled={loading}
              />
              {formData.currentSavings && (
                <p className="text-xs text-slate-500 mt-1">
                  {formatCurrency(formData.currentSavings)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <CreditCard className="w-4 h-4 inline mr-1" />
                Current Debt
              </label>
              <Input
                type="text"
                placeholder="e.g., 5000 (optional)"
                value={formData.currentDebt}
                onChange={(e) => handleChange('currentDebt', e.target.value)}
                disabled={loading}
              />
              {formData.currentDebt && (
                <p className="text-xs text-slate-500 mt-1">
                  {formatCurrency(formData.currentDebt)}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Target Amount ({getDecisionLabel()})
            </label>
            <Input
              type="text"
              placeholder={decisionType === 'home_buying' ? 'e.g., 60000 (down payment)' : 'e.g., 50000'}
              value={formData.targetAmount}
              onChange={(e) => handleChange('targetAmount', e.target.value)}
              disabled={loading}
            />
            {formData.targetAmount && (
              <p className="text-xs text-slate-500 mt-1">
                {formatCurrency(formData.targetAmount)}
              </p>
            )}
          </div>

          {/* Quick Stats Preview */}
          {formData.monthlyIncome && formData.monthlyExpenses && (
            <div
              className="p-4 bg-surface-800/50 rounded-lg"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-400">Monthly Savings</p>
                  <p className={`text-sm font-medium ${
                    parseFloat(formData.monthlyIncome) - parseFloat(formData.monthlyExpenses) > 0 
                      ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {formatCurrency(
                      String(parseFloat(formData.monthlyIncome || '0') - parseFloat(formData.monthlyExpenses || '0'))
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Savings Rate</p>
                  <p className="text-sm font-medium text-cyan-400">
                    {((parseFloat(formData.monthlyIncome || '0') - parseFloat(formData.monthlyExpenses || '0')) / 
                      parseFloat(formData.monthlyIncome || '1') * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Net Worth</p>
                  <p className="text-sm font-medium text-white">
                    {formatCurrency(
                      String(parseFloat(formData.currentSavings || '0') - parseFloat(formData.currentDebt || '0'))
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg"
            >
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Running 10,000 Simulations...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Run Simulation
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
