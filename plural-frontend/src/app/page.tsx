'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';

type Topic = { id: string; title: string; description: string; category: string; };

export default function HomePage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // A busca de dados agora depende da categoria e da busca
  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      try {
        // Construímos os parâmetros da URL
        const params = new URLSearchParams();
        if (selectedCategory) {
          params.append('category', selectedCategory);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }

        // Enviamos os filtros para a API
        const response = await axios.get(`http://localhost:3000/debate/topics?${params.toString()}`);
        setTopics(response.data);

      } catch (error) {
        console.error("Erro ao buscar tópicos", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Adicionamos um debounce para não fazer uma chamada à API a cada tecla digitada
    const delayDebounceFn = setTimeout(() => {
      fetchTopics();
    }, 300); // Espera 300ms após o utilizador parar de digitar

    return () => clearTimeout(delayDebounceFn);
  }, [selectedCategory, searchQuery]); // Roda o efeito quando os filtros mudam

  if (isLoading) {
    return <div className="text-center p-10">A carregar tópicos...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
        <Sidebar 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <main className="flex-1 p-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-[#2D4F5A]">Tópicos em Destaque</h1>
          </header>

          <div className="mb-8">
            <SearchBar onSearch={setSearchQuery} />
          </div>

          <div className="space-y-4">
            {topics.length > 0 ? (
              topics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topic/${topic.id}`}
                  className="block p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all"
                >
                  <h2 className="text-2xl font-semibold text-[#63A6A0]">{topic.title}</h2>
                  <p className="mt-2 text-gray-600">{topic.description}</p>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center">Nenhum tópico encontrado com os filtros atuais.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}