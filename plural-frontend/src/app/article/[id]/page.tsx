'use client';
import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import Avatar from '@/components/Avatar';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

type Article = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorTitle: string | null;
  createdAt: string;
};

function ArticlePageContent() {
  const params = useParams();
  const articleId = params.id as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!articleId) return;

    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/articles/${articleId}`);
        setArticle(response.data);
      } catch (error) {
        console.error("Erro ao buscar o artigo:", error);
        setArticle(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticle();
  }, [articleId]);

  if (isLoading) {
    return <div className="text-center p-12">Carregando artigo...</div>;
  }

  if (!article) {
    return <div className="text-center p-12">Artigo não encontrado.</div>;
  }

  return (
    <div className="bg-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-manrope">
            <FiArrowLeft />
            Voltar para a página principal
          </Link>
        </div>

        <article>
          <header className="mb-8 border-b pb-8">
            <h1 className="font-lora text-4xl md:text-5xl font-bold text-[#2D4F5A] leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center space-x-4 mt-6">
              <Avatar name={article.authorName} size={48} />
              <div>
                <p className="font-manrope font-semibold text-gray-900">{article.authorName}</p>
                {article.authorTitle && <p className="font-manrope text-sm text-gray-500">{article.authorTitle}</p>}
              </div>
            </div>
            <p className="font-manrope text-sm text-gray-400 mt-2">
              Publicado em {new Date(article.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </header>

          <div className="font-manrope text-lg text-gray-800 leading-relaxed space-y-6 whitespace-pre-wrap">
            {article.content}
          </div>
        </article>
      </div>
    </div>
  );
}

export default function ArticlePage() {
    return (
        <Suspense fallback={<div className="text-center p-12">Carregando...</div>}>
            <ArticlePageContent />
        </Suspense>
    )
}