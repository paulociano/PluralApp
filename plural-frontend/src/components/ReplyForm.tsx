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
        if (score <= 4) return 'bg-red-500';
        if (score <= 7) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-3">
            <h5 className="font-semibold text-sm text-gray-800">Análise da IA</h5>
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
    <form onSubmit={handleSubmit} className="mt-4 border-t pt-4 space-y-4">
      <h4 className="font-semibold text-gray-800">Sua Resposta</h4>
      
      {/* Área de Texto para o Argumento */}
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="font-manrope text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#63A6A0]"
          rows={4}
          placeholder="Escreva sua resposta..."
          required
        />
      </div>

      {/* Botão e Resultado da Análise com IA */}
      <div>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing || isSubmitting}
          className="flex items-center gap-2 text-sm px-3 py-1.5 border rounded-md text-purple-700 border-purple-300 hover:bg-purple-50 disabled:opacity-50 transition-colors"
        >
          <FiCpu />
          {isAnalyzing ? 'Analisando...' : 'Analisar com IA'}
        </button>
        {analysis && <AnalysisResult analysis={analysis} />}
        {analysisError && <p className="text-red-500 text-sm mt-2">{analysisError}</p>}
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
      
      {/* Seleção de Tipo e Botão de Envio */}
      <div className="flex items-center justify-between">
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
        
        <Button type="submit" className="w-auto" disabled={isSubmitting || isAnalyzing}>
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </Button>
      </div>
    </form>
  );
}