'use client'

import { useState } from 'react'

import { useNotifications } from '@/lib/notifications/hooks'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { 
  Bell, 
  CheckCircle2, 
  Trash2, 
  CheckCheck,
  FileCheck,
  MessageSquare,
  Sparkles,
  Users,
  Calendar,
  AlertCircle,
  Inbox
} from 'lucide-react'
import Link from 'next/link'

const notificationIcons: Record<string, typeof Bell> = {
  assessment_complete: FileCheck,
  verdict_ready: CheckCircle2,
  transformation_milestone: Sparkles,
  couple_invite: Users,
  reassess_reminder: Calendar,
  system: AlertCircle,
}

const notificationColors: Record<string, string> = {
  assessment_complete: 'text-cyan-400 bg-cyan-500/10',
  verdict_ready: 'text-emerald-400 bg-emerald-500/10',
  transformation_milestone: 'text-yellow-400 bg-yellow-500/10',
  couple_invite: 'text-purple-400 bg-purple-500/10',
  reassess_reminder: 'text-orange-400 bg-orange-500/10',
  system: 'text-slate-400 bg-slate-500/10',
}

const notificationLabels: Record<string, string> = {
  assessment_complete: 'Assessment',
  verdict_ready: 'Verdict',
  transformation_milestone: 'Milestone',
  couple_invite: 'Couples',
  reassess_reminder: 'Reminder',
  system: 'System',
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications()

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId)
  }

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const renderNotification = (notification: typeof notifications[0], index: number) => {
    const Icon = notificationIcons[notification.type] || Bell
    const colorClass = notificationColors[notification.type] || notificationColors.system
    const isUnread = !notification.read

    return (
      <div
        key={notification.id}
        className="animate-in fade-in slide-in-from-bottom"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <Card
          className={`transition-all ${
            isUnread 
              ? 'bg-cyan-500/5 border-cyan-500/20' 
              : 'bg-surface-800 border-surface-700'
          }`}
        >
          <div className="p-4">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className={`font-semibold ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                    {notification.title}
                  </h4>
                  <Badge variant="default" className="text-xs">
                    {notificationLabels[notification.type]}
                  </Badge>
                  {isUnread && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </div>

                <p className="text-slate-400 mb-2">{notification.body}</p>

                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>
                    {new Date(notification.created_at).toLocaleDateString()} at{' '}
                    {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {notification.action_url && (
                    <Link 
                      href={notification.action_url}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      onClick={() => isUnread && markAsRead(notification.id)}
                    >
                      View Details →
                    </Link>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {isUnread && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Notifications</h1>
          <p className="text-slate-400">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'No new notifications'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Tabs */}
          <div className="flex bg-surface-800 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Unread
            </button>
          </div>

          {/* Mark All Read */}
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              onClick={handleMarkAllAsRead}
              className="text-cyan-400 hover:text-cyan-300"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-surface-800 flex items-center justify-center mx-auto mb-6">
            <Inbox className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-slate-400 max-w-md mx-auto">
            {filter === 'unread' 
              ? 'You&apos;ve read all your notifications. Great job staying on top of things!' 
              : 'We&apos;ll notify you when there are updates about your assessments, milestones, and more.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification, index) => 
            renderNotification(notification, index)
          )}
        </div>
      )}
    </div>
  )
}
