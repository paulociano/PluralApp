// Arquivo: src/app/page.tsx (Página Principal)
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

type Topic = {
  id: string;
  title: string;
  description: string;
};

export default function HomePage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get('http://localhost:3000/debate/topics');
        setTopics(response.data);
      } catch (error) {
        console.error("Erro ao buscar tópicos", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  if (isLoading) {
    return <div className="text-center p-10">Carregando tópicos...</div>;
  }

  return (
    // CORREÇÃO: Este div agora ocupa toda a tela, tem fundo branco e padding
    <div className="w-full min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-base font-bold text-[#2D4F5A]">Tópicos em Destaque</h1>
      </header>
      <div className="space-y-4">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topic/${topic.id}`}
            // Ajuste no estilo dos cards para contrastar com o fundo branco
            className="block p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all"
          >
            <h2 className="text-2xl font-semibold text-[#63A6A0]">{topic.title}</h2>
            <p className="mt-2 text-gray-600">{topic.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}