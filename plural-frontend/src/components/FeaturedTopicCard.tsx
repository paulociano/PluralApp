'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMessageSquare, FiUsers } from 'react-icons/fi';
import { FeaturedTopicCardProps } from '@/types';

export default function FeaturedTopicCard({ topic }: FeaturedTopicCardProps) {
  const router = useRouter();

  // Função para navegar ao clicar no card
  const handleCardClick = () => {
    router.push(`/topic/${topic.id}`);
  };

  return (
    <section 
      onClick={handleCardClick}
      className="mb-12 p-8 rounded-xl bg-gradient-to-br from-[#2D4F5A] to-[#3b6877] text-white shadow-2xl cursor-pointer group"
      role="region"
      aria-labelledby={`featured-topic-title-${topic.id}`}
    >
      <p className="font-manrope mb-2 text-sm font-bold uppercase tracking-wider text-[#63A6A0]">Tópico em Destaque</p>
      
      {/* O título agora é o único link, para acessibilidade */}
      <h2 id={`featured-topic-title-${topic.id}`} className="font-lora text-4xl font-bold mb-4">
        <Link 
          href={`/topic/${topic.id}`} 
          className="text-white group-hover:underline"
          aria-label={`Debate sobre: ${topic.title}`}
        >
          {topic.title}
        </Link>
      </h2>
      
      <p className="font-manrope text-lg text-gray-200 mb-6 max-w-3xl">{topic.description}</p>
      
      <div className="font-manrope flex items-center space-x-6 mb-8 text-sm">
        <div className="flex items-center">
          <FiMessageSquare className="mr-2 text-[#63A6A0]" />
          <span>{topic._count?.arguments || 0} Argumentos</span>
        </div>
        <div className="flex items-center">
          <FiUsers className="mr-2 text-[#63A6A0]" />
          <span>{topic.participantCount || 0} Participantes</span>
        </div>
      </div>
      
      {/* O botão "Participar" também é um link claro */}
      <Link
        href={`/topic/${topic.id}`}
        className="inline-block px-8 py-3 bg-[#63A6A0] hover:bg-white hover:text-[#2D4F5A] text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
        aria-label={`Participar do debate sobre ${topic.title}`}
      >
        Participar do Debate
      </Link>
    </section>
  );
}