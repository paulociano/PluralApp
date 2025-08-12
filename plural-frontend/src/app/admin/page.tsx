/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ArticleEditorModal from '@/components/ArticleEditorModal';
import toast from 'react-hot-toast';
import { FiEdit, FiTrash, FiEye, FiPlus } from 'react-icons/fi'; // 1. Importe o ícone FiEye

import {
  Article,
  Report,
  PendingTopic,
} from '@/types';

export default function AdminPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [pendingTopics, setPendingTopics] = useState<PendingTopic[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, isAuthLoading, router]);
  
  const fetchData = useCallback(async () => {
    if (user?.role === 'ADMIN') {
      try {
        const [reportsRes, articlesRes, topicsRes] = await Promise.all([
          api.get('/admin/reports'),
          api.get('/articles/admin/all'),
          api.get('/admin/topics/pending')
        ]);
        setReports(reportsRes.data);
        setArticles(articlesRes.data);
        setPendingTopics(topicsRes.data);
      } catch (error) {
        console.error("Erro ao buscar dados do admin:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateReport = async (reportId: string, action: 'resolve' | 'dismiss') => {
    try {
      await api.patch(`/admin/reports/${reportId}/${action}`);
      setReports(prev => prev.filter(r => r.id !== reportId));
      toast.success('Denúncia atualizada com sucesso!');
    } catch (error) {
      toast.error(`Erro ao atualizar denúncia.`);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este artigo?')) {
      try {
        await api.delete(`/articles/${articleId}`);
        fetchData();
        toast.success('Artigo deletado com sucesso!');
      } catch (error) {
        toast.error('Erro ao deletar artigo.');
      }
    }
  };

  const handleUpdateTopic = async (topicId: string, action: 'approve' | 'reject') => {
    try {
      await api.patch(`/admin/topics/${topicId}/${action}`);
      setPendingTopics(prev => prev.filter(t => t.id !== topicId));
      toast.success(`Tópico ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso!`);
    } catch (error) {
      toast.error('Ocorreu um erro ao moderar o tópico.');
    }
  };

  const handleOpenCreateModal = () => { setEditingArticle(null); setIsModalOpen(true); };
  const handleOpenEditModal = (article: Article) => { setEditingArticle(article); setIsModalOpen(true); };
  const handleModalSuccess = () => { setIsModalOpen(false); setEditingArticle(null); fetchData(); };

  if (isAuthLoading || !user || user.role !== 'ADMIN') {
    return <div className="p-8">Verificando permissões...</div>;
  }

  return (
    <>
      {/* 2. CORREÇÃO: Adicionadas classes para fundo branco e cor de texto padrão */}
      <div className="max-w-7xl mx-auto p-8 bg-white min-h-screen text-[#2D4F5A]">
        <h1 className="font-lora text-4xl font-bold mb-8">Painel de Administração</h1>
        
        <section className="mb-12">
          <h2 className="font-lora text-2xl font-bold mb-4">Tópicos Pendentes de Aprovação</h2>
          <div className="space-y-4">
              {pendingTopics.length > 0 ? (
                pendingTopics.map(topic => (
                  <div key={topic.id} className="bg-gray-50 p-4 rounded-lg shadow border">
                    <p className="font-semibold">{topic.title}</p>
                    <p className="text-sm text-gray-500">
                      Sugerido por: <Link href={`/profile/${topic.createdBy.username || topic.createdBy.name}`} className="text-[#63A6A0] hover:underline">{topic.createdBy.name}</Link> em {new Date(topic.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-4 mt-4">
                      <button onClick={() => handleUpdateTopic(topic.id, 'approve')} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Aprovar</button>
                      <button onClick={() => handleUpdateTopic(topic.id, 'reject')} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Rejeitar</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">Nenhum tópico pendente para revisão.</p>
              )}
            </div>
        </section>

        <section className="mb-12">
          <h2 className="font-lora text-2xl font-bold mb-4">Denúncias Pendentes</h2>
          <div className="space-y-4">
              {reports.length > 0 ? (
                reports.map(report => (
                  <div key={report.id} className="bg-gray-50 p-4 rounded-lg shadow border">
                    <p className="font-semibold">Argumento Denunciado:</p>
                    <p className="italic text-gray-700 bg-gray-100 p-2 rounded my-2">{report.reportedArgument.content}</p>
                    <div className="text-sm space-y-1">
                      <p><strong>Motivo:</strong> {report.reason}</p>
                      {report.notes && <p><strong>Notas Adicionais:</strong> {report.notes}</p>}
                      <p className="text-xs text-gray-500 pt-1">
                        Denunciado por: <Link href={`/profile/${report.reporter.username || report.reporter.name}`} className="text-[#63A6A0] hover:underline">{report.reporter.name}</Link> em {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-4 mt-4">
                      <button onClick={() => handleUpdateReport(report.id, 'resolve')} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Marcar como Resolvida</button>
                      <button onClick={() => handleUpdateReport(report.id, 'dismiss')} className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">Dispensar Denúncia</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">Nenhuma denúncia pendente. Bom trabalho!</p>
              )}
            </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-lora text-2xl font-bold">Gerenciar Artigos</h2>
            <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-3 py-1 bg-[#2D4F5A] text-white rounded text-sm hover:bg-[#63A6A0]">
              <FiPlus /> Novo Artigo
            </button>
          </div>
          <div className="bg-white rounded-lg shadow border overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="p-3">Título</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {articles.map(article => (
                  <tr key={article.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-gray-800">{article.title}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${article.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {article.published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="p-3">
                      {/* 3. BOTÕES DE AÇÃO ALINHADOS À DIREITA */}
                      <div className="flex gap-4 justify-end">
                        <Link href={`/article/${article.id}`} target="_blank" title="Visualizar Artigo" className="text-gray-500 hover:text-blue-600">
                          <FiEye size={18} />
                        </Link>
                        <button onClick={() => handleOpenEditModal(article)} title="Editar Artigo" className="text-gray-500 hover:text-green-600">
                          <FiEdit size={18} />
                        </button>
                        <button onClick={() => handleDeleteArticle(article.id)} title="Deletar Artigo" className="text-gray-500 hover:text-red-600">
                          <FiTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <ArticleEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        articleToEdit={editingArticle}
      />
    </>
  );
}