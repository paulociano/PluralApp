'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CpuChipIcon,
  UserGroupIcon,
  PaintBrushIcon,
  ScaleIcon,
  SunIcon,
  BeakerIcon,
  TagIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import { TopicGridCardProps, TopicCategory } from '@/types'; // Importando tipos centralizados

const categoryIcons: Record<TopicCategory, React.ComponentType<{ className: string }>> = {
  TECNOLOGIA: CpuChipIcon,
  SOCIEDADE: UserGroupIcon,
  CULTURA: PaintBrushIcon,
  POLITICA: ScaleIcon,
  MEIO_AMBIENTE: SunIcon,
  CIENCIA: BeakerIcon,
  OUTRO: TagIcon
};

export default function TopicGridCard({ topic }: TopicGridCardProps) {
  const router = useRouter();
  const Icon = categoryIcons[topic.category] || TagIcon;

  // Função para navegar ao clicar no card
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Evita que o clique no link do título dispare esta função também
    if ((e.target as HTMLElement).tagName !== 'A') {
      router.push(`/topic/${topic.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex flex-col justify-between p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
      role="article"
      aria-labelledby={`topic-title-${topic.id}`}
    >
      <div>
        <div className="flex items-center text-xs font-bold uppercase text-[#2D4F5A] mb-2 font-manrope">
          <Icon className="h-4 w-4 mr-2" />
          <span>{topic.category.toLowerCase().replace('_', ' ')}</span>
        </div>
        
        {/* O título é o link principal */}
        <h3 id={`topic-title-${topic.id}`} className="font-lora text-xl font-semibold text-gray-800 mb-2">
            <Link href={`/topic/${topic.id}`} className="hover:underline" aria-label={`Debate sobre: ${topic.title}`}>
                {topic.title}
            </Link>
        </h3>

        <p className="font-manrope text-sm text-gray-600 line-clamp-3">{topic.description}</p>
      </div>
      <div className="flex items-center mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 font-manrope">
        <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mr-2" /> 
        <span>{topic._count?.arguments || 0} Argumentos</span>
      </div>
    </div>
  );
}