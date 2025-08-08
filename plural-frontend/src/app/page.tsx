// Arquivo: src/app/page.tsx (Página Principal)
'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import TrendingTopics from '@/components/TrendingTopics'; // Importe o novo componente

type Topic = { id: string; title: string; description: string; category: string; };
type TrendingTopic = { id: string; title: string; _count: { arguments: number } };

export default function HomePage() {
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Buscamos os dados principais e de trending em paralelo
        const [topicsResponse, trendingResponse] = await Promise.all([
          axios.get('http://localhost:3000/debate/topics'),
          axios.get('http://localhost:3000/debate/trending')
        ]);
        setAllTopics(topicsResponse.data);
        setTrendingTopics(trendingResponse.data);
      } catch (error) {
        console.error("Erro ao buscar dados", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const filteredTopics = useMemo(() => {
    // ... (a lógica de filtragem continua a mesma)
    return allTopics
      .filter(topic => !selectedCategory || topic.category === selectedCategory)
      .filter(topic => {
        const query = searchQuery.toLowerCase();
        return topic.title.toLowerCase().includes(query) || topic.description.toLowerCase().includes(query);
      });
  }, [allTopics, selectedCategory, searchQuery]);

  // O if de loading foi movido para dentro do return
  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row">
        <Sidebar 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <main className="flex-1 p-8 border-l border-r border-gray-200">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-[#2D4F5A]">Tópicos em Destaque</h1>
          </header>

          <div className="mb-8">
            <SearchBar onSearch={setSearchQuery} />
          </div>

          {isLoading ? (
            <p className="text-gray-500 text-center">A carregar tópicos...</p>
          ) : (
            <div className="space-y-4">
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/topic/${topic.id}`}
                    className="block p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all"
                  >
                    {/* TEXTO MENOR AQUI */}
                    <h2 className="text-xl font-semibold text-[#63A6A0]">{topic.title}</h2>
                    <p className="mt-1 text-sm text-gray-600">{topic.description}</p>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-center">Nenhum tópico encontrado.</p>
              )}
            </div>
          )}
        </main>

        <TrendingTopics topics={trendingTopics} />
      </div>
    </div>
  );
}