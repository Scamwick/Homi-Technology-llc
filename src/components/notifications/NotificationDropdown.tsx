'use client'

import { useState, useRef, useEffect } from 'react'

import { useNotifications, useRealtimeNotifications } from '@/lib/notifications/hooks'
import { Notification } from '@/types/database'
import { 
  Bell, 
  CheckCircle2, 
  X, 
  Trash2, 
  CheckCheck,
  FileCheck,
  MessageSquare,
  Sparkles,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
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

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    refetch 
  } = useNotifications()
  
  const { newNotification, clearNewNotification } = useRealtimeNotifications()

  // Handle new real-time notification
  useEffect(() => {
    if (newNotification) {
      refetch()
      clearNewNotification()
    }
  }, [newNotification, refetch, clearNewNotification])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    await markAsRead(notificationId)
  }

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    await deleteNotification(notificationId)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const renderNotification = (notification: Notification) => {
    const Icon = notificationIcons[notification.type] || Bell
    const colorClass = notificationColors[notification.type] || notificationColors.system
    const isUnread = !notification.read

    const content = (
      <div
        className={`p-3 rounded-lg transition-all ${
          isUnread 
            ? 'bg-cyan-500/5 border border-cyan-500/20' 
            : 'bg-surface-800/50 border border-transparent hover:bg-surface-700/50'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${colorClass} flex items-center justify-center`}>
            <Icon className="w-4 h-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${isUnread ? 'text-white' : 'text-slate-300'}`}>
              {notification.title}
            </p>
            <p className="text-xs text-slate-400 line-clamp-2">{notification.body}</p>
            <p className="text-xs text-slate-500 mt-1">
              {new Date(notification.created_at).toLocaleDateString()} at{' '}
              {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isUnread && (
              <button
                onClick={(e) => handleMarkAsRead(e, notification.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                title="Mark as read"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={(e) => handleDelete(e, notification.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )

    if (notification.action_url) {
      return (
        <Link
          key={notification.id}
          href={notification.action_url}
          onClick={() => !notification.read && markAsRead(notification.id)}
          className="block"
        >
          {content}
        </Link>
      )
    }

    return <div key={notification.id}>{content}</div>
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800 transition-colors"
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-cyan-500 text-white text-xs font-medium flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Pulse Animation for New Notifications */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        )}
      </button>

      {/* Dropdown */}
      
        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-96 bg-surface-900 border border-surface-700 rounded-xl shadow-xl shadow-black/20 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-800">
              <div>
                <h3 className="font-semibold text-white">Notifications</h3>
                <p className="text-xs text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'No new notifications'}
                </p>
              </div>
              {notifications.some(n => !n.read) && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="sm" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No notifications yet</p>
                  <p className="text-slate-500 text-sm">We&apos;ll notify you when something happens</p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {notifications.map(renderNotification)}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-surface-800 bg-surface-900/50">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>
        )}
      
    </div>
  )
}
