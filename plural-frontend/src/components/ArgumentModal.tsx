'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import ReplyForm from './ReplyForm';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi'; // 1. Importe os ícones

// Tipos de dados
type Argument = { id: string; content: string; author: { name: string }; votesCount: number; replyCount: number; topicId: string; };
type ArgumentModalProps = { isOpen: boolean; onClose: () => void; argument: Argument | null; onReplySuccess: () => void; };

export default function ArgumentModal({ isOpen, onClose, argument, onReplySuccess }: ArgumentModalProps) {
  const { user, token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!argument) return null;

  // 2. NOVA FUNÇÃO PARA LIDAR COM VOTOS
  const handleVote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    if (!token) {
      alert('Você precisa estar logado para votar.');
      return;
    }
    try {
      // Chama o endpoint de voto que já criamos no backend
      await axios.post(
        `http://localhost:3000/debate/argument/${argument.id}/vote`,
        { type }, // Envia o tipo de voto no corpo
        {
          headers: {
            Authorization: `Bearer ${token}`, // Envia o token de autenticação
          },
        },
      );
      // Após o voto, chama a função para recarregar os dados e atualizar a tela
      onReplySuccess();
    } catch (error) {
      console.error('Erro ao votar:', error);
      alert('Não foi possível registrar seu voto.');
    }
  };

  const handleReplySubmit = async (content: string, type: 'PRO' | 'CONTRA') => {
    // ... (a função de resposta continua a mesma)
    if (!token) {
      alert('Você precisa estar logado para responder.');
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:3000/debate/argument', {
        content, type, topicId: argument.topicId, parentArgumentId: argument.id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onReplySuccess();
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
        {/* ... (código do backdrop e do painel, sem alterações) ... */}
        <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4 text-center">
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">
              Argumento de: {argument.author.name}
            </Dialog.Title>
            <div className="mt-4"><p className="text-md text-gray-700">{argument.content}</p></div>
            
            {/* 3. NOVO PAINEL DE VOTAÇÃO E CONTAGEM */}
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <button onClick={() => handleVote('UPVOTE')} className="p-1 rounded-full hover:bg-green-100" aria-label="Voto a favor">
                  <FiArrowUp className="w-5 h-5 text-green-600" />
                </button>
                <span className="font-bold text-lg">{argument.votesCount}</span>
                <button onClick={() => handleVote('DOWNVOTE')} className="p-1 rounded-full hover:bg-red-100" aria-label="Voto contra">
                  <FiArrowDown className="w-5 h-5 text-red-600" />
                </button>
              </div>
              <span>Respostas: {argument.replyCount}</span>
            </div>

            {user && <ReplyForm onSubmit={handleReplySubmit} isSubmitting={isSubmitting} />}

            <div className="mt-6">
              <button type="button" className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200" onClick={onClose}>
                Fechar
              </button>
            </div>
          </Dialog.Panel>
        </Transition.Child>
        </div></div>
      </Dialog>
    </Transition>
  );
}