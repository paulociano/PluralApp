'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import TopicGridCard from './TopicGridCard'; // Reutilizamos nosso card de tópico

export default function ActiveDebates() {
  const [activeTopics, setActiveTopics] = useState([]);

  useEffect(() => {
    api.get('/debate/topics/active')
      .then(response => setActiveTopics(response.data))
      .catch(error => console.error("Erro ao buscar debates ativos:", error));
  }, []);

  if (activeTopics.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="font-lora text-2xl font-bold text-[#2D4F5A] mb-6">Debates Mais Ativos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeTopics.map((topic) => (
          <TopicGridCard key={topic.id} topic={topic} />
        ))}
      </div>
    </section>
  );
}