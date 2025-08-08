// Arquivo: src/components/ReplyForm.tsx
'use client';

import { useState } from 'react';
import Button from './Button';

type ReplyFormProps = {
  onSubmit: (content: string, type: 'PRO' | 'CONTRA') => Promise<void>;
  isSubmitting: boolean;
};

export default function ReplyForm({ onSubmit, isSubmitting }: ReplyFormProps) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<'PRO' | 'CONTRA'>('PRO');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return; // Não envia se estiver vazio
    onSubmit(content, type);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t pt-4">
      <h4 className="font-semibold text-gray-800 mb-2">Sua Resposta</h4>
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="text-gray-700 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Escreva sua resposta..."
          required
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input type="radio" name="replyType" value="PRO" checked={type === 'PRO'} onChange={() => setType('PRO')} className="form-radio text-blue-600"/>
            <span className="ml-2 text-gray-700">Pró</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="replyType" value="CONTRA" checked={type === 'CONTRA'} onChange={() => setType('CONTRA')} className="form-radio text-red-600"/>
            <span className="ml-2 text-gray-700">Contra</span>
          </label>
        </div>
      </div>
      <Button type="submit" className="w-auto" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando..' : 'Enviar'}
        </Button>
    </form>
  );
}