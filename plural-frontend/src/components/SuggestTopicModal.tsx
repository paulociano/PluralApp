'use client';

import { useState, FormEvent } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { TopicCategory, ModalProps } from '@/types';
import AccessibleModal from './AcessibleModal';

const categories: TopicCategory[] = [
  'TECNOLOGIA', 'SOCIEDADE', 'CULTURA', 'POLITICA', 
  'MEIO_AMBIENTE', 'CIENCIA', 'OUTRO'
];

export default function SuggestTopicModal({ isOpen, onClose }: ModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TopicCategory>('OUTRO');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/debate/topics', { title, description, category });
      toast.success('Sugestão enviada! Seu tópico será revisado.');
      setTitle(''); setDescription(''); setCategory('OUTRO');
      onClose();
    } catch (error) {
      toast.error('Não foi possível enviar sua sugestão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // 2. Substitua a estrutura antiga do modal pelo nosso componente acessível
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Sugerir Novo Tópico"
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título do Debate</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value as TopicCategory)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md capitalize">
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.toLowerCase().replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-[#2D4F5A] rounded-md hover:bg-opacity-90">
            {isSubmitting ? 'Enviando...' : 'Enviar para Análise'}
          </button>
        </div>
      </form>
    </AccessibleModal>
  );
}