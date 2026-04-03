'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  RefreshCw,
  Webhook,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Eye,
  EyeOff,
  BookOpen,
  Code2,
  ArrowRight,
} from 'lucide-react';
import { Card, Badge, Button, Input } from '@/components/ui';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Partner API & Webhooks
 *
 * API key management, webhook config, delivery log,
 * and inline API documentation.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const WEBHOOK_EVENTS = [
  { id: 'assessment.completed', label: 'assessment.completed', description: 'Fired when a client finishes an assessment' },
  { id: 'verdict.ready', label: 'verdict.ready', description: 'Fired when a verdict of READY is returned' },
  { id: 'verdict.not_yet', label: 'verdict.not_yet', description: 'Fired when a verdict of NOT YET or STOP is returned' },
];

interface WebhookDelivery {
  id: string;
  event: string;
  status: 'success' | 'failed' | 'pending';
  httpCode: number;
  timestamp: string;
  duration: string;
}

const MOCK_DELIVERIES: WebhookDelivery[] = [
  { id: 'd1', event: 'assessment.completed', status: 'success', httpCode: 200, timestamp: '2 min ago', duration: '124ms' },
  { id: 'd2', event: 'verdict.ready', status: 'success', httpCode: 200, timestamp: '1 hour ago', duration: '89ms' },
  { id: 'd3', event: 'assessment.completed', status: 'failed', httpCode: 500, timestamp: '3 hours ago', duration: '2,340ms' },
  { id: 'd4', event: 'verdict.not_yet', status: 'success', httpCode: 200, timestamp: '5 hours ago', duration: '156ms' },
  { id: 'd5', event: 'assessment.completed', status: 'success', httpCode: 200, timestamp: '8 hours ago', duration: '98ms' },
  { id: 'd6', event: 'verdict.ready', status: 'success', httpCode: 200, timestamp: '12 hours ago', duration: '112ms' },
  { id: 'd7', event: 'assessment.completed', status: 'success', httpCode: 200, timestamp: '1 day ago', duration: '134ms' },
  { id: 'd8', event: 'verdict.not_yet', status: 'failed', httpCode: 502, timestamp: '1 day ago', duration: '5,001ms' },
  { id: 'd9', event: 'assessment.completed', status: 'success', httpCode: 200, timestamp: '2 days ago', duration: '78ms' },
  { id: 'd10', event: 'verdict.ready', status: 'success', httpCode: 200, timestamp: '2 days ago', duration: '145ms' },
];

const EXAMPLE_SCORE_RESPONSE = `{
  "id": "assess_7f3k9x2m",
  "score": 73,
  "verdict": "ALMOST_THERE",
  "dimensions": {
    "financial": { "score": 82, "weight": 0.40 },
    "emotional": { "score": 61, "weight": 0.35 },
    "timing":    { "score": 77, "weight": 0.25 }
  },
  "decision_type": "home_purchase",
  "created_at": "2026-04-03T14:30:00Z"
}`;

const EXAMPLE_CHECK_RESPONSE = `{
  "client_id": "ext_abc123",
  "is_ready": false,
  "verdict": "ALMOST_THERE",
  "latest_score": 73,
  "assessments_count": 3,
  "last_assessed_at": "2026-04-03T14:30:00Z"
}`;

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PartnerAPIPage() {
  const [showKey, setShowKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.apexfinancial.com/webhooks/homi');
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(
    new Set(['assessment.completed', 'verdict.ready'])
  );

  function toggleEvent(eventId: string) {
    setSelectedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  }

  const maskedKey = 'sk_partner_' + (showKey ? 'live_8f7g2h4j6k9m1n3p5r_abc123' : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022abc123');

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
          API &amp; Webhooks
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
          Integrate H&#x14D;MI assessments into your platform
        </p>
      </motion.div>

      {/* API Key */}
      <motion.div variants={fadeUp}>
        <Card
          padding="md"
          header={
            <div className="flex items-center gap-2">
              <Key size={16} style={{ color: 'var(--cyan, #22d3ee)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                API Key
              </span>
            </div>
          }
        >
          <div className="flex items-center gap-3">
            <div
              className="flex-1 rounded-lg px-4 py-2.5 font-mono text-sm"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', color: 'var(--cyan, #22d3ee)' }}
            >
              {maskedKey}
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? 'Hide' : 'Reveal'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Copy size={14} />}
            >
              Copy
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<RefreshCw size={14} />}
            >
              Regenerate Key
            </Button>
          </div>
          <p className="mt-3 text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
            Include this key in the <code className="text-[var(--cyan)] bg-[rgba(15,23,42,0.8)] px-1 rounded">x-api-key</code> header with every request.
          </p>
        </Card>
      </motion.div>

      {/* Webhooks */}
      <motion.div variants={fadeUp}>
        <Card
          padding="md"
          header={
            <div className="flex items-center gap-2">
              <Webhook size={16} style={{ color: 'var(--emerald, #34d399)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                Webhook Configuration
              </span>
            </div>
          }
        >
          <div className="space-y-4">
            {/* URL */}
            <Input
              label="Webhook URL"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-api.com/webhooks/homi"
              fullWidth
            />

            {/* Events */}
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                Events
              </p>
              <div className="space-y-2">
                {WEBHOOK_EVENTS.map((event) => (
                  <label
                    key={event.id}
                    className="flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvents.has(event.id)}
                      onChange={() => toggleEvent(event.id)}
                      className="size-4 rounded cursor-pointer accent-[#22d3ee]"
                    />
                    <div>
                      <code className="text-xs font-mono" style={{ color: 'var(--cyan, #22d3ee)' }}>
                        {event.label}
                      </code>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                        {event.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button variant="primary" size="sm" icon={<Play size={14} />}>
              Test Webhook
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Webhook Delivery Log */}
      <motion.div variants={fadeUp}>
        <Card
          padding="sm"
          header={
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                Webhook Delivery Log
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                Last 10 deliveries
              </span>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(34, 211, 238, 0.1)' }}>
                  {['Status', 'Event', 'HTTP', 'Duration', 'Time'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary, #94a3b8)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_DELIVERIES.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b"
                    style={{ borderColor: 'rgba(34, 211, 238, 0.06)' }}
                  >
                    <td className="px-4 py-2.5">
                      {d.status === 'success' ? (
                        <CheckCircle2 size={16} style={{ color: 'var(--emerald, #34d399)' }} />
                      ) : d.status === 'failed' ? (
                        <XCircle size={16} style={{ color: 'var(--homi-crimson, #ef4444)' }} />
                      ) : (
                        <Clock size={16} style={{ color: 'var(--yellow, #facc15)' }} />
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <code className="text-xs font-mono" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                        {d.event}
                      </code>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={d.httpCode < 400 ? 'success' : 'danger'}>{d.httpCode}</Badge>
                    </td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                      {d.duration}
                    </td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                      {d.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* API Documentation */}
      <motion.div variants={fadeUp}>
        <Card
          padding="md"
          header={
            <div className="flex items-center gap-2">
              <BookOpen size={16} style={{ color: 'var(--yellow, #facc15)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                API Reference
              </span>
            </div>
          }
        >
          <div className="space-y-8">
            {/* Endpoint 1: Score an assessment */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}
                >
                  POST
                </span>
                <code className="text-sm font-mono" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  /api/v1/readiness/score
                </code>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                Score an assessment and return the readiness verdict.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  Headers
                </p>
                <div className="rounded-lg p-3 font-mono text-xs" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                  <p><span style={{ color: 'var(--cyan)' }}>x-api-key</span>: <span style={{ color: 'var(--text-secondary)' }}>sk_partner_... (required)</span></p>
                  <p><span style={{ color: 'var(--cyan)' }}>Content-Type</span>: <span style={{ color: 'var(--text-secondary)' }}>application/json</span></p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  Response
                </p>
                <pre
                  className="rounded-lg p-4 text-xs font-mono overflow-x-auto"
                  style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', color: 'var(--emerald, #34d399)' }}
                >
                  {EXAMPLE_SCORE_RESPONSE}
                </pre>
              </div>
            </div>

            {/* Divider */}
            <hr style={{ borderColor: 'rgba(34, 211, 238, 0.08)' }} />

            {/* Endpoint 2: Check readiness */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: 'rgba(34, 211, 238, 0.15)', color: '#22d3ee' }}
                >
                  GET
                </span>
                <code className="text-sm font-mono" style={{ color: 'var(--text-primary, #e2e8f0)' }}>
                  /api/v1/readiness/check
                </code>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                Check the current readiness status for a client.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  Headers
                </p>
                <div className="rounded-lg p-3 font-mono text-xs" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                  <p><span style={{ color: 'var(--cyan)' }}>x-api-key</span>: <span style={{ color: 'var(--text-secondary)' }}>sk_partner_... (required)</span></p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  Query Parameters
                </p>
                <div className="rounded-lg p-3 font-mono text-xs" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                  <p><span style={{ color: 'var(--cyan)' }}>client_id</span>: <span style={{ color: 'var(--text-secondary)' }}>string (required) - External client identifier</span></p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                  Response
                </p>
                <pre
                  className="rounded-lg p-4 text-xs font-mono overflow-x-auto"
                  style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', color: 'var(--emerald, #34d399)' }}
                >
                  {EXAMPLE_CHECK_RESPONSE}
                </pre>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
