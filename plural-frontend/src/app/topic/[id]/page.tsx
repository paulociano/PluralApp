'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import api from '@/lib/api';
import { useHeader } from '@/context/HeaderContext';
import { useAuth } from '@/context/AuthContext';
import { FiArrowLeft, FiPlus, FiChevronLeft, FiChevronRight, FiCpu, FiX, FiList, FiShare2, FiMessageCircle } from 'react-icons/fi';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NewArgumentModal from '@/components/NewArgumentModal';
import ArgumentPanel from '@/components/ArgumentPanel';
import dynamic from 'next/dynamic';
import { Topic, Argumento } from '@/types';
import DebateList from '@/components/DebateList';

const DebateGraph = dynamic(() => import('@/components/DebateGraph'), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-[#7B8386]">Construindo o mapa do debate...</div>
});

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

  const countArguments = useCallback((nodes: Argumento[]): number =>
    nodes.reduce((sum, node) => sum + 1 + (node.replies ? countArguments(node.replies) : 0), 0), []);

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
    setIsSummaryLoading(true); setSummary(null); setSummaryError('');
    try {
      const response = await api.get(`/ai/summarize/topic/${topicId}`);
      setSummary(response.data.summary);
    } catch (error: any) {
      setSummaryError(error.response?.data?.message || 'Erro ao gerar resumo.');
    } finally { setIsSummaryLoading(false); }
  }, [topicId]);

  useEffect(() => {
    setIsTopicPage(true);
    setTopicActions(
      <>
        <Link href="/" className="rounded-lg p-2 text-[#59686C] transition hover:bg-[#F1EEE7]" aria-label="Voltar"><FiArrowLeft size={19} /></Link>
        <div className="hidden items-center sm:flex">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="rounded-lg p-2 text-[#59686C] hover:bg-[#F1EEE7] disabled:opacity-35" aria-label="Página anterior"><FiChevronLeft /></button>
          <span className="w-20 text-center text-xs font-semibold text-[#657276]">{currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="rounded-lg p-2 text-[#59686C] hover:bg-[#F1EEE7] disabled:opacity-35" aria-label="Próxima página"><FiChevronRight /></button>
        </div>
      </>
    );
    return () => { setIsTopicPage(false); setTopicActions(null); };
  }, [setIsTopicPage, setTopicActions, currentPage, totalPages]);

  useEffect(() => { if (user) fetchData(); }, [fetchData, user]);

  const argumentCount = countArguments(argumentsTree);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F4F2EC]">
      <section className="border-b border-[#D8D2C7] bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#6E8F8D]">
                <FiMessageCircle /> Debate aberto
              </div>
              <h1 className="font-lora text-3xl font-bold leading-tight text-[#173B44] sm:text-4xl">{topic?.title || 'Carregando debate...'}</h1>
              {topic?.description && <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6B767A] sm:text-base">{topic.description}</p>}
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#657276]">
                <span className="rounded-full bg-[#EEF2EF] px-3 py-1.5">{argumentCount} argumentos nesta página</span>
                <span className="rounded-full bg-[#EEF2EF] px-3 py-1.5">Página {currentPage} de {totalPages}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={handleGenerateSummary} disabled={isSummaryLoading} className="inline-flex items-center gap-2 rounded-xl border border-[#CFC8BC] bg-white px-4 py-2.5 text-sm font-semibold text-[#42545A] transition hover:border-[#8BAAA7] hover:bg-[#F8F6F1] disabled:opacity-50">
                <FiCpu /> {isSummaryLoading ? 'Analisando...' : 'Resumo com IA'}
              </button>
              <button onClick={() => setIsNewArgumentModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#D16C4B] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#B95B3D]">
                <FiPlus /> Novo argumento
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] px-4 py-5 lg:px-8">
        {(summary || summaryError) && (
          <div className="mb-5 rounded-2xl border border-[#C9D8D5] bg-[#F8FBFA] p-5">
            {summary && <>
              <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6E8F8D]">Síntese assistida</p><h2 className="mt-1 font-lora text-xl font-bold text-[#173B44]">Resumo do debate</h2></div><button onClick={() => setSummary(null)} className="rounded-lg p-2 text-[#758184] hover:bg-white" aria-label="Fechar resumo"><FiX /></button></div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#526166]">{summary}</p>
            </>}
            {summaryError && <p className="text-sm text-[#A64D3A]">{summaryError}</p>}
          </div>
        )}

        <div className={`grid min-h-[680px] gap-4 ${selectedArgument ? 'xl:grid-cols-[minmax(0,1fr)_430px]' : 'grid-cols-1'}`}>
          <main className="relative min-w-0 overflow-hidden rounded-2xl border border-[#D8D2C7] bg-white shadow-[0_12px_36px_rgba(38,55,60,0.06)]">
            <div className="flex items-center justify-between border-b border-[#E7E2D9] px-4 py-3 sm:px-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6E8F8D]">Mapa da conversa</p>
                <p className="mt-0.5 text-xs text-[#8A9295]">Selecione um argumento para abrir contexto, fontes e respostas.</p>
              </div>
              <div className="flex rounded-xl border border-[#D8D2C7] bg-[#F7F5F0] p-1">
                <button onClick={() => setViewMode('graph')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${viewMode === 'graph' ? 'bg-[#173B44] text-white shadow-sm' : 'text-[#687579] hover:bg-white'}`}><FiShare2 /> <span className="hidden sm:inline">Grafo</span></button>
                <button onClick={() => setViewMode('list')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${viewMode === 'list' ? 'bg-[#173B44] text-white shadow-sm' : 'text-[#687579] hover:bg-white'}`}><FiList /> <span className="hidden sm:inline">Lista</span></button>
              </div>
            </div>
            <div className="h-[620px] overflow-auto bg-[radial-gradient(circle_at_center,_rgba(94,152,147,0.08),_transparent_55%)]">
              {viewMode === 'graph'
                ? <DebateGraph argumentsTree={argumentsTree} onNodeClick={setSelectedArgument} />
                : <DebateList argumentsTree={argumentsTree} onSelectArgument={setSelectedArgument} />}
            </div>
          </main>

          {selectedArgument && (
            <aside className="min-h-[680px] overflow-hidden rounded-2xl border border-[#D8D2C7] bg-white shadow-[0_12px_36px_rgba(38,55,60,0.08)]">
              <ArgumentPanel argument={selectedArgument} onClose={() => setSelectedArgument(null)} onActionSuccess={fetchData} onSelectArgument={setSelectedArgument} />
            </aside>
          )}
        </div>
      </div>

      <NewArgumentModal isOpen={isNewArgumentModalOpen} onClose={() => setIsNewArgumentModalOpen(false)} topicId={topicId} onSuccess={fetchData} />
    </div>
  );
}

export default function TopicPage() {
  return <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#F4F2EC] text-[#667176]">Carregando debate...</div>}><TopicPageContent /></Suspense>;
}