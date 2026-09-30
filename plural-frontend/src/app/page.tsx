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
import { FiPlus, FiMessageCircle, FiCompass, FiTrendingUp } from 'react-icons/fi';

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
        console.error('Erro ao buscar dados', error);
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

  const totalArguments = allTopics.reduce((total, topic) => total + (topic._count?.arguments || 0), 0);

  return (
    <>
      <div className="min-h-screen bg-[#F4F2EC]">
        <section className="border-b border-[#D8D2C7] bg-[#153B44] text-white">
          <div className="mx-auto grid max-w-[1480px] gap-8 px-6 py-10 lg:grid-cols-[1.45fr_.55fr] lg:px-10 lg:py-14">
            <div className="max-w-4xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#B8D8D5]">
                <FiCompass /> Praça pública para ideias
              </div>
              <h1 className="font-lora text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Debate bom não precisa ser barulhento.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-white/75 sm:text-lg">
                Explore argumentos opostos, acompanhe fontes, encontre nuances e entre em discussões onde a ideia importa mais do que o volume.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 self-end">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <FiMessageCircle className="mb-4 text-xl text-[#88C5BE]" />
                <div className="text-3xl font-bold">{totalArguments}</div>
                <div className="mt-1 text-sm text-white/60">argumentos publicados</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <FiTrendingUp className="mb-4 text-xl text-[#88C5BE]" />
                <div className="text-3xl font-bold">{allTopics.length}</div>
                <div className="mt-1 text-sm text-white/60">debates para explorar</div>
              </div>
            </div>
          </div>
        </section>

        <CategoryMenuBar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

        <div className="mx-auto grid max-w-[1480px] grid-cols-1 gap-6 px-4 py-6 md:px-6 lg:grid-cols-[260px_minmax(0,1fr)_260px] lg:px-8 xl:gap-8">
          <ColumnistArticles />

          <main className="min-w-0">
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#DDD7CC] bg-white p-5 shadow-[0_12px_36px_rgba(38,55,60,0.06)] sm:p-6">
              <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6E8F8D]">Descobrir</p>
                  <h2 className="mt-1 font-lora text-3xl font-bold text-[#173B44]">Comunidade de Debates</h2>
                  <p className="mt-1 text-sm text-[#667176]">Filtre por tema ou encontre diretamente uma discussão.</p>
                </div>
                <button
                  onClick={() => setIsSuggestModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D16C4B] px-5 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#B95B3D] focus:outline-none focus:ring-2 focus:ring-[#D16C4B]/30"
                >
                  <FiPlus />
                  Sugerir tópico
                </button>
              </div>
              <SearchBar onSearch={setSearchQuery} value={searchQuery} />
            </div>

            {isLoading ? (
              <div className="rounded-2xl border border-[#DDD7CC] bg-white p-8 text-[#667176]">Carregando debates...</div>
            ) : filteredTopics.length > 0 ? (
              <>
                <FeaturedTopicCard topic={filteredTopics[0]} />
                {filteredTopics.length > 1 && (
                  <section className="mt-8">
                    <div className="mb-5 flex items-end justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6E8F8D]">Continue explorando</p>
                        <h2 className="mt-1 font-lora text-2xl font-bold text-[#173B44]">Mais debates</h2>
                      </div>
                      <span className="text-sm text-[#7B8386]">{filteredTopics.length - 1} tópicos</span>
                    </div>
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                      {filteredTopics.slice(1).map(topic => (
                        <TopicGridCard key={topic.id} topic={topic} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#CFC7BA] bg-white/70 p-10 text-center text-[#667176]">
                Nenhum tópico encontrado com esses filtros.
              </div>
            )}
          </main>

          <TrendingTopics topics={trendingTopics} />
        </div>
      </div>

      <SuggestTopicModal isOpen={isSuggestModalOpen} onClose={() => setIsSuggestModalOpen(false)} />
    </>
  );
}
