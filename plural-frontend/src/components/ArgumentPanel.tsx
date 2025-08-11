'use client';

import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  FiArrowUp,
  FiArrowDown,
  FiTrash2,
  FiX,
  FiChevronRight,
  FiBookmark,
  FiFlag,
  FiMessageSquare,
  FiLink,
} from 'react-icons/fi';
import api from '@/lib/api';
import ReplyForm from './ReplyForm';
import ReportArgumentModal from './ReportArgumentModal';
import Avatar from './Avatar';

// --- Definição de Tipos ---
type Argument = {
  id: string;
  content: string;
  referenceUrl?: string | null;
  author: {
    username: string; id: string; name: string 
};
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

// --- Componente Principal ---
export default function ArgumentPanel({
  argument,
  onClose,
  onActionSuccess,
  onSelectArgument,
}: ArgumentPanelProps) {
  const { user, token } = useAuth();
  const [localArgument, setLocalArgument] = useState<Argument | null>(argument);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ancestors, setAncestors] = useState<Argument[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRepliesCollapsed, setIsRepliesCollapsed] = useState(true); // Controla a seção de respostas

  useEffect(() => {
    setLocalArgument(argument);
    // Sempre que um novo argumento for selecionado, colapsa a seção de respostas por padrão
    setIsRepliesCollapsed(true);

    if (argument && token) {
      const fetchExtraData = async () => {
        try {
          const [favStatusResponse, ancestorsResponse] = await Promise.all([
            api.get(`/debate/argument/${argument.id}/favorite`),
            api.get(`/debate/argument/${argument.id}/ancestors`),
          ]);
          setIsFavorited(favStatusResponse.data.isFavorited);
          setAncestors(ancestorsResponse.data);
        } catch (error) {
          console.error('Erro ao buscar dados do argumento:', error);
          setAncestors([]);
          setIsFavorited(false);
        }
      };
      fetchExtraData();
    } else {
      setAncestors([]);
      setIsFavorited(false);
    }
  }, [argument, token]);

  const handleVote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    if (!token || !localArgument) return;
    const originalVotesCount = localArgument.votesCount;
    const newVotesCount = type === 'UPVOTE' ? originalVotesCount + 1 : originalVotesCount - 1;
    setLocalArgument({ ...localArgument, votesCount: newVotesCount });
    try {
      const response = await api.post<{ votesCount: number }>(`/debate/argument/${localArgument.id}/vote`, { type });
      setLocalArgument(prev => prev ? { ...prev, votesCount: response.data.votesCount } : null);
      onActionSuccess();
    } catch (error) {
      console.error('Erro ao votar:', error);
      setLocalArgument(prev => prev ? { ...prev, votesCount: originalVotesCount } : null);
    }
  };

  const handleReplySubmit = async (content: string, type: 'PRO' | 'CONTRA' | 'NEUTRO', referenceUrl: string) => {
    if (!token || !localArgument) return;
    setIsSubmitting(true);
    try {
      await api.post('/debate/argument', { content, type, topicId: localArgument.topicId, parentArgumentId: localArgument.id, referenceUrl, });
      onActionSuccess();
      // Ao responder, expande a seção para mostrar o resultado
      setIsRepliesCollapsed(false);
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !localArgument) return;
    if (window.confirm('Você tem certeza que deseja deletar este argumento?')) {
      try {
        await api.delete(`/debate/argument/${localArgument.id}`);
        onActionSuccess();
        onClose();
      } catch (error) {
        console.error('Erro ao deletar argumento:', error);
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (!token || !localArgument) return;
    try {
      await api.post(`/debate/argument/${localArgument.id}/favorite`);
      setIsFavorited((prev) => !prev);
    } catch (error) {
      console.error('Erro ao favoritar:', error);
    }
  };

  const toggleRepliesVisibility = () => {
    setIsRepliesCollapsed((prevState) => !prevState);
  };

  if (!localArgument) {
    return (
      <div className="h-full bg-white flex items-center justify-center p-6 text-gray-500 border-l border-gray-200">
        Selecione um argumento para ver os detalhes.
      </div>
    );
  }

  return (
    <>
      <div className="h-full bg-white shadow-lg flex flex-col border-l border-gray-200">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Detalhes do Argumento</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Fechar painel de detalhes">
            <FiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Corpo principal com o conteúdo do argumento */}
        <div className="p-6 overflow-y-auto flex-1">
          {ancestors.length > 0 && (
            <nav className="flex items-center text-sm text-gray-500 mb-4 flex-wrap">
              {ancestors.map((anc) => (
                <Fragment key={anc.id}>
                  <button onClick={() => onSelectArgument(anc)} className="hover:underline hover:text-[#63A6A0]">
                    {anc.content.substring(0, 15)}...
                  </button>
                  <FiChevronRight className="mx-1" />
                </Fragment>
              ))}
              <span className="font-semibold text-gray-800">Argumento Atual</span>
            </nav>
          )}
          <div className='flex items-center space-x-3 mb-4'>
          <Avatar name={localArgument.author.name} size={32} />
          <p className="font-semibold text-gray-800">
            {/* O link agora usa o 'username' do autor, se existir. 
                Caso contrário (para usuários antigos que não definiram um), 
                ele usa o 'id' como fallback. */}
            de: <Link href={`/profile/${localArgument.author.username || localArgument.author.id}`} className="text-[#63A6A0] hover:underline">
              {localArgument.author.name}
            </Link>
          </p>
          </div>
          <p className="text-md text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
            {localArgument.content}
          </p>
          {localArgument.referenceUrl && (
            <div className="mt-4">
              <a
                href={localArgument.referenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#63A6A0] hover:underline"
              >
                <FiLink />
                Fonte de Referência
              </a>
            </div>
          )}
        </div>

        {/* Rodapé com as ações e a seção de respostas colapsável */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-2">
              <button onClick={() => handleVote('UPVOTE')} className="p-1 rounded-full hover:bg-green-100" aria-label="Votar a favor">
                <FiArrowUp className="w-5 h-5 text-green-600" />
              </button>
              <span className="font-bold text-lg text-gray-800">{localArgument.votesCount}</span>
              <button onClick={() => handleVote('DOWNVOTE')} className="p-1 rounded-full hover:bg-red-100" aria-label="Votar contra">
                <FiArrowDown className="w-5 h-5 text-red-600" />
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={handleToggleFavorite} className="text-gray-400 hover:text-[#63A6A0] transition-colors" aria-label={isFavorited ? 'Desfavoritar argumento' : 'Favoritar argumento'}>
                <FiBookmark className={`w-5 h-5 ${isFavorited ? 'fill-current text-[#63A6A0]' : ''}`} />
              </button>
              <button onClick={() => setIsReportModalOpen(true)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Denunciar argumento">
                <FiFlag className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Seção de controle para colapsar/expandir respostas */}
          <div
            className="mb-4 p-2 -mx-2 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
            onClick={toggleRepliesVisibility}
          >
            <div className="flex items-center text-sm text-gray-600">
              <FiMessageSquare className="w-4 h-4 mr-2" />
              <span className="font-semibold">Respostas ({localArgument.replyCount})</span>
              <span className="ml-auto font-medium text-[#63A6A0]">
                {isRepliesCollapsed ? 'Mostrar' : 'Esconder'}
              </span>
            </div>
          </div>
          
          {/* Renderização condicional do formulário de resposta */}
          {!isRepliesCollapsed && user && (
            <div className="mb-4">
                <ReplyForm onSubmit={handleReplySubmit} isSubmitting={isSubmitting} />
            </div>
          )}

          {/* Botão de deletar (se o usuário for o autor) */}
          {user && user.id === localArgument.author.id && (
            <div className="mt-4 border-t pt-4">
              <button onClick={handleDelete} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
                <FiTrash2 /> Deletar Argumento
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de denúncia */}
      {localArgument && (
        <ReportArgumentModal 
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          argumentId={localArgument.id}
          onSuccess={() => { alert('Argumento denunciado com sucesso.'); }}
        />
      )}
    </>
  );
}