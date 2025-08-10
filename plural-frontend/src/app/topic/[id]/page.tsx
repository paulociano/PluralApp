/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import api from '@/lib/api';
import { useHeader } from '@/context/HeaderContext';
import DebateGraph from '@/components/DebateGraph';
import { useAuth } from '@/context/AuthContext';
import { FiArrowLeft, FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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

  const [topic, setTopic] = useState<any | null>(null);
  const [argumentsTree, setArgumentsTree] = useState<any[]>([]);
  const [isNewArgumentModalOpen, setIsNewArgumentModalOpen] = useState(false);
  const [selectedArgument, setSelectedArgument] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
        if (argumentToSelect) {
          setSelectedArgument(argumentToSelect);
        }
      }
      
    } catch (err) {
      console.error('Não foi possível carregar o debate.');
    }
  }, [topicId, searchParams, currentPage]);

  useEffect(() => {
    // Efeito para enviar os botões para o Header principal
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
        <button onClick={() => setIsNewArgumentModalOpen(true)} className="flex items-center space-x-2 bg-[#63A6A0] text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-[#2D4F5A]">
          <FiPlus size={16} />
          <span>Novo Argumento</span>
        </button>
      </>
    );

    // Função de limpeza
    return () => {
      setIsTopicPage(false);
      setTopicActions(null);
    };
  }, [setIsTopicPage, setTopicActions, currentPage, totalPages]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [fetchData, user]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <main className="flex-1 bg-white overflow-auto flex items-center justify-center relative">
        {/* ---- ALTERAÇÃO AQUI: Removida a classe 'truncate' ---- */}
        <h1 className="absolute top-4 left-1/2 -translate-x-1/2 text-center text-lg font-bold text-[#2D4F5A] max-w-2xl px-4">
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
      
      <NewArgumentModal isOpen={isNewArgumentModalOpen} onClose={() => setIsNewArgumentModalOpen(false)} topicId={topicId} onSuccess={fetchData} />
    </div>
  );
}

// Componente principal exportado que usa Suspense
export default function TopicPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
      <TopicPageContent />
    </Suspense>
  )
}