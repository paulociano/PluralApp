'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import CategoryMenuBar from '@/components/CategoryMenuBar';
import SearchBar from '@/components/SearchBar';
import TrendingTopics from '@/components/TrendingTopics';
import FeaturedTopicCard from '@/components/FeaturedTopicCard';
import TopicGridCard from '@/components/TopicGridCard';
import ColumnistArticles from '@/components/ColumnistArticles';
import SuggestTopicModal from '@/components/SuggestTopicModal';
import { FiPlus } from 'react-icons/fi';
// A importação do @prisma/client foi removida

// O tipo agora é uma união de strings literais
type TopicCategory = 'TECNOLOGIA' | 'SOCIEDADE' | 'CULTURA' | 'POLITICA' | 'MEIO_AMBIENTE' | 'CIENCIA' | 'OUTRO';

type Topic = {
  id: string;
  title: string;
  description: string;
  category: TopicCategory;
  _count: { arguments: number };
  participantCount?: number;
};

export default function HomePage() {
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

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
    <>
      <div className="w-full min-h-screen bg-gray-50">
        <CategoryMenuBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        
        <div className="max-w-screen-xl mx-auto flex">
          <ColumnistArticles />
          <main className="flex-1 p-8">
            <header className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="font-lora text-4xl font-bold text-[#2D4F5A]">Comunidade de Debates</h1>
                  <p className="font-manrope text-lg text-gray-500 mt-1">Explore, argumente e expanda sua perspectiva.</p>
                </div>
                <button 
                  onClick={() => setIsSuggestModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#63A6A0] text-white font-semibold rounded-md hover:bg-[#2D4F5A] transition-colors"
                >
                  <FiPlus />
                  Sugerir Tópico
                </button>
              </div>
            </header>

            {/* O SearchBar agora recebe e exibe o valor do estado searchQuery */}
            <SearchBar onSearch={setSearchQuery} value={searchQuery} />
            
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
                           <h2 className="font-lora text-2xl font-bold text-[#2D4F5A] mb-6">Mais Debates</h2>
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
          <TrendingTopics topics={trendingTopics} />
        </div>
      </div>
      <SuggestTopicModal 
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
      />
    </>
  );
}