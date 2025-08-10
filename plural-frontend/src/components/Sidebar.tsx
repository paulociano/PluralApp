'use client';

import React from 'react';
// Importe os ícones do Heroicons
import {
  HomeIcon,
  CpuChipIcon,
  UserGroupIcon,
  PaintBrushIcon,
  ScaleIcon,
  SunIcon,
  BeakerIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { TopicCategory } from '@prisma/client';

// 1. DEFINIÇÃO DAS PROPS QUE O COMPONENTE ACEITA
type SidebarProps = {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
};

// Mapa de ícones para cada categoria
const categoryIcons: Record<TopicCategory, React.ComponentType<{ className: string }>> = {
  TECNOLOGIA: CpuChipIcon,
  SOCIEDADE: UserGroupIcon,
  CULTURA: PaintBrushIcon,
  POLITICA: ScaleIcon,
  MEIO_AMBIENTE: SunIcon,
  CIENCIA: BeakerIcon,
  OUTRO: TagIcon
};

const categories = Object.keys(categoryIcons) as TopicCategory[];

// 2. O COMPONENTE AGORA RECEBE E USA AS PROPS
export default function Sidebar({ selectedCategory, onSelectCategory }: SidebarProps) {
  return (
    <aside className="w-full lg:w-64 bg-white lg:border-r lg:border-gray-200 p-6 lg:min-h-screen">
      <h2 className="font-bold text-lg text-gray-800 mb-4">Categorias</h2>
      <nav>
        <ul>
          {/* Botão "Todas" */}
          <li className="mb-2">
            <button
              onClick={() => onSelectCategory(null)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                selectedCategory === null
                  ? 'bg-[#2D4F5A] text-white font-semibold' // Estilo quando selecionado
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' // Estilo padrão
              }`}
            >
              <HomeIcon className="h-5 w-5" />
              <span>Todas</span>
            </button>
          </li>
          {/* Mapeamento dinâmico das outras categorias */}
          {categories.map((category) => {
            const Icon = categoryIcons[category];
            const isSelected = selectedCategory === category;
            return (
              <li key={category} className="mb-2">
                <button
                  onClick={() => onSelectCategory(category)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left capitalize ${
                    isSelected
                      ? 'bg-[#2D4F5A] text-white font-semibold' // Estilo quando selecionado
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' // Estilo padrão
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{category.toLowerCase().replace('_', ' ')}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}