'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { AssessmentReport } from '@/lib/pdf/AssessmentReport'
import { FileDown, CheckCircle2 } from 'lucide-react'

interface PDFDownloadButtonProps {
  assessment: {
    id: string
    decision_type: string
    financial_score: number
    emotional_score: number
    timing_score: number
    overall_score: number
    verdict: 'ready' | 'not_yet'
    financial_sub_scores?: any
    emotional_sub_scores?: any
    timing_sub_scores?: any
    insights?: any
    completed_at: string
  }
  userName: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PDFDownloadButton({
  assessment,
  userName,
  variant = 'secondary',
  size = 'md',
  className,
}: PDFDownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    
    try {
      // Generate PDF blob
      const blob = await pdf(
        <AssessmentReport assessment={assessment} userName={userName} />
      ).toBlob()

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `homi-assessment-${assessment.id.slice(0, 8)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 3000)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          Generating PDF...
        </>
      ) : downloaded ? (
        <>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Downloaded!
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4 mr-2" />
          Download Report
        </>
      )}
    </Button>
  )
}
