'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import ReplyForm from './ReplyForm';
import { NewArgumentModalProps } from '@/types';

export default function NewArgumentModal({ isOpen, onClose, topicId, onSuccess }: NewArgumentModalProps) {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (content: string, type: 'PRO' | 'CONTRA' | 'NEUTRO', referenceUrl: string) => {
    if (!token || !topicId) return;
    setIsSubmitting(true);
    try {
      await api.post('/debate/argument', { content, type, topicId, ...(referenceUrl.trim() && { referenceUrl }) });
      onSuccess(); onClose();
    } catch (error) { console.error('Erro ao criar argumento:', error); }
    finally { setIsSubmitting(false); }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-[#173B44]/35 backdrop-blur-sm" /></Transition.Child>
        <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#DDD7CC] bg-white p-6 text-left shadow-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6E8F8D]">Entre na conversa</p>
              <Dialog.Title as="h3" className="mt-1 font-lora text-2xl font-bold text-[#173B44]">Criar novo argumento</Dialog.Title>
              <p className="mt-2 text-sm leading-6 text-[#748084]">Declare sua posição, desenvolva o raciocínio e, quando possível, acrescente uma fonte.</p>
              <ReplyForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </Dialog.Panel>
          </Transition.Child>
        </div></div>
      </Dialog>
    </Transition>
  );
}