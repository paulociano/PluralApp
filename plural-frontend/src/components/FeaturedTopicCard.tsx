'use client';

import Link from 'next/link';
import { FiArrowUpRight, FiMessageSquare, FiUsers } from 'react-icons/fi';
import { FeaturedTopicCardProps } from '@/types';

export default function FeaturedTopicCard({ topic }: FeaturedTopicCardProps) {
  return (
    <section
      className="group relative overflow-hidden rounded-[28px] border border-[#294E55] bg-[#173B44] p-7 text-white shadow-[0_24px_60px_rgba(23,59,68,0.18)] sm:p-9"
      aria-labelledby={`featured-topic-title-${topic.id}`}
    >
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10 bg-white/5" />
      <div className="pointer-events-none absolute -bottom-24 right-20 h-52 w-52 rounded-full border border-[#7DB9B3]/15" />

      <div className="relative max-w-4xl">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#8CC8C1]">Debate em destaque</p>
        <h2 id={`featured-topic-title-${topic.id}`} className="max-w-3xl font-lora text-3xl font-bold leading-tight sm:text-4xl">
          <Link href={`/topic/${topic.id}`} className="outline-none transition-opacity hover:opacity-80 focus:underline">
            {topic.title}
          </Link>
        </h2>

        <p className="mt-4 max-w-3xl text-base leading-7 text-white/72 sm:text-lg">{topic.description}</p>

        <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-white/70">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <FiMessageSquare className="text-[#8CC8C1]" />
            {topic._count?.arguments || 0} argumentos
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <FiUsers className="text-[#8CC8C1]" />
            {topic.participantCount || 0} participantes
          </span>
        </div>

        <Link
          href={`/topic/${topic.id}`}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#D16C4B] px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#E07A58] focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          Entrar no debate
          <FiArrowUpRight />
        </Link>
      </div>
    </section>
  );
}
