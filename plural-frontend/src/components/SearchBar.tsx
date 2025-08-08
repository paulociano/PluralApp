// Arquivo: src/components/SearchBar.tsx
'use client';

import { FiSearch } from 'react-icons/fi';

type SearchBarProps = {
  onSearch: (query: string) => void;
};

export default function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Buscar tópicos por palavra-chave..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#63A6A0]"
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <FiSearch className="text-gray-400" />
      </div>
    </div>
  );
}