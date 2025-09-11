import React, { useState, useEffect } from 'react';
import { Bell, Heart, UserPlus, Calendar, MessageCircle } from 'lucide-react';
import { Notification } from '../../types';
import { formatTime } from '../../utils/formatters';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock notifications
    const mockNotifications: Notification[] = [
      {
        id: 'n1',
        uid: 'current-user',
        type: 'join_request',
        payload: {
          fromUser: 'Takeshi Runner',
          practiceTitle: 'Morning Easy Run 8.5km',
          message: 'Would love to join your next run!'
        },
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'n2',
        uid: 'current-user',
        type: 'kudos',
        payload: {
          fromUser: 'Maria Santos',
          practiceTitle: 'Tempo Workout 12km'
        },
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'n3',
        uid: 'current-user',
        type: 'event_invite',
        payload: {
          fromUser: 'Running Club Tokyo',
          eventTitle: 'Weekend Long Run 20km',
          scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        },
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'n4',
        uid: 'current-user',
        type: 'comment',
        payload: {
          fromUser: 'Alex Runner',
          practiceTitle: 'Hill Training Session',
          comment: 'Great workout! Those hills are tough.'
        },
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 800);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'join_request':
        return UserPlus;
      case 'kudos':
        return Heart;
      case 'event_invite':
        return Calendar;
      case 'comment':
        return MessageCircle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'join_request':
        return 'text-blue-600 bg-blue-50';
      case 'kudos':
        return 'text-red-500 bg-red-50';
      case 'event_invite':
        return 'text-purple-600 bg-purple-50';
      case 'comment':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getNotificationTitle = (notification: Notification) => {
    switch (notification.type) {
      case 'join_request':
        return 'New Join Request';
      case 'kudos':
        return 'Someone liked your run';
      case 'event_invite':
        return 'Event Invitation';
      case 'comment':
        return 'New Comment';
      default:
        return 'Notification';
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    const { payload } = notification;
    switch (notification.type) {
      case 'join_request':
        return `${payload.fromUser} wants to join your "${payload.practiceTitle}"`;
      case 'kudos':
        return `${payload.fromUser} gave kudos to your "${payload.practiceTitle}"`;
      case 'event_invite':
        return `${payload.fromUser} invited you to "${payload.eventTitle}"`;
      case 'comment':
        return `${payload.fromUser} commented on your "${payload.practiceTitle}"`;
      default:
        return 'New notification';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    ));
  };

  const handleNotificationAction = (notification: Notification, action: 'accept' | 'decline' | 'view') => {
    console.log('Notification action:', action, notification.id);
    markAsRead(notification.id);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-md mx-auto px-4 py-4 mb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => setNotifications(notifications.map(n => ({ ...n, isRead: true })))}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map(notification => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);

            return (
              <div
                key={notification.id}
                className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${
                  !notification.isRead ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {getNotificationTitle(notification)}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {getNotificationMessage(notification)}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-3">
                      {notification.type === 'join_request' && (
                        <>
                          <button
                            onClick={() => handleNotificationAction(notification, 'accept')}
                            className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleNotificationAction(notification, 'decline')}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {notification.type === 'event_invite' && (
                        <>
                          <button
                            onClick={() => handleNotificationAction(notification, 'accept')}
                            className="px-3 py-1.5 bg-purple-500 text-white text-xs rounded-full hover:bg-purple-600 transition-colors"
                          >
                            Join Event
                          </button>
                          <button
                            onClick={() => handleNotificationAction(notification, 'view')}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                          >
                            View Details
                          </button>
                        </>
                      )}
                      {(notification.type === 'kudos' || notification.type === 'comment') && (
                        <button
                          onClick={() => handleNotificationAction(notification, 'view')}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;