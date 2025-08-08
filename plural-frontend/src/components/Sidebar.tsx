// Arquivo: src/components/Sidebar.tsx
'use client';

// No futuro, poderíamos buscar estas categorias da API
const categories = [
  'TECNOLOGIA',
  'SOCIEDADE',
  'CULTURA',
  'POLITICA',
  'MEIO_AMBIENTE',
  'CIENCIA',
  'OUTRO'
];

type SidebarProps = {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
};

export default function Sidebar({ selectedCategory, onSelectCategory }: SidebarProps) {
  return (
    <aside className="w-full lg:w-1/4 xl:w-1/5 p-4">
      <h3 className="font-bold text-lg text-[#2D4F5A] mb-4">Categorias</h3>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => onSelectCategory(null)} // Botão para limpar o filtro
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              !selectedCategory
                ? 'bg-[#63A6A0] text-white font-semibold'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos os Tópicos
          </button>
        </li>
        {categories.map((category) => (
          <li key={category}>
            <button
              onClick={() => onSelectCategory(category)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors capitalize ${
                selectedCategory === category
                  ? 'bg-[#63A6A0] text-white font-semibold'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.toLowerCase().replace('_', ' ')}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}