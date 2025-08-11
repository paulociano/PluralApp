'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

type Fallacy = { id: string; name: string; description: string };
type Exercise = { id: string; text: string };
type Feedback = { isCorrect: boolean; explanation: string };

export default function TrainingPage() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [options, setOptions] = useState<Fallacy[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNewExercise = async () => {
    setIsLoading(true);
    setFeedback(null);
    setSelectedAnswer(null);
    try {
      const response = await api.get('/training/exercise');
      setExercise(response.data.exercise);
      setOptions(response.data.options);
    } catch (error) {
      console.error("Erro ao buscar exercício", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewExercise();
  }, []);

  const handleCheckAnswer = async () => {
    if (!selectedAnswer || !exercise) return;
    try {
      const response = await api.post(`/training/exercise/${exercise.id}/check`, { answerId: selectedAnswer });
      setFeedback(response.data);
    } catch (error) {
      console.error("Erro ao verificar resposta", error);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Carregando exercício...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white text-gray-700">
      <h1 className="font-lora text-4xl font-bold text-center mb-8">Treinamento de Falácias</h1>
      
      {exercise ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="font-semibold mb-4">Analise o texto a seguir:</p>
          <p className="italic bg-gray-50 p-4 rounded mb-6">"{exercise.text}"</p>
          
          <p className="font-semibold mb-4">Qual falácia lógica está presente?</p>
          <div className="space-y-3">
            {options.map(option => (
              <button
                key={option.id}
                onClick={() => setSelectedAnswer(option.id)}
                disabled={!!feedback}
                className={`w-full text-left p-3 border rounded-lg transition-all ${
                  selectedAnswer === option.id ? 'bg-[#2D4F5A] text-white' : 'hover:bg-gray-100'
                } ${feedback && (feedback.isCorrect && selectedAnswer === option.id ? 'bg-green-500 text-white' : '')}
                   ${feedback && (!feedback.isCorrect && selectedAnswer === option.id ? 'bg-red-500 text-white' : '')}`}
              >
                {option.name}
              </button>
            ))}
          </div>

          {feedback ? (
            <div className={`mt-6 p-4 rounded ${feedback.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
              <h3 className={`font-bold ${feedback.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {feedback.isCorrect ? 'Correto!' : 'Incorreto.'}
              </h3>
              <p className="text-sm mt-2">{feedback.explanation}</p>
              <button onClick={fetchNewExercise} className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded font-semibold">
                Próximo Exercício
              </button>
            </div>
          ) : (
            <button onClick={handleCheckAnswer} disabled={!selectedAnswer} className="mt-6 px-6 py-2 bg-[#63A6A0] text-white rounded font-semibold disabled:opacity-50">
              Verificar Resposta
            </button>
          )}
        </div>
      ) : (
        <p>Não há exercícios disponíveis no momento.</p>
      )}
    </div>
  );
}