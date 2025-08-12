'use client';

import { FiSearch } from 'react-icons/fi';
import { SearchBarProps } from '@/types';


export default function SearchBar({ onSearch, value }: SearchBarProps) {
  return (
    <div className="relative">
      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value} // O valor do input agora é controlado pelo estado da página pai
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Buscar tópicos por palavra-chave..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#63A6A0]"
      />
    </div>
  );
}