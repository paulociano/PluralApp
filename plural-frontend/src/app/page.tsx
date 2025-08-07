// Arquivo: src/app/page.tsx
'use client';
import DebateGraph from '@/components/DebateGraph';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ArgumentCard from '@/components/ArgumentCard'; // Importa nosso novo componente

// Tipos para os dados que vamos buscar
type Topic = { id: string; title: string; };
type Argument = any; // Simplificando o tipo por agora

export default function HomePage() {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [argumentsTree, setArgumentsTree] = useState<Argument[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Este useEffect agora busca os dados sempre que a 'currentPage' mudar
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Primeiro, buscamos o tópico para ter seu ID
        if (!topic) {
          const topicResponse = await axios.get('http://localhost:3000/debate/featured-topic');
          setTopic(topicResponse.data);
        }

        // Se já temos o ID do tópico, buscamos a árvore de argumentos para a página atual
        if (topic) {
          const treeResponse = await axios.get(`http://localhost:3000/debate/tree/${topic.id}?page=${currentPage}&limit=5`);
          setArgumentsTree(treeResponse.data.data);
          setTotalPages(treeResponse.data.lastPage);
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Não foi possível carregar o debate.');
      }
    };

    fetchData();
  }, [currentPage, topic]); // A 'mágica' do React: rode este efeito quando 'currentPage' ou 'topic' mudar

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {topic && (
          <header className="mb-8 p-6 bg-white rounded-lg shadow text-center">
            <h1 className="text-4xl font-bold text-gray-900">{topic.title}</h1>
          </header>
        )}

        {error && <p className="text-red-500">{error}</p>}
        {!topic && !error && <p>Carregando debate...</p>}

        {/* AQUI ESTÁ A MUDANÇA PRINCIPAL */}
        <div className="bg-white rounded-lg shadow">
          <DebateGraph argumentsTree={argumentsTree} />
        </div>

      </div>
    </main>
  );
}