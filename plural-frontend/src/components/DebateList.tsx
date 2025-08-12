'use client';

import { Argumento } from '@/types'; // Supondo que você tenha um tipo centralizado
import { FiArrowRight } from 'react-icons/fi';

// Componente recursivo para renderizar cada argumento e suas respostas
const ArgumentNode = ({ argument }: { argument: Argumento }) => {
  return (
    <li className="ml-4 pl-4 border-l border-gray-200 text-gray-800">
      <div className="p-3 bg-gray-50 rounded-md">
        <p className="font-semibold">{argument.author.name}</p>
        <p className="mt-1">{argument.content}</p>
      </div>
      {argument.replies && argument.replies.length > 0 && (
        <ul className="mt-2">
          {argument.replies.map(reply => (
            <ArgumentNode key={reply.id} argument={reply} />
          ))}
        </ul>
      )}
    </li>
  );
};

// Componente principal da lista
export default function DebateList({ argumentsTree }: { argumentsTree: Argumento[] }) {
  return (
    <div className="p-12 max-w-4xl mx-auto">
      <ul>
        {argumentsTree.map(argument => (
          <ArgumentNode key={argument.id} argument={argument} />
        ))}
      </ul>
    </div>
  );
}