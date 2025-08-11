'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import api from '@/lib/api';
import { useHeader } from '@/context/HeaderContext';
import DebateGraph from '@/components/DebateGraph';
import { useAuth } from '@/context/AuthContext';
import { FiArrowLeft, FiPlus, FiChevronLeft, FiChevronRight, FiCpu, FiX } from 'react-icons/fi'; // Adicionados FiCpu e FiX
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NewArgumentModal from '@/components/NewArgumentModal';
import ArgumentPanel from '@/components/ArgumentPanel';

// Componente Wrapper para usar Suspense
function TopicPageContent() {
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const topicId = params.id as string;
  
  const { setIsTopicPage, setTopicActions } = useHeader();

  // Estados da página
  const [topic, setTopic] = useState<any | null>(null);
  const [argumentsTree, setArgumentsTree] = useState<any[]>([]);
  const [isNewArgumentModalOpen, setIsNewArgumentModalOpen] = useState(false);
  const [selectedArgument, setSelectedArgument] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 1. Novos estados para o resumo da IA
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  const findArgumentInTree = (nodes: any[], argumentId: string): any | null => {
    for (const node of nodes) {
      if (node.id === argumentId) return node;
      if (node.replies) {
        const found = findArgumentInTree(node.replies, argumentId);
        if (found) return found;
      }
    }
    return null;
  };

  const fetchData = useCallback(async () => {
    if (!topicId) return;
    try {
      const [topicResponse, treeResponse] = await Promise.all([
        api.get(`/debate/topic/${topicId}`),
        api.get(`/debate/tree/${topicId}?page=${currentPage}&limit=100`),
      ]);
      setTopic(topicResponse.data);
      setArgumentsTree(treeResponse.data.data);
      setTotalPages(treeResponse.data.lastPage || 1);
      const argumentIdFromUrl = searchParams.get('argumentId');
      if (argumentIdFromUrl) {
        const argumentToSelect = findArgumentInTree(treeResponse.data.data, argumentIdFromUrl);
        if (argumentToSelect) setSelectedArgument(argumentToSelect);
      }
    } catch (err) {
      console.error('Não foi possível carregar o debate.');
    }
  }, [topicId, searchParams, currentPage]);

  // 2. Handler para gerar o resumo
  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    setSummary(null);
    setSummaryError('');
    try {
      const response = await api.get(`/ai/summarize/topic/${topicId}`);
      setSummary(response.data.summary);
    } catch (error: any) {
      setSummaryError(error.response?.data?.message || 'Erro ao gerar resumo.');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  useEffect(() => {
    // 3. Efeito para enviar os botões (incluindo o da IA) para o Header
    setIsTopicPage(true);
    setTopicActions(
      <>
        <Link href="/" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" aria-label="Voltar">
          <FiArrowLeft size={20} />
        </Link>
        <div className="flex items-center">
          <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-50">
            <FiChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-gray-700 w-20 text-center">Pág {currentPage} de {totalPages}</span>
          <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-50">
            <FiChevronRight size={20} />
          </button>
        </div>
        <button
          onClick={handleGenerateSummary}
          disabled={isSummaryLoading}
          className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
        >
          <FiCpu size={16} />
          <span>{isSummaryLoading ? 'Analisando...' : 'Resumir com IA'}</span>
        </button>
        <button onClick={() => setIsNewArgumentModalOpen(true)} className="flex items-center space-x-2 bg-[#63A6A0] text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-[#2D4F5A]">
          <FiPlus size={16} />
          <span>Novo Argumento</span>
        </button>
      </>
    );
    return () => {
      setIsTopicPage(false);
      setTopicActions(null);
    };
  }, [setIsTopicPage, setTopicActions, currentPage, totalPages, isSummaryLoading]);

  useEffect(() => {
    if (user) fetchData();
  }, [fetchData, user]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 flex-col">
      {/* 4. Div para exibir o resultado do resumo */}
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-4">
        {summary && (
          <div className="relative p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-lora font-bold text-purple-800 mb-2">Resumo do Debate por IA</h3>
            <p className="font-manrope text-sm text-gray-700 whitespace-pre-wrap">{summary}</p>
            <button onClick={() => setSummary(null)} className="absolute top-2 right-2 p-1 text-purple-500 hover:text-purple-800">
              <FiX />
            </button>
          </div>
        )}
        {summaryError && <p className="text-red-500 p-4 bg-red-50 rounded-lg">{summaryError}</p>}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 bg-white overflow-auto flex items-center justify-center relative">
          <h1 className="absolute top-4 left-1/2 -translate-x-1/2 text-center text-lg font-bold text-[#2D4F5A] max-w-2xl px-4 font-lora">
            {topic?.title}
          </h1>
          <DebateGraph argumentsTree={argumentsTree} onNodeClick={setSelectedArgument} />
        </main>
        <div className={`transform transition-transform duration-300 ease-in-out ${selectedArgument ? 'w-full max-w-md' : 'w-0'}`}>
          <ArgumentPanel
            argument={selectedArgument}
            onClose={() => setSelectedArgument(null)}
            onActionSuccess={fetchData}
            onSelectArgument={setSelectedArgument}
          />
        </div>
      </div>
      
      <NewArgumentModal isOpen={isNewArgumentModalOpen} onClose={() => setIsNewArgumentModalOpen(false)} topicId={topicId} onSuccess={fetchData} />
    </div>
  );
}

// Componente principal com Suspense
export default function TopicPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
      <TopicPageContent />
    </Suspense>
  )
}