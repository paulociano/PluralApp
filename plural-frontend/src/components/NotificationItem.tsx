'use client';

import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

// Tipo para uma notificação (pode ser compartilhado)
type Notification = {
  id: string;
  isRead: boolean;
  createdAt: string;
  triggerUser: { name: string };
  originArgumentId: string;
  // Adicione topicId se disponível para facilitar a navegação
  topicId?: string; // Exemplo: você pode precisar buscar isso no backend
};

type NotificationItemProps = {
  notification: Notification;
  onNotificationRead: (notificationId: string) => void;
};

export default function NotificationItem({ notification, onNotificationRead }: NotificationItemProps) {
  const router = useRouter();
  const { token } = useAuth();

  const handleNotificationClick = async () => {
    // Navega o usuário para o argumento de origem
    // Idealmente, a notificação deveria retornar o topicId para a URL ser construída
    // Por enquanto, vamos simular que o tópico é 'some-topic-id'
    // TODO: Ajustar a navegação para a URL correta do tópico
    router.push(`/topic/some-topic-id?argumentId=${notification.originArgumentId}`);

    // Se a notificação não estiver lida, faz a chamada à API
    if (!notification.isRead && token) {
      try {
        await axios.patch(
          `http://localhost:3000/api/notifications/${notification.id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
        // Informa o componente pai que esta notificação foi lida
        onNotificationRead(notification.id);
      } catch (error) {
        console.error("Erro ao marcar notificação como lida", error);
      }
    }
  };

  return (
    <li
      onClick={handleNotificationClick}
      className="border-b last:border-b-0 hover:bg-gray-100 cursor-pointer"
    >
      <div className="p-4 flex items-start space-x-3">
        {/* Indicador de não lida */}
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