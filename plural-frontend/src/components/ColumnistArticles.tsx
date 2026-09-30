'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Avatar from './Avatar';
import Link from 'next/link';
import TrainingTeaser from './TrainingTeaser';
import TopContributors from './TopContributors';
import { Article } from '@/types';

const stripHtml = (html: string) => {
  if (typeof window !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }
  return html;
};

export default function ColumnistArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/articles')
      .then(response => setArticles(response.data))
      .catch(error => console.error('Erro ao buscar artigos:', error))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 rounded-2xl border border-[#DDD7CC] bg-white p-5 shadow-[0_10px_30px_rgba(36,53,57,0.05)]">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6E8F8D]">Editorial</p>
        <h2 className="mt-1 font-lora text-xl font-bold text-[#173B44]">Artigos da Plural</h2>

        {isLoading ? (
          <p className="mt-5 text-sm text-[#7B8386]">Carregando artigos...</p>
        ) : (
          <div className="mt-5 space-y-5">
            {articles.slice(0, 3).map(article => (
              <article key={article.id} className="border-b border-[#EEEAE3] pb-5 last:border-b-0 last:pb-0">
                <Link href={`/article/${article.id}`}>
                  <h3 className="font-lora text-base font-semibold leading-6 text-[#2F4147] transition hover:text-[#5E9893]">{article.title}</h3>
                </Link>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#7B8386]">{stripHtml(article.content)}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Avatar name={article.authorName} size={28} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#46565A]">{article.authorName}</p>
                    {article.authorTitle && <p className="truncate text-[11px] text-[#969D9F]">{article.authorTitle}</p>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <TrainingTeaser />
        <TopContributors />
      </div>
    </aside>
  );
}
