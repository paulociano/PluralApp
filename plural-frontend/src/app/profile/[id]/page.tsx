/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiMessageSquare, FiCheckSquare, FiBookmark, FiStar } from 'react-icons/fi';
import Avatar from '@/components/Avatar';
import BadgeIcon from '@/components/BadgeIcon';

// --- DEFINIÇÃO DE TIPOS ---
type Argumento = {
  id: string;
  content: string;
  createdAt: string;
  topic: { id: string; title: string; };
};

type ArgumentoFavorito = {
  id: string;
  argument: Argumento; // Aninhamos o argumento dentro do favorito
};

type ProfileData = {
  id: string;
  name: string;
  createdAt: string;
  _count: { arguments: number; votes: number; };
  recentArguments: Argumento[];
  badges: UserBadge[];
};

type Badge = { id: string; name: string; description: string; icon: string; };
type UserBadge = { id: string; badge: Badge; };

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [favorites, setFavorites] = useState<ArgumentoFavorito[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        // Usamos Promise.all para buscar dados do perfil e favoritos em paralelo
        const [profileResponse, favoritesResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/users/${userId}/profile`),
          axios.get(`http://localhost:3000/api/users/${userId}/favorites`) // Nova rota
        ]);
        
        setProfile(profileResponse.data);
        setFavorites(favoritesResponse.data);
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [userId]);

  if (isLoading) {
    return <div className="text-center p-10 bg-white min-h-screen">Carregando perfil...</div>;
  }

  if (!profile) {
    return <div className="text-center p-10 bg-white min-h-screen">Perfil não encontrado.</div>;
  }

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-8">
        {/* Cabeçalho Hero */}
        <header className="text-center mb-10 flex flex-col items-center justify-center">
          <Avatar name={profile.name} size={96}/>
          <h1 className="font-lora text-5xl font-bold text-[#2D4F5A] mb-2">{profile.name}</h1>
          <p className="text-gray-500">Membro desde {new Date(profile.createdAt).toLocaleDateString('pt-BR')}</p>
        </header>

        {/* Estatísticas em Destaque (Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
            <FiMessageSquare className="mx-auto text-2xl text-[#63A6A0] mb-2" />
            <span className="font-bold text-3xl text-gray-800">{profile._count.arguments}</span>
            <p className="text-gray-600 text-sm mt-1">Argumentos Criados</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
            <FiCheckSquare className="mx-auto text-2xl text-[#63A6A0] mb-2" />
            <span className="font-bold text-3xl text-gray-800">{profile._count.votes}</span>
            <p className="text-gray-600 text-sm mt-1">Votos Realizados</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
            <FiStar className="mx-auto text-2xl text-[#63A6A0] mb-2" />
            <span className="font-bold text-3xl text-gray-800">{profile.badges.length}</span>
            <p className="text-gray-600 text-sm mt-1">Conquistas</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-lora text-2xl font-bold text-[#2D4F5A] mb-6">Conquistas</h2>
          {profile.badges.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {profile.badges.map(userBadge => (
                <div key={userBadge.id} className="group relative flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-3xl text-yellow-500">
                    <BadgeIcon iconName={userBadge.badge.icon} size={32} />
                  </div>
                  <p className="text-xs text-gray-800 font-semibold mt-2">{userBadge.badge.name}</p>
                  {/* Tooltip com a descrição */}
                  <div className="absolute bottom-full mb-2 w-48 p-2 bg-[#2D4F5A] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {userBadge.badge.description}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma conquista desbloqueada ainda.</p>
          )}
        </section>

        {/* Atividade Recente */}
        <section className="mb-12">
          <h2 className="font-lora text-2xl font-bold text-[#2D4F5A] mb-6">Atividade Recente</h2>
          <div className="space-y-4">
            {profile.recentArguments.length > 0 ? (
              profile.recentArguments.map(arg => (
                <div key={arg.id} className="p-4 border border-gray-200 rounded-lg bg-white flex items-start space-x-4 transition-shadow hover:shadow-md">
                  <FiMessageSquare className="text-[#2D4F5A] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-800 line-clamp-2">"{arg.content}"</p>
                    <div className="text-xs text-gray-500 mt-2">
                      Em <Link href={`/topic/${arg.topic.id}?argumentId=${arg.id}`} className="font-semibold text-[#63A6A0] hover:underline">
                        {arg.topic.title}
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Nenhuma atividade recente.</p>
            )}
          </div>
        </section>
        
        {/* --- NOVA SEÇÃO: ARGUMENTOS FAVORITOS --- */}
        <section>
          <h2 className="font-lora text-2xl font-bold text-[#2D4F5A] mb-6">Argumentos Favoritos</h2>
          <div className="space-y-4">
            {favorites.length > 0 ? (
              favorites.map(fav => (
                <div key={fav.id} className="p-4 border border-gray-200 rounded-lg bg-white flex items-start space-x-4 transition-shadow hover:shadow-md">
                  <FiBookmark className="text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-800 line-clamp-2">"{fav.argument.content}"</p>
                    <div className="text-xs text-gray-500 mt-2">
                      No tópico <Link href={`/topic/${fav.argument.topic.id}?argumentId=${fav.argument.id}`} className="font-semibold text-[#63A6A0] hover:underline">
                        {fav.argument.topic.title}
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Nenhum argumento favoritado ainda.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}