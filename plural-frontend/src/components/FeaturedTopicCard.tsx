import Link from 'next/link';
import { FiMessageSquare, FiUsers } from 'react-icons/fi';

// Adapte o tipo 'Topic' conforme necessário se tiver mais dados
type Topic = {
  id: string;
  title: string;
  description: string;
  category: string;
  _count?: { arguments: number };
  participantCount?: number;
};

type FeaturedTopicCardProps = {
  topic: Topic;
};

export default function FeaturedTopicCard({ topic }: FeaturedTopicCardProps) {
  return (
    <section className="mb-12 p-8 rounded-xl bg-gradient-to-br from-[#2D4F5A] to-[#3b6877] text-white shadow-2xl">
      <p className="mb-2 text-sm font-bold uppercase tracking-wider text-[#63A6A0]">Tópico em Destaque</p>
      <h2 className="font-lora text-4xl font-bold mb-4">{topic.title}</h2>
      <p className="text-lg text-gray-200 mb-6 max-w-3xl">{topic.description}</p>
      <div className="flex items-center space-x-6 mb-8 text-sm">
        <div className="flex items-center">
          <FiMessageSquare className="mr-2 text-[#63A6A0]" />
          <span>{topic._count?.arguments || 0} Argumentos</span>
        </div>
        <div className="flex items-center">
          <FiUsers className="mr-2 text-[#63A6A0]" />
          <span>{topic.participantCount || 0} Participantes</span>
        </div>
      </div>
      <Link
        href={`/topic/${topic.id}`}
        className="inline-block px-8 py-3 bg-[#63A6A0] hover:bg-white hover:text-[#2D4F5A] text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
      >
        Participar do Debate
      </Link>
    </section>
  );
}