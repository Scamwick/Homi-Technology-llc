'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Palette,
  Type,
  MessageSquare,
  Eye,
  Info,
  Shield,
} from 'lucide-react';
import { Card, Input, Button } from '@/components/ui';
import type { PartnerBrandingData } from '@/lib/data/partner';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Partner Branding Content (Client Component)
 *
 * Logo upload, color picker, company name, welcome message,
 * live preview, and mandatory "Powered by HoMI" badge.
 * Data comes from server via props.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

interface PartnerBrandingContentProps {
  data: PartnerBrandingData;
}

export default function PartnerBrandingContent({ data }: PartnerBrandingContentProps) {
  const [companyName, setCompanyName] = useState(data.companyName);
  const [primaryColor, setPrimaryColor] = useState(data.primaryColor);
  const [welcomeMessage, setWelcomeMessage] = useState(data.welcomeMessage);

  return (
    <motion.div
      className="mx-auto w-full max-w-6xl space-y-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Page header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
          Branding
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
          Customize the assessment experience for your clients
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Column */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <motion.div variants={fadeUp}>
            <Card
              padding="md"
              header={
                <div className="flex items-center gap-2">
                  <Upload size={16} style={{ color: 'var(--cyan, #22d3ee)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                    Company Logo
                  </span>
                </div>
              }
            >
              <div
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer"
                style={{ borderColor: 'rgba(34, 211, 238, 0.2)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.2)'; }}
              >
                {data.logoUrl ? (
                  <img src={data.logoUrl} alt="Company logo" className="max-h-16 object-contain mb-3" />
                ) : (
                  <Upload size={32} style={{ color: 'var(--text-secondary, #94a3b8)' }} />
                )}
                <p className="mt-3 text-sm font-medium" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  Drop your logo here or click to upload
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  SVG, PNG, or JPG (max 2MB, recommended 200x60px)
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Primary Color */}
          <motion.div variants={fadeUp}>
            <Card
              padding="md"
              header={
                <div className="flex items-center gap-2">
                  <Palette size={16} style={{ color: 'var(--cyan, #22d3ee)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                    Primary Color
                  </span>
                </div>
              }
            >
              <div className="flex items-center gap-4">
                <div
                  className="size-12 rounded-lg border-2 shrink-0 cursor-pointer"
                  style={{
                    backgroundColor: primaryColor,
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                />
                <Input
                  label="Hex Color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#3b82f6"
                  fullWidth
                />
              </div>
              <div className="flex items-start gap-2 mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(250, 204, 21, 0.06)' }}>
                <Info size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--yellow, #facc15)' }} />
                <p className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  The three assessment dimensions (Financial, Emotional, Timing) always use
                  H&#x14D;MI brand colors and cannot be customized.
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Company Name */}
          <motion.div variants={fadeUp}>
            <Card
              padding="md"
              header={
                <div className="flex items-center gap-2">
                  <Type size={16} style={{ color: 'var(--cyan, #22d3ee)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                    Company Name
                  </span>
                </div>
              }
            >
              <Input
                label="Display Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company Name"
                fullWidth
              />
            </Card>
          </motion.div>

          {/* Welcome Message */}
          <motion.div variants={fadeUp}>
            <Card
              padding="md"
              header={
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} style={{ color: 'var(--cyan, #22d3ee)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                    Welcome Message
                  </span>
                </div>
              }
            >
              <label className="block mb-1.5 text-sm font-medium" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                Greeting Text
              </label>
              <textarea
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={3}
                className="w-full rounded-[var(--radius-md)] border px-3 py-2.5 text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--slate, #1e293b)',
                  color: 'var(--text-primary, #e2e8f0)',
                  borderColor: 'var(--slate-light, #334155)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--cyan, #22d3ee)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--slate-light, #334155)';
                }}
              />
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Button variant="cta" size="md" fullWidth>
              Save Branding Settings
            </Button>
          </motion.div>
        </div>

        {/* Live Preview Column */}
        <div className="space-y-6">
          <motion.div variants={fadeUp}>
            <Card
              padding="md"
              header={
                <div className="flex items-center gap-2">
                  <Eye size={16} style={{ color: 'var(--cyan, #22d3ee)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                    Live Preview
                  </span>
                </div>
              }
            >
              {/* Branded Assessment Entry Preview */}
              <div
                className="rounded-xl border p-6 space-y-5"
                style={{
                  backgroundColor: 'rgba(10, 22, 40, 0.9)',
                  borderColor: 'rgba(34, 211, 238, 0.1)',
                }}
              >
                {/* Company header */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-10 items-center justify-center rounded-lg text-sm font-bold"
                    style={{ backgroundColor: primaryColor, color: '#0a1628' }}
                  >
                    {companyName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                      {companyName || 'Your Company'}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                      Decision Readiness Assessment
                    </p>
                  </div>
                </div>

                {/* Welcome message */}
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  {welcomeMessage || 'Welcome to your assessment.'}
                </p>

                {/* Mock assessment button */}
                <button
                  type="button"
                  className="w-full rounded-lg py-3 text-sm font-semibold transition-opacity cursor-default"
                  style={{ backgroundColor: primaryColor, color: '#0a1628' }}
                >
                  Begin Assessment
                </button>

                {/* Dimension colors preview */}
                <div className="space-y-2">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                    Assessment Dimensions
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg p-2.5 text-center" style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}>
                      <div className="size-3 mx-auto rounded-full mb-1.5" style={{ backgroundColor: '#22d3ee' }} />
                      <p className="text-[10px] font-medium" style={{ color: '#22d3ee' }}>Financial</p>
                    </div>
                    <div className="rounded-lg p-2.5 text-center" style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)' }}>
                      <div className="size-3 mx-auto rounded-full mb-1.5" style={{ backgroundColor: '#34d399' }} />
                      <p className="text-[10px] font-medium" style={{ color: '#34d399' }}>Emotional</p>
                    </div>
                    <div className="rounded-lg p-2.5 text-center" style={{ backgroundColor: 'rgba(250, 204, 21, 0.1)' }}>
                      <div className="size-3 mx-auto rounded-full mb-1.5" style={{ backgroundColor: '#facc15' }} />
                      <p className="text-[10px] font-medium" style={{ color: '#facc15' }}>Timing</p>
                    </div>
                  </div>
                </div>

                {/* Powered by HoMI badge (always shown, not removable) */}
                <div
                  className="flex items-center justify-center gap-1.5 pt-3 border-t"
                  style={{ borderColor: 'rgba(34, 211, 238, 0.08)' }}
                >
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                    Powered by
                  </span>
                  <span
                    className="text-xs font-bold tracking-wide"
                    style={{
                      background: 'linear-gradient(135deg, #22d3ee, #34d399)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    H&#x14D;MI
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Badge info */}
          <motion.div variants={fadeUp}>
            <div
              className="flex items-start gap-3 rounded-xl p-4 border"
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                borderColor: 'rgba(34, 211, 238, 0.1)',
              }}
            >
              <Shield size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--cyan, #22d3ee)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  &quot;Powered by H&#x14D;MI&quot; Badge
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  This badge is always displayed on client-facing assessment pages and cannot
                  be removed. It ensures transparency about the underlying intelligence platform.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
