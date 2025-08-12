'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { FiX } from 'react-icons/fi';
import { EditProfileModalProps } from '@/types';

export default function EditProfileModal({ isOpen, onClose, onSuccess, currentUser }: EditProfileModalProps) {
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.patch('/users/me', { name, username, bio });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocorreu um erro.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-lora text-2xl font-bold text-[#2D4F5A]">Editar Perfil</h2>
          <button onClick={onClose}><FiX size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Campo Nome */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome de Exibição</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
          </div>
          {/* Campo Username (URL) */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nome de Usuário (para URL)</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="ex: paulo-silva" />
            <p className="text-xs text-gray-500 mt-1">Apenas letras, números e hífens. Usado na barra de endereços.</p>
          </div>
          {/* Campo Bio */}
          <div className="mb-4">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#2D4F5A] rounded-md hover:bg-opacity-90">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  );
}