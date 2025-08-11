/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, FormEvent } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// 1. REMOVEMOS A IMPORTAÇÃO DO @prisma/client
// Em vez disso, definimos as categorias diretamente no frontend.
// Esta lista deve ser idêntica ao seu enum 'TopicCategory' no schema.prisma.
const categories = [
  'TECNOLOGIA',
  'SOCIEDADE',
  'CULTURA',
  'POLITICA',
  'MEIO_AMBIENTE',
  'CIENCIA',
  'OUTRO',
] as const; // 'as const' garante que os tipos sejam literais de string

type TopicCategory = typeof categories[number]; // Cria um tipo a partir do array

export default function SuggestTopicModal({ isOpen, onClose }: ModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TopicCategory>('OUTRO');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/debate/topics', { title, description, category });
      toast.success('Sugestão enviada com sucesso! Seu tópico será revisado pela moderação.');
      // Limpa o formulário e fecha o modal
      setTitle('');
      setDescription('');
      setCategory('OUTRO');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível enviar sua sugestão.');
      toast.error('Ocorreu um erro ao enviar sua sugestão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-lora text-2xl font-bold text-[#2D4F5A]">Sugerir Novo Tópico</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <FiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título do Debate</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TopicCategory)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md capitalize"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.toLowerCase().replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-[#2D4F5A] rounded-md hover:bg-opacity-90">
              {isSubmitting ? 'Enviando...' : 'Enviar para Análise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}