// Arquivo: src/components/ReportArgumentModal.tsx

'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ReportArgumentModalProps } from '@/types';

// As razões devem corresponder ao seu enum `ReportReason` no `schema.prisma`
const reportReasons = [
  { key: 'SPAM', label: 'Spam' },
  { key: 'OFFENSIVE', label: 'Conteúdo Ofensivo' },
  { key: 'DISINFORMATION', label: 'Desinformação' },
  { key: 'OTHER', label: 'Outro' },
];

export default function ReportArgumentModal({
  isOpen,
  onClose,
  onSuccess,
  argumentId,
}: ReportArgumentModalProps) {
  const { token } = useAuth();
  const [reason, setReason] = useState<string>(reportReasons[0].key);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError('Por favor, selecione um motivo.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await axios.post(
        `http://localhost:3000/api/debate/argument/${argumentId}/report`,
        { reason, notes },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Erro ao enviar denúncia. Você já pode ter denunciado este argumento.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-[#2D4F5A]">Denunciar Argumento</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Motivo</label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#63A6A0] focus:border-[#63A6A0] sm:text-sm rounded-md"
            >
              {reportReasons.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Detalhes (Opcional)
            </label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-[#63A6A0] focus:border-[#63A6A0]"
              placeholder="Forneça mais informações, se necessário."
            ></textarea>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-[#2D4F5A] rounded-md hover:bg-opacity-90 disabled:opacity-50">{isSubmitting ? 'Enviando...' : 'Enviar Denúncia'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}