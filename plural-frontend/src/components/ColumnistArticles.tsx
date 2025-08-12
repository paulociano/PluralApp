'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Avatar from './Avatar';
import Link from 'next/link';
import TrainingTeaser from './TrainingTeaser';
import TopContributors from './TopContributors';
import { Article } from '@/types';

// Função para remover tags HTML de uma string
const stripHtml = (html: string) => {
  if (typeof window !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }
  return html; // Fallback para o lado do servidor
};

export default function ColumnistArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await api.get('/articles');
        setArticles(response.data);
      } catch (error) {
        console.error("Erro ao buscar artigos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (isLoading) {
    return (
      <aside className="w-full lg:w-72 bg-white p-6 lg:min-h-screen border-r border-gray-200">
        <h2 className="font-lora font-bold text-lg text-[#2D4F5A] mb-4">Artigos da Plural</h2>
        <p className="font-manrope">Carregando artigos...</p>
      </aside>
    );
  }

  return (
    <aside className="w-full lg:w-72 bg-white p-6 lg:min-h-screen border-r border-gray-200">
      <h2 className="font-lora font-bold text-lg text-[#2D4F5A] mb-4">Artigos da Plural</h2>
      <div className="space-y-8">
        {articles.map(article => (
          <article key={article.id}>
            <Link href={`/article/${article.id}`}>
              <h3 className="font-lora font-semibold text-gray-800 hover:text-[#2D4F5A] cursor-pointer mb-2">
                {article.title}
              </h3>
            </Link>
            
            {/* --- CORREÇÃO AQUI --- */}
            <p className="font-manrope text-sm text-gray-600 line-clamp-3">
              {/* Usamos a função para exibir apenas o texto, sem as tags */}
              {stripHtml(article.content)}
            </p>

            <div className="flex items-center space-x-3 mt-3">
              <Avatar name={article.authorName} size={32} />
              <div>
                <p className="font-manrope font-semibold text-sm text-gray-900">{article.authorName}</p>
                {article.authorTitle && <p className="font-manrope text-xs text-gray-500">{article.authorTitle}</p>}
              </div>
            </div>
          </article>
        ))}
      </div>
      <TrainingTeaser />
      <TopContributors />
    </aside>
  );
}