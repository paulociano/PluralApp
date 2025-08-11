'use client';

import { useState, useEffect } from 'react';

// Lista de frases que irão rotacionar
const phrases = [
  "Entender é o novo curtir!",
  "Debates que constroem pontes.",
  "Explore diferentes perspectivas.",
  "Sua voz tem poder."
];

export default function TypingAnimation() {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    // Se o texto foi completamente apagado, começa a digitar a próxima frase
    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % phrases.length);
    }

    // Se a frase foi completamente digitada, começa a apagar
    if (subIndex === phrases[index].length && !isDeleting) {
      // Pausa por 2 segundos antes de começar a apagar
      setTimeout(() => setIsDeleting(true), 2000);
    }

    const timeout = setTimeout(() => {
      // Lógica para digitar ou apagar
      const newSubIndex = subIndex + (isDeleting ? -1 : 1);
      setText(phrases[index].substring(0, newSubIndex));
      setSubIndex(newSubIndex);
    }, isDeleting ? 75 : 150); // Velocidade de apagar vs. de digitar

    return () => clearTimeout(timeout);
  }, [subIndex, index, isDeleting]);

  return (
    <span className="font-manrope text-lg text-gray-700">
      {text}
      <span className="animate-pulse">|</span>
    </span>
  );
}