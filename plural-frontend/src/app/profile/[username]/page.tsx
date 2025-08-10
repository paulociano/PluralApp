/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMessageSquare, FiCheckSquare, FiBookmark, FiStar, FiArrowLeft, FiEdit2, FiZap } from 'react-icons/fi';
import { useHeader } from '@/context/HeaderContext';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/Avatar';
import BadgeIcon from '@/components/BadgeIcon';
import EditProfileModal from '@/components/EditProfileModal';

// --- DEFINIÇÃO DE TIPOS ---
type Argumento = {
  id: string;
  content: string;
  createdAt: string;
  topic: { id: string; title: string; };
};

type ArgumentoFavorito = {
  id: string;
  argument: Argumento;
};

type Badge = { id: string; name: string; description: string; icon: string; };
type UserBadge = { id: string; badge: Badge; };

type ProfileData = {
  id: string;
  name: string;
  username: string | null;
  bio: string | null;
  createdAt: string;
  points: number;
  _count: { arguments: number; votes: number; };
  recentArguments: Argumento[];
  badges: UserBadge[];
};

function ProfilePageContent() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  
  const { user: loggedInUser } = useAuth();
  const { setIsTopicPage, setTopicActions } = useHeader();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [favorites, setFavorites] = useState<ArgumentoFavorito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProfileData = useCallback(async () => {
    if (!username) return;
    setIsLoading(true);
    try {
      // 1. Busca os dados do perfil pelo username
      const profileResponse = await api.get(`/users/by-username/${username}`);
      const profileData: ProfileData = profileResponse.data;
      setProfile(profileData);
      
      // 2. Com o ID do perfil, busca os favoritos
      if (profileData && profileData.id) {
        const favoritesResponse = await api.get(`/users/${profileData.id}/favorites`);
        setFavorites(favoritesResponse.data);
      }

    } catch (error) {
      console.error("Erro ao buscar dados do perfil:", error);
      setProfile(null); // Limpa o perfil em caso de erro (ex: 404)
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  // Efeito para buscar os dados quando o username mudar
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);
  
  // Efeito para controlar o Header
  useEffect(() => {
    setIsTopicPage(true); 
    setTopicActions(
      <button onClick={() => router.back()} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" aria-label="Voltar">
        <FiArrowLeft size={20} />
      </button>
    );
    return () => {
      setIsTopicPage(false);
      setTopicActions(null);
    };
  }, [setIsTopicPage, setTopicActions, router]);

  const isOwnProfile = loggedInUser && loggedInUser.id === profile?.id;

  if (isLoading) {
    return <div className="text-center p-10 bg-white min-h-screen">Carregando perfil...</div>;
  }

  if (!profile) {
    return <div className="text-center p-10 bg-white min-h-screen">Perfil não encontrado.</div>;
  }

  return (
    <>
      <div className="bg-white min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-8">
          <header className="text-center mb-10 flex flex-col items-center justify-center">
            <div className="mb-4">
              <Avatar name={profile.name} size={96} />
            </div>
            <h1 className="font-lora text-5xl font-bold text-[#2D4F5A] mb-2">{profile.name}</h1>
            <p className="text-gray-500">Membro desde {new Date(profile.createdAt).toLocaleDateString('pt-BR')}</p>
            {profile.bio && <p className="text-gray-600 mt-4 max-w-2xl">{profile.bio}</p>}
            {isOwnProfile && (
              <button onClick={() => setIsEditModalOpen(true)} className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#63A6A0] rounded-md hover:bg-opacity-90 transition-transform hover:scale-105">
                <FiEdit2 size={16} />
                Editar Perfil
              </button>
            )}
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
              <FiZap className="mx-auto text-2xl text-purple-500 mb-2" />
              <span className="font-bold text-3xl text-gray-800">{profile.points}</span>
              <p className="text-gray-600 text-sm mt-1">Pontos</p>
            </div>
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
                  <div key={userBadge.id} className="group relative flex flex-col items-center text-center w-20">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-3xl text-yellow-500">
                      <BadgeIcon iconName={userBadge.badge.icon} size={32} />
                    </div>
                    <p className="text-xs text-gray-800 font-semibold mt-2">{userBadge.badge.name}</p>
                    <div className="absolute bottom-full mb-2 w-48 p-2 bg-[#2D4F5A] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {userBadge.badge.description}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma conquista desbloqueada ainda.</p>
            )}
          </section>

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
      {isOwnProfile && profile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={fetchProfileData}
          currentUser={profile}
        />
      )}
    </>
  );
}

// O componente principal exportado usa Suspense para lidar com os hooks de navegação
export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="text-center p-10 bg-white min-h-screen">Carregando...</div>}>
            <ProfilePageContent />
        </Suspense>
    )
}