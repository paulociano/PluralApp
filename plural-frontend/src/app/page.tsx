'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import CategoryMenuBar from '@/components/CategoryMenuBar'; // A nova barra de menu
import SearchBar from '@/components/SearchBar';
import TrendingTopics from '@/components/TrendingTopics';
import FeaturedTopicCard from '@/components/FeaturedTopicCard';
import TopicGridCard from '@/components/TopicGridCard';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import ColumnistArticles from '@/components/ColumnistArticles';

// Tipos e lógica de estados permanecem os mesmos
type Topic = {
  id: string;
  title: string;
  description: string;
  category: any; // Ajuste para o tipo correto se necessário
  _count: { arguments: number };
  participantCount?: number;
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
          api.get('/debate/topics?includeArgumentCount=true&includeParticipantCount=true'),
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
      {/* 1. A BARRA DE MENU DE CATEGORIAS AGORA FICA AQUI, FORA DO CONTAINER PRINCIPAL */}
      <CategoryMenuBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      
      <div className="max-w-screen-xl mx-auto flex">
        
        <ColumnistArticles />
        <main className="flex-1 p-8">

          <SearchBar onSearch={setSearchQuery} />
          
          <div className="mt-8">
            {isLoading ? (
              <p>Carregando debates...</p>
            ) : (
              <>
                {filteredTopics.length > 0 ? (
                  <>
                    <FeaturedTopicCard topic={filteredTopics[0]} />
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
                  <p>Nenhum tópico encontrado.</p>
                )}
              </>
            )}
          </div>
        </main>

        {/* Coluna de Tópicos em Alta (Direita) */}
        <TrendingTopics topics={trendingTopics} />
      </div>
    </div>
  );
}