import Link from 'next/link';
import { FiMessageSquare } from 'react-icons/fi';

// Adapte o tipo 'Topic' conforme necessário
type Topic = {
  id: string;
  title: string;
  description: string;
  category: string;
  _count?: { arguments: number };
};

type TopicGridCardProps = {
  topic: Topic;
};

export default function TopicGridCard({ topic }: TopicGridCardProps) {
  return (
    <Link
      href={`/topic/${topic.id}`}
      className="flex flex-col justify-between p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
    >
      <div>
        <p className="text-xs font-bold uppercase text-[#2D4F5A] mb-2">{topic.category}</p>
        <h3 className="font-lora text-xl font-semibold text-gray-800 mb-2">{topic.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-3">{topic.description}</p>
      </div>
      <div className="flex items-center mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
        <FiMessageSquare className="mr-2" />
        <span>{topic._count?.arguments || 0} Argumentos</span>
      </div>
    </Link>
  );
}