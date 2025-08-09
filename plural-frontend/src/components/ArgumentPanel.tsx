'use client';

import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import ReplyForm from './ReplyForm';
import { FiArrowUp, FiArrowDown, FiTrash2, FiX, FiChevronRight } from 'react-icons/fi';

// Tipos de dados
type Argument = {
  id: string;
  content: string;
  author: { id: string; name: string };
  votesCount: number;
  replyCount: number;
  topicId: string;
  parentArgumentId: string | null;
  type: 'PRO' | 'CONTRA' | 'NEUTRO';
};

type ArgumentPanelProps = {
  argument: Argument | null;
  onClose: () => void;
  onActionSuccess: () => void;
  onSelectArgument: (arg: Argument) => void;
};

export default function ArgumentPanel({
  argument,
  onClose,
  onActionSuccess,
  onSelectArgument,
}: ArgumentPanelProps) {
  const { user, token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ancestors, setAncestors] = useState<Argument[]>([]);

  useEffect(() => {
    if (argument) {
      const fetchAncestors = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3000/debate/argument/${argument.id}/ancestors`,
          );
          setAncestors(response.data);
        } catch (error) {
          console.error('Erro ao buscar antepassados', error);
          setAncestors([]);
        }
      };
      fetchAncestors();
    } else {
      setAncestors([]);
    }
  }, [argument]);

  const handleVote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    if (!token || !argument) return;
    try {
      await axios.post(
        `http://localhost:3000/debate/argument/${argument.id}/vote`,
        { type },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onActionSuccess();
    } catch (error) {
      console.error('Erro ao votar:', error);
    }
  };

  const handleReplySubmit = async (content: string, type: 'PRO' | 'CONTRA' | 'NEUTRO') => {
    if (!token || !argument) return;
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
      onActionSuccess();
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !argument) return;
    if (
      window.confirm('Você tem certeza que deseja deletar este argumento?')
    ) {
      try {
        await axios.delete(
          `http://localhost:3000/debate/argument/${argument.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        onActionSuccess();
        onClose();
      } catch (error) {
        console.error('Erro ao deletar argumento:', error);
      }
    }
  };

  if (!argument) {
    return (
      <div className="h-full bg-white flex items-center justify-center p-6 text-gray-500 border-l border-gray-200">
        Selecione um argumento para ver os detalhes.
      </div>
    );
  }

  return (
    <div className="h-full bg-white shadow-lg flex flex-col border-l border-gray-200">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">
          Detalhes do Argumento
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <FiX className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="p-6 overflow-y-auto flex-1">
        {ancestors.length > 0 && (
          <nav className="flex items-center text-sm text-gray-500 mb-4 flex-wrap">
            {ancestors.map((anc) => (
              <Fragment key={anc.id}>
                <button
                  onClick={() => onSelectArgument(anc)}
                  className="hover:underline hover:text-[#63A6A0]"
                >
                  {anc.content.substring(0, 15)}...
                </button>
                <FiChevronRight className="mx-1" />
              </Fragment>
            ))}
            <span className="font-semibold text-gray-800">Argumento Atual</span>
          </nav>
        )}
        <p className="font-semibold text-gray-800 mb-2">de: {argument.author.name}</p>
        <p className="text-md text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
          {argument.content}
        </p>
      </div>

      <div className="p-6 border-t bg-gray-50">
        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleVote('UPVOTE')}
              className="p-1 rounded-full hover:bg-green-100"
            >
              <FiArrowUp className="w-5 h-5 text-green-600" />
            </button>
            <span className="font-bold text-lg text-gray-800">
              {argument.votesCount}
            </span>
            <button
              onClick={() => handleVote('DOWNVOTE')}
              className="p-1 rounded-full hover:bg-red-100"
            >
              <FiArrowDown className="w-5 h-5 text-red-600" />
            </button>
          </div>
          <span>Respostas: {argument.replyCount}</span>
        </div>
        {user && <ReplyForm onSubmit={handleReplySubmit} isSubmitting={isSubmitting} />}
        {user && user.id === argument.author.id && (
          <div className="mt-4 border-t pt-4">
            <button
              onClick={handleDelete}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              <FiTrash2 />
              Deletar Argumento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}