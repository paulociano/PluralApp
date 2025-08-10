'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import TrendingTopics from '@/components/TrendingTopics';
import FeaturedTopicCard from '@/components/FeaturedTopicCard';
import TopicGridCard from '@/components/TopicGridCard';

// 1. Importe os ícones do Heroicons
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api'; // Usando a instância centralizada do Axios

type Topic = {
  id: string;
  title: string;
  description: string;
  category: string;
  _count: { arguments: number };
};

export default function HomePage() {
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [topicsResponse, trendingResponse] = await Promise.all([
          api.get('/debate/topics?includeArgumentCount=true'),
          api.get('/debate/trending')
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
    return allTopics
      .filter(topic => !selectedCategory || topic.category === selectedCategory)
      .filter(topic => {
        const query = searchQuery.toLowerCase();
        return topic.title.toLowerCase().includes(query) || topic.description.toLowerCase().includes(query);
      });
  }, [allTopics, selectedCategory, searchQuery]);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row">
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <main className="flex-1 p-8">
          <header className="mb-8">
            <h1 className="font-lora text-4xl font-bold text-[#2D4F5A]">Comunidade de Debates</h1>
            <p className="text-lg text-gray-500 mt-1">Explore, argumente e expanda sua perspectiva.</p>
          </header>

          <div className="mb-8">
            <SearchBar onSearch={setSearchQuery} />
          </div>

          {isLoading ? (
            <p className="text-gray-500 text-center">A carregar debates...</p>
          ) : (
            <>
              {filteredTopics.length > 0 ? (
                <>
                  {/* Seção Tópico Herói com novo ícone */}
                  <FeaturedTopicCard topic={filteredTopics[0]} />

                  {/* Seção Mais Debates com novo ícone */}
                  {filteredTopics.length > 1 && (
                    <div className="mt-12">
                      <h2 className="font-lora text-2xl font-bold text-[#2D4F5A] mb-6 flex items-center">
                        <ArrowTrendingUpIcon className="h-6 w-6 mr-3 text-[#63A6A0]" />
                        Mais Debates
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredTopics.slice(1).map((topic) => (
                          <TopicGridCard key={topic.id} topic={topic} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-center">Nenhum tópico encontrado.</p>
              )}
            </>
          )}
        </main>

        <TrendingTopics topics={trendingTopics} />
      </div>
    </div>
  );
}