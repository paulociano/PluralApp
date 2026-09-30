'use client';

import Link from 'next/link';
import {
  CpuChipIcon,
  UserGroupIcon,
  PaintBrushIcon,
  ScaleIcon,
  SunIcon,
  BeakerIcon,
  TagIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowUpRightIcon
} from '@heroicons/react/24/outline';
import { TopicGridCardProps, TopicCategory } from '@/types';

const categoryIcons: Record<TopicCategory, React.ComponentType<{ className: string }>> = {
  TECNOLOGIA: CpuChipIcon,
  SOCIEDADE: UserGroupIcon,
  CULTURA: PaintBrushIcon,
  POLITICA: ScaleIcon,
  MEIO_AMBIENTE: SunIcon,
  CIENCIA: BeakerIcon,
  OUTRO: TagIcon
};

export default function TopicGridCard({ topic }: TopicGridCardProps) {
  const Icon = categoryIcons[topic.category] || TagIcon;

  return (
    <article className="group flex min-h-[250px] flex-col justify-between rounded-2xl border border-[#DDD7CC] bg-white p-6 shadow-[0_10px_30px_rgba(36,53,57,0.05)] transition hover:-translate-y-1 hover:border-[#B7CBC8] hover:shadow-[0_18px_46px_rgba(36,53,57,0.10)]">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#5E8583]">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#EAF1EF]">
            <Icon className="h-4 w-4" />
          </span>
          <span>{topic.category.toLowerCase().replace('_', ' ')}</span>
        </div>

        <h3 id={`topic-title-${topic.id}`} className="mt-5 font-lora text-2xl font-semibold leading-snug text-[#20383F]">
          <Link href={`/topic/${topic.id}`} className="transition-colors hover:text-[#5E9893] focus:underline">
            {topic.title}
          </Link>
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#687377]">{topic.description}</p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-[#EEEAE3] pt-4 text-sm text-[#7B8386]">
        <span className="inline-flex items-center gap-2">
          <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
          {topic._count?.arguments || 0} argumentos
        </span>
        <Link href={`/topic/${topic.id}`} aria-label={`Abrir debate: ${topic.title}`} className="grid h-9 w-9 place-items-center rounded-full bg-[#F1EEE7] text-[#173B44] transition group-hover:bg-[#173B44] group-hover:text-white">
          <ArrowUpRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
