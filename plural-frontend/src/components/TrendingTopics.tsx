import Link from 'next/link';
import { TrendingTopicsProps } from '@/types';

export default function TrendingTopics({ topics }: TrendingTopicsProps) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 rounded-2xl border border-[#DDD7CC] bg-white p-5 shadow-[0_10px_30px_rgba(36,53,57,0.05)]">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6E8F8D]">Em movimento</p>
        <h3 className="mt-1 font-lora text-xl font-bold text-[#173B44]">Trending topics</h3>

        <ol className="mt-5 space-y-1">
          {topics.slice(0, 6).map((topic, index) => (
            <li key={topic.id}>
              <Link
                href={`/topic/${topic.id}`}
                className="group flex gap-3 rounded-xl px-2 py-3 transition hover:bg-[#F5F2EC]"
              >
                <span className="pt-0.5 text-sm font-bold tabular-nums text-[#B7B0A6]">0{index + 1}</span>
                <span className="min-w-0">
                  <span className="line-clamp-2 font-semibold leading-5 text-[#35454A] transition group-hover:text-[#173B44]">{topic.title}</span>
                  <span className="mt-1 block text-xs text-[#8A9295]">{topic._count.arguments} argumentos</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
