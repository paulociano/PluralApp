'use client';

import { useRouter } from 'next/navigation';
import api from '@/lib/api';

type Notification = {
  id: string;
  isRead: boolean;
  createdAt: string;
  triggerUser: { name: string };
  originArgumentId: string;
  originArgument?: { topicId: string };
};

// 1. Atualize as props para incluir a nova função
type NotificationItemProps = {
  notification: Notification;
  onNotificationRead: (notificationId: string) => void;
  onItemClick: () => void; // Função para fechar o menu
};

export default function NotificationItem({ notification, onNotificationRead, onItemClick }: NotificationItemProps) {
  const router = useRouter();

  const handleNotificationClick = async () => {
    if (!notification.originArgument?.topicId) {
      console.error("Dados da notificação incompletos:", notification);
      return; 
    }

    const topicId = notification.originArgument.topicId;
    const argumentId = notification.originArgumentId;
    const targetUrl = `/topic/${topicId}?argumentId=${argumentId}`;
    
    router.push(targetUrl);

    if (!notification.isRead) {
      try {
        await api.patch(`/notifications/${notification.id}/read`);
        onNotificationRead(notification.id);
      } catch (error) {
        console.error("Erro ao marcar notificação como lida", error);
      }
    }
    
    // 2. Chame a função para fechar o menu no final do clique
    onItemClick();
  };

  return (
    <li
      onClick={handleNotificationClick}
      className="border-b last:border-b-0 hover:bg-gray-100 cursor-pointer"
    >
      <div className="p-4 flex items-start space-x-3">
        {!notification.isRead && (
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
        )}
        <div className={notification.isRead ? 'opacity-60' : ''}>
          <p className="text-sm">
            <span className="font-bold">{notification.triggerUser.name}</span> respondeu ao seu argumento.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(notification.createdAt).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </li>
  );
}