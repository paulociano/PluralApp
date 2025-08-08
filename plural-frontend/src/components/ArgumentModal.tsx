'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import ReplyForm from './ReplyForm';
import { FiArrowUp, FiArrowDown, FiTrash2 } from 'react-icons/fi';

type Argument = {
  id: string;
  content: string;
  author: { id: string; name: string };
  votesCount: number;
  replyCount: number;
  topicId: string;
};
type ArgumentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  argument: Argument | null;
  onReplySuccess: () => void;
};

export default function ArgumentModal({
  isOpen,
  onClose,
  argument,
  onReplySuccess,
}: ArgumentModalProps) {
  const { user, token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!argument) return null;

  const handleVote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    if (!token) {
      alert('Você precisa estar logado para votar.');
      return;
    }
    try {
      await axios.post(
        `http://localhost:3000/debate/argument/${argument.id}/vote`,
        { type },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onReplySuccess();
    } catch (error) {
      console.error('Erro ao votar:', error);
      alert('Não foi possível registrar seu voto.');
    }
  };

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
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onReplySuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      alert('Não foi possível enviar sua resposta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    const isConfirmed = window.confirm(
      'Você tem certeza que deseja deletar este argumento? Esta ação não pode ser desfeita.',
    );
    if (!isConfirmed) return;

    try {
      await axios.delete(
        `http://localhost:3000/debate/argument/${argument.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      onReplySuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao deletar argumento:', error);
      alert('Não foi possível deletar o argumento.');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={onClose}>
        {/* Fundo escurecido (backdrop) */}
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

        {/* Container principal para centralizar o modal */}
        <div className="fixed inset-0 overflow-y-auto">
          {/* CORREÇÃO APLICADA AQUI */}
          <div className="flex min-h-full items-center justify-center p-4 text-center pt-24 sm:pt-4">
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
                <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVote('UPVOTE')}
                      className="p-1 rounded-full hover:bg-green-100"
                      aria-label="Voto a favor"
                    >
                      <FiArrowUp className="w-5 h-5 text-green-600" />
                    </button>
                    <span className="font-bold text-lg">
                      {argument.votesCount}
                    </span>
                    <button
                      onClick={() => handleVote('DOWNVOTE')}
                      className="p-1 rounded-full hover:bg-red-100"
                      aria-label="Voto contra"
                    >
                      <FiArrowDown className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                  <span>Respostas: {argument.replyCount}</span>
                </div>

                {/* Formulário de Resposta */}
                {user && <ReplyForm onSubmit={handleReplySubmit} isSubmitting={isSubmitting} />}
                
                <div className="mt-6 flex justify-between items-center">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                    onClick={onClose}
                  >
                    Fechar
                  </button>
                  
                  {user && user.id === argument.author.id && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="inline-flex items-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                    >
                      <FiTrash2 />
                      Deletar
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}