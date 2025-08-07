// Arquivo: src/components/ArgumentCard.tsx
'use client';

// Definimos os "tipos" de dados que este componente espera receber
type Argument = {
  id: string;
  content: string;
  author: {
    name: string;
  };
  votesCount: number;
  replyCount: number;
  replies?: Argument[]; // As respostas são um array do mesmo tipo (recursividade!)
};

// O 'Props' define as propriedades do nosso componente
type ArgumentCardProps = {
  argument: Argument;
  level?: number; // Para controlar o recuo das respostas
};

export default function ArgumentCard({ argument, level = 0 }: ArgumentCardProps) {
  // Calcula o recuo com base no nível de profundidade da resposta
  const indentation = { marginLeft: `${level * 2}rem` };

  return (
    <div style={indentation} className="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm">
      <p className="text-gray-800">{argument.content}</p>
      <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
        <span className="font-semibold">por: {argument.author.name}</span>
        <div className="flex space-x-4">
          <span>Votos: {argument.votesCount}</span>
          <span>Respostas: {argument.replyCount}</span>
        </div>
      </div>

      {/* Se houver respostas, renderiza um novo Card para cada uma, aumentando o nível */}
      {argument.replies && argument.replies.length > 0 && (
        <div className="mt-4 border-t pt-4">
          {argument.replies.map((reply) => (
            <ArgumentCard key={reply.id} argument={reply} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}