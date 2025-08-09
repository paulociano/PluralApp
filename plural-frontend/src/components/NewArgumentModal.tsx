// Arquivo: src/components/NewArgumentModal.tsx
'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import ReplyForm from './ReplyForm'; // Reutilizamos o formulário

type NewArgumentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  topicId: string | null;
  onSuccess: () => void;
};

export default function NewArgumentModal({
  isOpen,
  onClose,
  topicId,
  onSuccess,
}: NewArgumentModalProps) {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (content: string, type: 'PRO' | 'CONTRA') => {
    if (!token || !topicId) {
      alert('Erro: Tópico não encontrado ou usuário não autenticado.');
      return;
    }
    setIsSubmitting(true);
    try {
      // A lógica de envio não passa um 'parentArgumentId'
      await axios.post(
        'http://localhost:3000/debate/argument',
        {
          content,
          type,
          topicId: topicId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar argumento:', error);
      alert('Não foi possível criar seu argumento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0  bg-white bg-opacity-75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">
                  Criar Novo Argumento
                </Dialog.Title>

                <div className="mt-4">
                  <ReplyForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}