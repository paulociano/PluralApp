'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { FiBell } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import NotificationItem from './NotificationItem';

// Tipo para uma notificação
type Notification = {
  id: string;
  isRead: boolean;
  createdAt: string;
  triggerUser: { name: string };
  originArgumentId: string;
  originArgument?: { topicId: string };
};

export default function NotificationBell() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchNotifications = async () => {
      try {
        const response = await api.get<Notification[]>('/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
      }
    };
    fetchNotifications();
  }, [token]);

  const handleNotificationRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  }, []);

  // 1. Crie uma função para fechar o menu
  const closeDropdown = () => {
    setIsOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative text-gray-600 hover:text-[#2D4F5A]">
        <FiBell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 font-bold border-b">Notificações</div>
          <ul className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onNotificationRead={handleNotificationRead}
                  // 2. Passe a função de fechar como uma prop para o filho
                  onItemClick={closeDropdown}
                />
              ))
            ) : (
              <li className="p-4 text-sm text-gray-500 text-center">Nenhuma notificação ainda.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}