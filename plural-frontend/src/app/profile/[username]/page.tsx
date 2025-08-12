'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
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
import {
  ProfileData,
  ArgumentoFavorito,
} from '@/types';

function ProfilePageContent() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  
  const { user: loggedInUser } = useAuth();
  const { setIsTopicPage, setTopicActions } = useHeader();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [favorites, setFavorites] = useState<ArgumentoFavorito[]>([]);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [hasMoreFavorites, setHasMoreFavorites] = useState(true);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(false);

  const fetchProfileData = useCallback(async () => {
    if (!username) return;

    setIsLoading(true);
    setFavorites([]);
    setFavoritesPage(1);
    setHasMoreFavorites(true);

    try {
      const profileResponse = await api.get(`/users/by-username/${username}`);
      const profileData: ProfileData = profileResponse.data;
      setProfile(profileData);

      if (profileData && profileData.id) {
        const favoritesResponse = await api.get(`/users/${profileData.id}/favorites?page=1&limit=10`);
        setFavorites(favoritesResponse.data.data);
        if (favoritesResponse.data.page >= favoritesResponse.data.lastPage) {
          setHasMoreFavorites(false);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados do perfil:", error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [username]);
  
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleLoadMoreFavorites = async () => {
    if (!profile || isFavoritesLoading || !hasMoreFavorites) return;

    const nextPage = favoritesPage + 1;
    setIsFavoritesLoading(true);

    try {
      const response = await api.get(`/users/${profile.id}/favorites?page=${nextPage}&limit=10`);
      setFavorites(prev => [...prev, ...response.data.data]);
      setFavoritesPage(nextPage);
      if (response.data.page >= response.data.lastPage) {
        setHasMoreFavorites(false);
      }
    } catch (error) {
      console.error("Erro ao carregar mais favoritos:", error);
    } finally {
      setIsFavoritesLoading(false);
    }
  };

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

  if (isLoading) return <div className="text-center p-10 bg-white min-h-screen">Carregando perfil...</div>;
  if (!profile) return <div className="text-center p-10 bg-white min-h-screen">Perfil não encontrado.</div>;

  const beginnerBadge = !profile.badges.length && profile.allBadges
    ? profile.allBadges.find(b => b.name === 'Iniciante Curioso') 
    : null;

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
            ) : beginnerBadge ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-3xl text-gray-400 mx-auto">
                  <BadgeIcon iconName={beginnerBadge.icon} size={32} />
                </div>
                <h4 className="font-semibold mt-4">{beginnerBadge.name}</h4>
                <p className="text-sm text-gray-500 mt-1 mb-4">{beginnerBadge.description}</p>
                <Link href="/" className="px-4 py-2 bg-[#63A6A0] text-white text-sm font-semibold rounded-md hover:bg-[#2D4F5A]">
                  Encontrar um debate
                </Link>
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
                      <p className="font-manrope text-sm text-gray-800 line-clamp-2">{arg.content}</p>
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
              {favorites.map(fav => (
                <div key={fav.id} className="p-4 border border-gray-200 rounded-lg bg-white flex items-start space-x-4 transition-shadow hover:shadow-md">
                  <FiBookmark className="text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-manrope text-sm text-gray-800 line-clamp-2">{fav.argument.content}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      No tópico <Link href={`/topic/${fav.argument.topic.id}?argumentId=${fav.argument.id}`} className="font-semibold text-[#63A6A0] hover:underline">
                        {fav.argument.topic.title}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {isFavoritesLoading && <p className="text-center mt-4 text-sm text-gray-500">Carregando...</p>}
            {hasMoreFavorites && !isFavoritesLoading && favorites.length > 0 && (
              <div className="mt-6 text-center">
                <button onClick={handleLoadMoreFavorites} className="px-4 py-2 bg-gray-100 rounded-md text-sm font-semibold hover:bg-gray-200">
                  Carregar Mais
                </button>
              </div>
            )}
             {favorites.length === 0 && !isFavoritesLoading && (
                <p className="text-gray-500 mt-4">Nenhum argumento favoritado ainda.</p>
            )}
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

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="text-center p-10 bg-white min-h-screen">Carregando...</div>}>
            <ProfilePageContent />
        </Suspense>
    )
}