'use client';

import { useState } from 'react';
import Button from '@/components/Button'; // Assumindo que você tem um componente Button

type ReplyFormProps = {
  // A prop onSubmit foi atualizada para incluir referenceUrl
  onSubmit: (content: string, type: 'PRO' | 'CONTRA' | 'NEUTRO', referenceUrl: string) => void;
  isSubmitting: boolean;
};

export default function ReplyForm({ onSubmit, isSubmitting }: ReplyFormProps) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<'PRO' | 'CONTRA' | 'NEUTRO'>('NEUTRO');
  const [referenceUrl, setReferenceUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content, type, referenceUrl);
    // Limpa os campos após o envio
    setContent('');
    setReferenceUrl('');
    setType('NEUTRO');
  };

  // As linhas problemáticas foram removidas daqui

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t pt-4 space-y-4">
      <h4 className="font-semibold text-gray-800">Sua Resposta</h4>
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#63A6A0]"
          rows={3}
          placeholder="Escreva sua resposta..."
          required
        />
      </div>

      {/* Campo de Referência Opcional */}
      <div>
        <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
          Link de Referência (Opcional)
        </label>
        <input
          type="url"
          id="reference"
          value={referenceUrl}
          onChange={(e) => setReferenceUrl(e.target.value)}
          placeholder="https://exemplo.com/fonte"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      
      <div className="flex items-center justify-between">
        {/* Seleção de Tipo de Resposta */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input type="radio" name="replyType" value="PRO" checked={type === 'PRO'} onChange={() => setType('PRO')} className="form-radio text-green-600"/>
            <span className="ml-2 text-sm text-gray-700">Pró</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="replyType" value="CONTRA" checked={type === 'CONTRA'} onChange={() => setType('CONTRA')} className="form-radio text-red-600"/>
            <span className="ml-2 text-sm text-gray-700">Contra</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="replyType" value="NEUTRO" checked={type === 'NEUTRO'} onChange={() => setType('NEUTRO')} className="form-radio text-gray-600"/>
            <span className="ml-2 text-sm text-gray-700">Neutro</span>
          </label>
        </div>
        
        {/* Botão de Envio */}
        <Button type="submit" className="w-auto" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </Button>
      </div>
    </form>
  );
}