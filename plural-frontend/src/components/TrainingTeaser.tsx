'use client';

import Link from 'next/link';
import { FiTarget } from 'react-icons/fi'; // Um ícone que remete a treino/alvo

export default function TrainingTeaser() {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h2 className="font-lora font-bold text-lg text-[#2D4F5A] mb-4">Academia de Debates</h2>
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <FiTarget className="mx-auto text-3xl text-[#63A6A0]" />
        <p className="font-manrope text-sm text-gray-700 mt-2 mb-4">
          Aprimore seu pensamento crítico. Aprenda a identificar falácias lógicas em textos de exemplo.
        </p>
        <Link 
          href="/training"
          className="inline-block px-4 py-2 bg-[#2D4F5A] text-white text-sm font-semibold rounded-md hover:bg-opacity-90"
        >
          Começar a Treinar
        </Link>
      </div>
    </div>
  );
}