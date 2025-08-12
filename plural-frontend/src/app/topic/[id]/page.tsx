'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import api from '@/lib/api';
import { useHeader } from '@/context/HeaderContext';
import { useAuth } from '@/context/AuthContext';
import { FiArrowLeft, FiPlus, FiChevronLeft, FiChevronRight, FiCpu, FiX, FiList, FiShare2 } from 'react-icons/fi';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NewArgumentModal from '@/components/NewArgumentModal';
import ArgumentPanel from '@/components/ArgumentPanel';
import dynamic from 'next/dynamic';
import { Topic, Argumento } from '@/types';
import DebateList from '@/components/DebateList'; // Importe o DebateList

const DebateGraph = dynamic(
  () => import('@/components/DebateGraph'),
  { 
    ssr: false,
    loading: () => <p className="text-center">Carregando visualização do debate...</p> 
  }
);

function TopicPageContent() {
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const topicId = params.id as string;
  
  const { setIsTopicPage, setTopicActions } = useHeader();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [argumentsTree, setArgumentsTree] = useState<Argumento[]>([]);
  const [isNewArgumentModalOpen, setIsNewArgumentModalOpen] = useState(false);
  const [selectedArgument, setSelectedArgument] = useState<Argumento | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  
  // Estado para controlar o modo de visualização (grafo ou lista)
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');

  const findArgumentInTree = useCallback((nodes: Argumento[], argumentId: string): Argumento | null => {
    for (const node of nodes) {
      if (node.id === argumentId) return node;
      if (node.replies && Array.isArray(node.replies)) {
        const found = findArgumentInTree(node.replies, argumentId);
        if (found) return found;
      }
    }
    return null;
  }, []);

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
      console.error('Não foi possível carregar o debate.', err);
    }
  }, [topicId, searchParams, currentPage, findArgumentInTree]);

  const handleGenerateSummary = useCallback(async () => {
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
  }, [topicId]);

  useEffect(() => {
    setIsTopicPage(true);
    setTopicActions(
      <>
        <Link href="/" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" aria-label="Voltar"><FiArrowLeft size={20} /></Link>
        <div className="flex items-center">
          <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-50"><FiChevronLeft size={20} /></button>
          <span className="text-sm font-medium text-gray-700 w-20 text-center">Pág {currentPage} de {totalPages}</span>
          <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-50"><FiChevronRight size={20} /></button>
        </div>
        <button onClick={handleGenerateSummary} disabled={isSummaryLoading} className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50"><FiCpu size={16} /><span>{isSummaryLoading ? 'Analisando...' : 'Resumir com IA'}</span></button>
        <button onClick={() => setIsNewArgumentModalOpen(true)} className="flex items-center space-x-2 bg-[#63A6A0] text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-[#2D4F5A]"><FiPlus size={16} /><span>Novo Argumento</span></button>
      </>
    );
    return () => { setIsTopicPage(false); setTopicActions(null); };
  }, [setIsTopicPage, setTopicActions, currentPage, totalPages, isSummaryLoading, handleGenerateSummary, topicId]);

  useEffect(() => {
    if (user) fetchData();
  }, [fetchData, user]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 flex-col">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-4">
        {summary && (
          <div className="relative p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-lora font-bold text-purple-800 mb-2">Resumo do Debate por IA</h3>
            <p className="font-manrope text-sm text-gray-700 whitespace-pre-wrap">{summary}</p>
            <button onClick={() => setSummary(null)} className="absolute top-2 right-2 p-1 text-purple-500 hover:text-purple-800"><FiX /></button>
          </div>
        )}
        {summaryError && <p className="text-red-500 p-4 bg-red-50 rounded-lg">{summaryError}</p>}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 bg-white overflow-auto flex items-center justify-center relative">
          <h1 className="absolute top-4 left-1/2 -translate-x-1/2 text-center text-lg font-bold text-[#2D4F5A] max-w-3xl px-4 font-lora">{topic?.title}</h1>
          
          <div className="absolute top-4 right-4 z-10 bg-white p-1 rounded-full shadow border">
            <button onClick={() => setViewMode('graph')} className={`p-2 rounded-full ${viewMode === 'graph' ? 'bg-[#2D4F5A] text-white' : 'hover:bg-gray-100'}`} aria-label="Visualização em Grafo"><FiShare2 /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-full ${viewMode === 'list' ? 'bg-[#2D4F5A] text-white' : 'hover:bg-gray-100'}`} aria-label="Visualização em Lista"><FiList /></button>
          </div>

          <div className="w-full h-90">
            {viewMode === 'graph' ? (
              <DebateGraph argumentsTree={argumentsTree} onNodeClick={setSelectedArgument} />
            ) : (
              <DebateList argumentsTree={argumentsTree} />
            )}
          </div>
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

export default function TopicPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
      <TopicPageContent />
    </Suspense>
  )
}