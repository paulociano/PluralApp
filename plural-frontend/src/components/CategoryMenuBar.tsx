'use client';

import React from 'react';
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

type CategoryMenuBarProps = {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
};

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

export default function CategoryMenuBar({ selectedCategory, onSelectCategory }: CategoryMenuBarProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Usamos 'flex' para alinhar horizontalmente e 'overflow-x-auto' para rolagem em telas pequenas */}
        <div className="flex items-center justify-center space-x-4 py-2 overflow-x-auto whitespace-nowrap">
          {/* Botão "Todas" */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              selectedCategory === null
                ? 'bg-[#2D4F5A] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <HomeIcon className="h-4 w-4" />
            <span>Todas</span>
          </button>

          {/* Separador */}
          <div className="w-px h-6 bg-gray-200"></div>

          {/* Mapeamento das categorias */}
          {categories.map((category) => {
            const Icon = categoryIcons[category];
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors capitalize ${
                  isSelected
                    ? 'bg-[#2D4F5A] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.toLowerCase().replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}