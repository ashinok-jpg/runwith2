import React from 'react';
import { Bell, CalendarClock, CalendarX, UserMinus, UserPlus } from 'lucide-react';
import { Notification } from '../../types';
import { markNotificationsRead } from '../../lib/notifications';
import { formatTime } from '../../utils/formatters';
import { useI18n } from '../../i18n/context';
import type { MessageKey } from '../../i18n/strings';

interface NotificationsProps {
  notifications: Notification[];
  loading: boolean;
  onOpenSession: (eventId: string) => void;
}

const notificationStyle = {
  session_joined: { icon: UserPlus, color: 'bg-green-100 text-green-600' },
  session_left: { icon: UserMinus, color: 'bg-gray-100 text-gray-600' },
  session_cancelled: { icon: CalendarX, color: 'bg-red-100 text-red-600' },
  session_updated: { icon: CalendarClock, color: 'bg-blue-100 text-blue-600' },
};

const notificationKey: Record<Notification['type'], MessageKey> = {
  session_joined: 'notif.joined',
  session_left: 'notif.left',
  session_cancelled: 'notif.cancelled',
  session_updated: 'notif.updated',
};

const Notifications: React.FC<NotificationsProps> = ({ notifications, loading, onOpenSession }) => {
  const { lang, t } = useI18n();
  const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);

  const handleOpen = (n: Notification) => {
    if (!n.isRead) markNotificationsRead([n.id]).catch(err => console.error('Failed to mark read', err));
    onOpenSession(n.eventId);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-5 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('notif.title')}</h1>
        {unreadIds.length > 0 && (
          <button
            onClick={() => markNotificationsRead(unreadIds).catch(err => console.error('Failed to mark read', err))}
            className="text-sm text-blue-600 font-medium hover:text-blue-700"
          >
            {t('notif.markAll')}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500">{t('notif.empty')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('notif.emptyHint')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const { icon: Icon, color } = notificationStyle[n.type] ?? { icon: Bell, color: 'bg-gray-100 text-gray-600' };
            return (
              <button
                key={n.id}
                onClick={() => handleOpen(n)}
                className={`w-full text-left bg-white rounded-xl px-4 py-3 border transition-colors hover:border-blue-300 ${
                  n.isRead ? 'border-gray-200' : 'border-blue-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{t(notificationKey[n.type] ?? 'notif.joined', { name: n.fromName, title: n.eventTitle })}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatTime(n.createdAt, lang)}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
