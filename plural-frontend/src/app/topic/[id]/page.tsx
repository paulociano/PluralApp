'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DebateGraph from '@/components/DebateGraph';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import { FiArrowLeft, FiArrowRight, FiPlus } from 'react-icons/fi';
import { useRouter, useParams } from 'next/navigation'; // 1. Importe o useParams
import Link from 'next/link';

// Tipos
type Topic = {
  id: string;
  title: string;
};
type Argument = any;

// 2. Remova o 'params' da definição da função
export default function TopicPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams(); // 3. Use o hook para pegar os parâmetros
  const topicId = params.id as string; // 4. Pegue o ID a partir do objeto retornado

  const [topic, setTopic] = useState<Topic | null>(null);
  const [argumentsTree, setArgumentsTree] = useState<Argument[]>([]);
  // ... (o resto dos seus useStates continua o mesmo)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);


  const fetchData = useCallback(async () => {
    // ... (a função fetchData continua a mesma, pois já usa a variável topicId)
    if (!topicId) return;
    setIsLoadingData(true);
    setError(null);
    try {
      const [topicResponse, treeResponse] = await Promise.all([
        axios.get(`http://localhost:3000/debate/topic/${topicId}`),
        axios.get(`http://localhost:3000/debate/tree/${topicId}?page=${currentPage}&limit=4`),
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
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [fetchData, user]);

  // O resto do seu código (if de loading e o return JSX) continua o mesmo.
  // ...
  if (isAuthLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="relative bg-white min-h-screen pt-4 pb-16">
      <div className="absolute top-0 left-0 w-full h-56 bg-white shadow-md rounded-b-[50%] -z-10"></div>
      <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
        {topic && (
          <header className="relative pt-12 pb-8 text-center">
            <Link href="/" className="absolute left-0 top-12 text-[#2D4F5A] hover:text-[#63A6A0] transition-colors" aria-label="Voltar para a lista de tópicos">
              <FiArrowLeft size={28} />
            </Link>
            <h1 className="text-base sm:text-xl font-bold text-[#2D4F5A] px-4">{topic.title}</h1>
          </header>
        )}
        <div className="bg-white rounded-lg shadow-xl p-2 sm:p-4 min-h-[750px] flex items-center justify-center overflow-x-auto">
          {error && <p className="text-red-500">{error}</p>}
          {isLoadingData && <p className="text-gray-500">Carregando galáxia de argumentos...</p>}
          {!isLoadingData && !error && (
            <DebateGraph argumentsTree={argumentsTree} onReplySuccess={fetchData} />
          )}
        </div>
      </div>
      <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1 || isLoadingData} className="fixed left-4 top-1/2 -translate-y-1/2 bg-[#63A6A0] hover:bg-[#2D4F5A] text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-20" aria-label="Página Anterior">
        <FiArrowLeft size={24} />
      </button>
      <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || isLoadingData} className="fixed right-4 top-1/2 -translate-y-1/2 bg-[#63A6A0] hover:bg-[#2D4F5A] text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-20" aria-label="Próxima Página">
        <FiArrowRight size={24} />
      </button>
      {user && (
        <button className="fixed bottom-8 right-8 bg-[#2D4F5A] hover:bg-opacity-90 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-20" aria-label="Novo Argumento">
          <FiPlus size={32} />
        </button>
      )}
    </div>
  );
}