'use client';

import { useState } from 'react';
import api from '@/lib/api';
import Button from '@/components/Button';
import { FiCpu } from 'react-icons/fi';
import { ReplyFormProps, ArgumentAnalysis } from '@/types';

// Componente para exibir os resultados da análise da IA
const AnalysisResult = ({ analysis }: { analysis: ArgumentAnalysis }) => {
    // Função para mapear a pontuação para uma cor de barra de progresso
    const getScoreColor = (score: number) => {
        if (score <= 4) return 'bg-[#D16C4B]';
        if (score <= 7) return 'bg-[#C59A55]';
        return 'bg-[#5E9893]';
    };

    return (
        <div className="mt-4 space-y-3 rounded-xl border border-[#D8D2C7] bg-[#F8F6F1] p-4">
            <h5 className="font-lora text-base font-bold text-[#173B44]">Análise da IA</h5>
            {Object.entries(analysis).map(([key, value]) => (
                <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold uppercase text-gray-600">{key}</span>
                        <span className="text-xs font-bold text-gray-600">{value.score}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${getScoreColor(value.score)}`} style={{ width: `${value.score * 10}%` }}></div>
                    </div>
                    <p className="font-manrope text-xs text-gray-600 mt-1">{value.feedback}</p>
                </div>
            ))}
        </div>
    );
};

export default function ReplyForm({ onSubmit, isSubmitting }: ReplyFormProps) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<'PRO' | 'CONTRA' | 'NEUTRO'>('NEUTRO');
  const [referenceUrl, setReferenceUrl] = useState('');
  
  // Estados para a funcionalidade de análise com IA
  const [analysis, setAnalysis] = useState<ArgumentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content, type, referenceUrl);
    // Limpa todos os campos do formulário após o envio
    setContent('');
    setReferenceUrl('');
    setType('NEUTRO');
    setAnalysis(null);
    setAnalysisError('');
  };

  const handleAnalyze = async () => {
    if (content.length < 20) {
        setAnalysisError("Escreva ao menos 20 caracteres para uma análise eficaz.");
        return;
    }
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisError('');
    try {
      const response = await api.post('/ai/analyze/argument', { content });
      setAnalysis(response.data);
    } catch (error) {
      console.error("Erro ao analisar argumento", error);
      setAnalysisError("Não foi possível realizar a análise no momento.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4 border-t border-[#E7E2D9] pt-5">
      <h4 className="font-lora text-lg font-bold text-[#173B44]">Sua Resposta</h4>
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
      {/* Área de Texto para o Argumento */}
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-xl border border-[#D8D2C7] bg-[#FBFAF7] px-3 py-3 text-sm leading-6 text-[#45555A] outline-none transition focus:border-[#5E9893] focus:ring-2 focus:ring-[#5E9893]/15"
          rows={4}
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
          className="mt-1 block w-full rounded-xl border border-[#D8D2C7] bg-[#FBFAF7] px-3 py-2.5 text-sm text-[#45555A] outline-none focus:border-[#5E9893] focus:ring-2 focus:ring-[#5E9893]/15"
        />
      </div>

      {/* Botão e Resultado da Análise com IA */}
      <div>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing || isSubmitting}
          className="flex items-center gap-2 rounded-xl border border-[#B9CCC9] px-3 py-2 text-sm font-semibold text-[#447D77] transition hover:bg-[#F1F8F6] disabled:opacity-50"
        >
          <FiCpu />
          {isAnalyzing ? 'Analisando...' : 'Analisar com IA'}
        </button>
        {analysis && <AnalysisResult analysis={analysis} />}
        {analysisError && <p className="text-red-500 text-sm mt-2">{analysisError}</p>}
      </div>
      
      {/* Seleção de Tipo e Botão de Envio */}
      <div className="flex items-center justify-between">
        <Button type="submit" className="w-50%" disabled={isSubmitting || isAnalyzing}>
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </Button>
      </div>
    </form>
  );
}