'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import ReplyForm from '@/components/ReplyForm';

type Argument = {
  id: string;
  content: string;
  author: { name: string };
  votesCount: number;
  replyCount: number;
  topicId: string;
};

type ArgumentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  argument: Argument | null;
  onReplySuccess: () => void; // 1. A função é recebida aqui
};

export default function ArgumentModal({
  isOpen,
  onClose,
  argument,
  onReplySuccess, // 2. A função é extraída das props
}: ArgumentModalProps) {
  const { user, token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!argument) return null;

  const handleReplySubmit = async (content: string, type: 'PRO' | 'CONTRA') => {
    if (!token) {
      alert('Você precisa estar logado para responder.');
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(
        'http://localhost:3000/debate/argument',
        {
          content,
          type,
          topicId: argument.topicId,
          parentArgumentId: argument.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      onReplySuccess(); // 3. A função é USADA aqui
      onClose();
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      alert('Não foi possível enviar sua resposta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 border-b pb-2"
                >
                  Argumento de: {argument.author.name}
                </Dialog.Title>
                <div className="mt-4">
                  <p className="text-md text-gray-700">{argument.content}</p>
                </div>
                <div className="mt-4 flex justify-between text-sm text-gray-500">
                  <span>Votos: {argument.votesCount}</span>
                  <span>Respostas: {argument.replyCount}</span>
                </div>

                {user && (
                  <ReplyForm
                    onSubmit={handleReplySubmit}
                    isSubmitting={isSubmitting}
                  />
                )}

                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200"
                    onClick={onClose}
                  >
                    Fechar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}