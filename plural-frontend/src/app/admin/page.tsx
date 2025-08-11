'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ArticleEditorModal from '@/components/ArticleEditorModal'; // Importa o novo modal

// Tipos
type Report = {
  id: string;
  reason: string;
  notes: string | null;
  createdAt: string;
  reporter: { name: string; username: string | null };
  reportedArgument: { id: string; content: string; authorId: string };
};

type Article = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorTitle: string | null;
  published: boolean;
};

export default function AdminPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  
  // Estados para controlar o modal
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
        const [reportsResponse, articlesResponse] = await Promise.all([
          api.get('/admin/reports'),
          api.get('/articles/admin/all')
        ]);
        setReports(reportsResponse.data);
        setArticles(articlesResponse.data);
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
    } catch (error) {
      console.error(`Erro ao ${action} denúncia:`, error);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este artigo?')) {
      try {
        await api.delete(`/articles/${articleId}`);
        fetchData(); // Recarrega todos os dados
      } catch (error) {
        alert('Erro ao deletar artigo.');
      }
    }
  };

  // Funções para abrir o modal em diferentes modos
  const handleOpenCreateModal = () => {
    setEditingArticle(null); // Garante que não há artigo em edição
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (article: Article) => {
    setEditingArticle(article); // Define o artigo a ser editado
    setIsModalOpen(true);
  };

  // Função chamada pelo modal em caso de sucesso
  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingArticle(null);
    fetchData(); // Recarrega a lista de artigos
  };

  if (isAuthLoading || !user || user.role !== 'ADMIN') {
    return <div className="p-8">Verificando permissões...</div>;
  }

  return (
    <>
      <div className="max-w-7xl bg-white mx-auto p-8">
        <h1 className="font-lora text-4xl font-bold text-[#2D4F5A] mb-8">Painel de Administração</h1>
        
        <section className="mb-12">
          <h2 className="font-lora text-2xl font-bold text-[#2D4F5A] mb-4">Denúncias Pendentes</h2>
          {/* ... (código da tabela de denúncias) ... */}
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-lora text-2xl font-bold text-[#2D4F5A]">Gerenciar Artigos</h2>
            <button onClick={handleOpenCreateModal} className="px-3 py-1 bg-[#2D4F5A] text-white rounded text-sm hover:bg-blue-700">
              + Novo Artigo
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <table className="w-full text-gray-800 text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Título</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {articles.map(article => (
                  <tr key={article.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{article.title}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${article.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {article.published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="p-2 flex gap-2">
                      <button onClick={() => handleOpenEditModal(article)} className="text-blue-600 hover:underline text-sm">Editar</button>
                      <button onClick={() => handleDeleteArticle(article.id)} className="text-red-600 hover:underline text-sm">Deletar</button>
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