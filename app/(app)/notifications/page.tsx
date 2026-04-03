'use client';

import { useState, useCallback } from 'react';
import {
  ClipboardCheck,
  CalendarClock,
  Bot,
  Heart,
  TrendingUp,
  BarChart3,
  Shield,
  Settings,
  CheckCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Notifications — Notification center for the HōMI app.
 *
 * Filter tabs: All / Unread / Assessments / Agent / System
 * Each notification has: icon, title, body, timestamp, read/unread dot.
 * Click to expand details.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type NotificationCategory = 'assessment' | 'agent' | 'system';

interface Notification {
  id: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  detail: string;
  timestamp: string;
  read: boolean;
  category: NotificationCategory;
}

type FilterTab = 'all' | 'unread' | 'assessment' | 'agent' | 'system';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'assessment', label: 'Assessments' },
  { key: 'agent', label: 'Agent' },
  { key: 'system', label: 'System' },
];

const ICON_CLASS = 'shrink-0';

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    icon: <ClipboardCheck size={20} className={`${ICON_CLASS} text-cyan`} />,
    title: 'Assessment Complete',
    body: 'Your HōMI-Score is 73 (ALMOST THERE)',
    detail:
      'Your latest assessment across Financial Reality, Emotional Clarity, and Timing Awareness has been scored. Financial Reality: 82, Emotional Clarity: 68, Timing Awareness: 69. Overall verdict: ALMOST THERE. Two of three dimensions are below the 70 threshold.',
    timestamp: '2 hours ago',
    read: false,
    category: 'assessment',
  },
  {
    id: '2',
    icon: <CalendarClock size={20} className={`${ICON_CLASS} text-yellow-400`} />,
    title: 'Reassessment Reminder',
    body: "It's been 30 days since your last check",
    detail:
      'Regular reassessments help you track progress and catch changes in your readiness posture. Your last assessment was completed on March 3, 2026. We recommend reassessing monthly to maintain an accurate HōMI-Score.',
    timestamp: '1 day ago',
    read: false,
    category: 'assessment',
  },
  {
    id: '3',
    icon: <Bot size={20} className={`${ICON_CLASS} text-emerald-400`} />,
    title: 'Agent Action',
    body: 'Inbox Manager processed 12 emails',
    detail:
      'Your Inbox Manager agent processed 12 incoming emails: 3 flagged as action-required, 5 auto-filed to project folders, 2 marked as low-priority, and 2 identified as potential spam. No items require your immediate attention.',
    timestamp: '3 hours ago',
    read: false,
    category: 'agent',
  },
  {
    id: '4',
    icon: <Heart size={20} className={`${ICON_CLASS} text-pink-400`} />,
    title: 'Couple Invite',
    body: 'Sarah invited you to couples mode',
    detail:
      'Sarah has sent you an invitation to link your HōMI profiles in Couples Mode. This allows you to view shared financial readiness, align on decisions together, and receive joint recommendations. Accept or decline from your Settings page.',
    timestamp: '5 hours ago',
    read: false,
    category: 'system',
  },
  {
    id: '5',
    icon: <TrendingUp size={20} className={`${ICON_CLASS} text-emerald-400`} />,
    title: 'Milestone',
    body: 'Your emergency fund reached 3 months!',
    detail:
      'Congratulations! Your emergency fund has reached the 3-month coverage milestone. This is a significant achievement for Financial Reality. Your savings buffer went from 2.4 months to 3.0 months over the past 45 days. Next milestone: 6 months.',
    timestamp: '2 days ago',
    read: true,
    category: 'assessment',
  },
  {
    id: '6',
    icon: <BarChart3 size={20} className={`${ICON_CLASS} text-cyan`} />,
    title: 'Score Improved',
    body: 'Financial Reality went from 71 to 82',
    detail:
      'Your Financial Reality dimension improved by 11 points, moving from 71 to 82. Key drivers: emergency fund growth (+4 pts), debt-to-income ratio improvement (+3 pts), and updated insurance coverage (+4 pts). You are now above the READY threshold for this dimension.',
    timestamp: '3 days ago',
    read: true,
    category: 'assessment',
  },
  {
    id: '7',
    icon: <Shield size={20} className={`${ICON_CLASS} text-yellow-400`} />,
    title: 'Trinity Update',
    body: 'New Arbiter analysis available',
    detail:
      'The Arbiter has completed a new analysis of your decision readiness posture. This analysis cross-references your latest assessment data with market conditions and personal timing signals. View the full Trinity report from your dashboard.',
    timestamp: '4 days ago',
    read: true,
    category: 'agent',
  },
  {
    id: '8',
    icon: <Settings size={20} className={`${ICON_CLASS} text-text-secondary`} />,
    title: 'System',
    body: 'HōMI v2.1 released with new tools',
    detail:
      'HōMI v2.1 includes: new Debt Payoff Calculator tool, improved assessment question flow, Couples Mode beta, and performance improvements across the dashboard. See the full changelog in Settings.',
    timestamp: '1 week ago',
    read: true,
    category: 'system',
  },
];

/* ── Notification row component ─────────────────────────────────────────── */

function NotificationRow({
  notification,
  expanded,
  onToggle,
  onMarkRead,
}: {
  notification: Notification;
  expanded: boolean;
  onToggle: () => void;
  onMarkRead: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        onToggle();
        if (!notification.read) onMarkRead();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
          if (!notification.read) onMarkRead();
        }
      }}
      className="cursor-pointer transition-colors duration-150 hover:bg-[rgba(30,41,59,0.7)]"
      style={{
        borderBottom: '1px solid rgba(30, 41, 59, 0.6)',
      }}
    >
      <div className="flex items-start gap-3 px-4 py-4 sm:px-6">
        {/* Unread dot */}
        <div className="flex w-2 shrink-0 items-center pt-1">
          {!notification.read && (
            <span
              className="block h-2 w-2 rounded-full"
              style={{ backgroundColor: '#22d3ee' }}
              aria-label="Unread"
            />
          )}
        </div>

        {/* Icon */}
        <div className="pt-0.5">{notification.icon}</div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3
              className={`text-sm font-semibold ${
                notification.read ? 'text-text-primary' : 'text-white'
              }`}
            >
              {notification.title}
            </h3>
            <span className="shrink-0 text-xs text-text-secondary">
              {notification.timestamp}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-text-secondary">{notification.body}</p>

          {/* Expanded detail */}
          {expanded && (
            <div
              className="mt-3 rounded-lg px-4 py-3 text-sm leading-relaxed text-text-primary"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(34, 211, 238, 0.1)',
              }}
            >
              {notification.detail}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  /* ── Filter logic ── */
  const filtered = notifications.filter((n) => {
    switch (activeTab) {
      case 'unread':
        return !n.read;
      case 'assessment':
        return n.category === 'assessment';
      case 'agent':
        return n.category === 'agent';
      case 'system':
        return n.category === 'system';
      default:
        return true;
    }
  });

  return (
    <div className="mx-auto max-w-3xl">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="info" dot>
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<CheckCheck size={16} />}
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          Mark all read
        </Button>
      </div>

      {/* ── Filter tabs ── */}
      <div
        className="mt-6 flex gap-1 overflow-x-auto rounded-lg p-1"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
      >
        {FILTER_TABS.map(({ key, label }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-slate-mid text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Notification list ── */}
      <div
        className="mt-4 overflow-hidden rounded-xl"
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid rgba(34, 211, 238, 0.1)',
        }}
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <CheckCheck size={32} className="text-slate-mid" />
            <p className="text-sm text-text-secondary">
              {activeTab === 'unread'
                ? "You're all caught up."
                : 'No notifications in this category.'}
            </p>
          </div>
        ) : (
          filtered.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              expanded={expandedId === n.id}
              onToggle={() => toggleExpanded(n.id)}
              onMarkRead={() => markRead(n.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
