'use client';

import { useState, useEffect, FormEvent } from 'react';
import api from '@/lib/api';
import { FiX } from 'react-icons/fi';
import LexicalEditor from './LexicalEditor';
import { ModalProps } from '@/types';

export default function ArticleEditorModal({ isOpen, onClose, onSuccess, articleToEdit }: ModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorTitle, setAuthorTitle] = useState('');
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (articleToEdit) {
        setTitle(articleToEdit.title);
        setContent(articleToEdit.content);
        setAuthorName(articleToEdit.authorName);
        setAuthorTitle(articleToEdit.authorTitle || '');
        setPublished(articleToEdit.published);
      } else {
        setTitle('');
        setContent('');
        setAuthorName('');
        setAuthorTitle('');
        setPublished(false);
      }
    }
  }, [articleToEdit, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    const articleData = { title, content, authorName, authorTitle, published };
    try {
      if (articleToEdit) {
        await api.patch(`/articles/${articleToEdit.id}`, articleData);
      } else {
        await api.post('/articles', articleData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocorreu um erro ao salvar o artigo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 text-[#2D4F5A] flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b shrink-0">
          <h2 className="font-lora text-2xl font-bold text-[#2D4F5A]">{articleToEdit ? 'Editar Artigo' : 'Novo Artigo'}</h2>
          <button type="button" onClick={onClose}><FiX size={24} /></button>
        </div>
        <form id="article-form" onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div>
              <label className="text-sm font-semibold text-gray-700">Título</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded-md mt-1" required />
            </div>
            <div className="flex flex-col min-h-[400px]">
              <label className="text-sm font-semibold text-gray-700 mb-1">Conteúdo</label>
              {/* A 'key' força o editor a reiniciar completamente ao mudar de artigo */}
              <LexicalEditor
                key={articleToEdit?.id || 'new-article'}
                initialHtml={content}
                onChange={setContent}
              />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="text-sm font-semibold text-gray-700">Nome do Colunista</label>
                <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full p-2 border rounded-md mt-1" required />
              </div>
              <div className="w-1/2">
                <label className="text-sm font-semibold text-gray-700">Cargo do Colunista</label>
                <input type="text" value={authorTitle} onChange={(e) => setAuthorTitle(e.target.value)} placeholder="Ex: Filósofo" className="w-full p-2 border rounded-md mt-1" />
              </div>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="published" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
              <label htmlFor="published" className="ml-2 text-sm text-gray-700">Publicado</label>
            </div>
          </div>
          <div className="p-6 border-t flex justify-end items-center gap-4 shrink-0">
            {error && <p className="text-red-500 text-sm mr-auto">{error}</p>}
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#2D4F5A] rounded-md hover:bg-opacity-90"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}