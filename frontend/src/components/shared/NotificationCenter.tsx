import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { apiClient } from '@/lib/api/client';
import { Notification } from '@/types';
import { formatDate } from '@/lib/utils/helpers';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications');
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = notifications.filter(
    (notification: Notification) => notification.status === 'UNREAD'
  ).length;

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}`, { status: 'READ' });
      // Refetch notifications
      // No need to manually update the cache, React Query will handle that
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        aria-label="Notifications"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-20">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {unreadCount} unread
            </span>
          </div>

          {isLoading ? (
            <div className="px-4 py-2 text-center">Loading...</div>
          ) : error ? (
            <div className="px-4 py-2 text-center text-red-500">
              Error loading notifications
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-2 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    notification.status === 'UNREAD'
                      ? 'bg-blue-50 dark:bg-blue-900/10'
                      : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline w-full text-center">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 