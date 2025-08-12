import Link from 'next/link';
// 1. GARANTA QUE TODAS ESTAS IMPORTAÇÕES DE ÍCONES ESTEJAM CORRETAS
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
import { TopicCategory } from '@/types';

// O mapa de ícones que traduz o nome da categoria para um componente de ícone
const categoryIcons: Record<TopicCategory, React.ComponentType<{ className: string }>> = {
  TECNOLOGIA: CpuChipIcon,
  SOCIEDADE: UserGroupIcon,
  CULTURA: PaintBrushIcon,
  POLITICA: ScaleIcon,
  MEIO_AMBIENTE: SunIcon,
  CIENCIA: BeakerIcon,
  OUTRO: TagIcon
};
import { TopicGridCardProps } from '@/types';


export default function TopicGridCard({ topic }: TopicGridCardProps) {
  // 2. Lógica de seleção do ícone. Usamos TagIcon como um fallback seguro.
  const Icon = categoryIcons[topic.category] || TagIcon;

  return (
    <Link
      href={`/topic/${topic.id}`}
      className="flex flex-col justify-between p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
    >
      <div>
        <div className="flex items-center text-xs font-bold uppercase text-[#2D4F5A] mb-2 font-manrope">
          {/* 3. A renderização do ícone. A variável 'Icon' deve ser um componente válido */}
          <Icon className="h-4 w-4 mr-2" />
          <span>{topic.category.toLowerCase().replace('_', ' ')}</span>
        </div>
        
        <h3 className="font-lora text-xl font-semibold text-gray-800 mb-2">{topic.title}</h3>
        <p className="font-manrope text-sm text-gray-600 line-clamp-3">{topic.description}</p>
      </div>
      <div className="flex items-center mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 font-manrope">
        {/* Usando o novo ícone do Heroicons */}
        <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mr-2" /> 
        <span>{topic._count?.arguments || 0} Argumentos</span>
      </div>
    </Link>
  );
}