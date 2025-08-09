'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiCalendar, FiMessageSquare, FiCheckSquare } from 'react-icons/fi';

// Tipos para os dados do perfil
type ProfileData = {
  id: string;
  name: string;
  createdAt: string;
  _count: { arguments: number; votes: number; };
  recentArguments: {
    id: string;
    content: string;
    createdAt: string;
    topic: { id: string; title: string; };
  }[];
};

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:3000/users/${userId}/profile`);
        setProfile(response.data);
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (isLoading) {
    return <div className="text-center p-10">Carregando perfil...</div>;
  }

  if (!profile) {
    return <div className="text-center p-10">Perfil não encontrado.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Cabeçalho do Perfil */}
      <header className="mb-12">
        <h1 className="font-lora text-5xl font-bold text-[#2D4F5A]">{profile.name}</h1>
        <div className="flex items-center space-x-6 mt-4 text-gray-500">
          <div className="flex items-center">
            <FiCalendar className="mr-2" />
            <span>Membro desde {new Date(profile.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center">
            <FiMessageSquare className="mr-2" />
            <span>{profile._count.arguments} argumentos criados</span>
          </div>
          <div className="flex items-center">
            <FiCheckSquare className="mr-2" />
            <span>{profile._count.votes} votos realizados</span>
          </div>
        </div>
      </header>

      {/* Atividade Recente */}
      <section>
        <h2 className="font-lora text-2xl font-bold text-[#2D4F5A] mb-6">Atividade Recente</h2>
        <div className="space-y-4">
          {profile.recentArguments.length > 0 ? (
            profile.recentArguments.map(arg => (
              <div key={arg.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                <p className="text-sm text-gray-700">"{arg.content}"</p>
                <div className="text-xs text-gray-500 mt-2">
                  Em <Link href={`/topic/${arg.topic.id}`} className="font-semibold text-[#63A6A0] hover:underline">
                    {arg.topic.title}
                  </Link>
                  {' - '}
                  {new Date(arg.createdAt).toLocaleString('pt-BR')}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Nenhuma atividade recente.</p>
          )}
        </div>
      </section>
    </div>
  );
}