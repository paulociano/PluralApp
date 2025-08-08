'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DebateGraph from '@/components/DebateGraph';
import { useAuth } from '@/context/AuthContext';
import { FiArrowLeft, FiArrowRight, FiPlus } from 'react-icons/fi';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NewArgumentModal from '@/components/NewArgumentModal';

// Tipos
type Topic = {
  id: string;
  title: string;
};
type Argument = any;

export default function TopicPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const topicId = params.id as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [argumentsTree, setArgumentsTree] = useState<Argument[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isNewArgumentModalOpen, setIsNewArgumentModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!topicId) return;
    setIsLoadingData(true);
    setError(null);
    try {
      const [topicResponse, treeResponse] = await Promise.all([
        axios.get(`http://localhost:3000/debate/topic/${topicId}`),
        axios.get(
          `http://localhost:3000/debate/tree/${topicId}?page=${currentPage}&limit=4`,
        ),
      ]);

      setTopic(topicResponse.data);
      setArgumentsTree(treeResponse.data.data);
      setTotalPages(treeResponse.data.lastPage);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Não foi possível carregar o debate.');
    } finally {
      setIsLoadingData(false);
    }
  }, [currentPage, topicId]);

  useEffect(() => {
    // Protege a rota
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    // Busca os dados apenas se o usuário estiver logado
    if (user) {
      fetchData();
    }
  }, [fetchData, user]);

  if (isAuthLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative bg-white min-h-screen pt-4 pb-16">
        <div className="absolute top-0 left-0 w-full h-56 bg-white shadow-md rounded-b-[50%] -z-10"></div>

        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          {topic && (
            <header className="relative pt-12 pb-8 text-center">
              <Link
                href="/"
                className="absolute left-0 top-12 text-[#2D4F5A] hover:text-[#63A6A0] transition-colors"
                aria-label="Voltar para a lista de tópicos"
              >
                <FiArrowLeft size={28} />
              </Link>
              <h1 className="text-base sm:text-xl font-bold text-[#2D4F5A] px-4">
                {topic.title}
              </h1>
            </header>
          )}

          <div className="bg-white rounded-lg shadow-xl p-2 sm:p-4 min-h-[750px] flex items-center justify-center overflow-x-auto">
            {error && <p className="text-red-500">{error}</p>}
            {isLoadingData && (
              <p className="text-gray-500">
                Carregando galáxia de argumentos...
              </p>
            )}
            {!isLoadingData && !error && (
              <DebateGraph
                argumentsTree={argumentsTree}
                onReplySuccess={fetchData}
              />
            )}
          </div>
        </div>

        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || isLoadingData}
          className="fixed left-4 top-1/2 -translate-y-1/2 bg-[#63A6A0] hover:bg-[#2D4F5A] text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-20"
          aria-label="Página Anterior"
        >
          <FiArrowLeft size={24} />
        </button>

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages || isLoadingData}
          className="fixed right-4 top-1/2 -translate-y-1/2 bg-[#63A6A0] hover:bg-[#2D4F5A] text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-20"
          aria-label="Próxima Página"
        >
          <FiArrowRight size={24} />
        </button>
      </div>

      {user && (
        <button
          onClick={() => setIsNewArgumentModalOpen(true)}
          className="fixed bottom-8 right-8 bg-[#2D4F5A] hover:bg-opacity-90 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-20"
          aria-label="Novo Argumento"
        >
          <FiPlus size={32} />
        </button>
      )}

      <NewArgumentModal
        isOpen={isNewArgumentModalOpen}
        onClose={() => setIsNewArgumentModalOpen(false)}
        topicId={topicId}
        onSuccess={() => {
          console.log('Argumento criado com sucesso!');
          fetchData();
        }}
      />
    </>
  );
}