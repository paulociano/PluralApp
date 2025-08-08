// Arquivo: src/components/TrendingTopics.tsx
'use client';
import Link from 'next/link';

type Topic = {
  id: string;
  title: string;
  _count: {
    arguments: number;
  };
};

type TrendingTopicsProps = {
  topics: Topic[];
};

export default function TrendingTopics({ topics }: TrendingTopicsProps) {
  return (
    <aside className="w-full lg:w-1/4 xl:w-1/5 p-4 hidden lg:block">
      <div className="sticky top-20">
        <h3 className="font-bold text-lg text-[#2D4F5A] mb-4">Trending Topics</h3>
        <ul className="space-y-3">
          {topics.map((topic, index) => (
            <li key={topic.id} className="flex items-start">
              <span className="text-xl font-bold text-gray-300 mr-3">{index + 1}</span>
              <div>
                <Link
                  href={`/topic/${topic.id}`}
                  className="font-semibold text-gray-700 hover:text-[#63A6A0] transition-colors"
                >
                  {topic.title}
                </Link>
                <p className="text-sm text-gray-500">{topic._count.arguments} argumentos</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}