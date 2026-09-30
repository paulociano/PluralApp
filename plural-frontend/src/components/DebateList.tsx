'use client';

import { Argumento } from '@/types';
import { FiArrowUp, FiMessageSquare } from 'react-icons/fi';

type Props = {
  argumentsTree: Argumento[];
  onSelectArgument?: (argument: Argumento) => void;
};

const typeStyles = {
  PRO: 'border-[#A8CEC8] bg-[#F1F8F6] text-[#447D77]',
  CONTRA: 'border-[#E5B8AA] bg-[#FCF3F0] text-[#A65B45]',
  NEUTRO: 'border-[#D7D2C9] bg-[#F6F4EF] text-[#6E777A]'
};

const ArgumentNode = ({ argument, depth, onSelectArgument }: { argument: Argumento; depth: number; onSelectArgument?: (argument: Argumento) => void }) => (
  <li className={depth ? 'ml-4 border-l border-[#DDD7CC] pl-4 sm:ml-7 sm:pl-6' : ''}>
    <button onClick={() => onSelectArgument?.(argument)} className="group my-2 w-full rounded-xl border border-[#E2DDD4] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#AFC8C4] hover:shadow-[0_10px_28px_rgba(36,53,57,0.07)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${typeStyles[argument.type] || typeStyles.NEUTRO}`}>{argument.type}</span>
          <span className="text-xs font-semibold text-[#506065]">{argument.author.name}</span>
        </div>
        <div className="flex gap-3 text-[11px] text-[#8A9295]"><span className="inline-flex items-center gap-1"><FiArrowUp /> {argument.votesCount}</span><span className="inline-flex items-center gap-1"><FiMessageSquare /> {argument.replyCount}</span></div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#45555A]">{argument.content}</p>
      <span className="mt-3 block text-xs font-bold text-[#5E9893] opacity-0 transition group-hover:opacity-100">Abrir argumento →</span>
    </button>
    {argument.replies?.length > 0 && <ul>{argument.replies.map(reply => <ArgumentNode key={reply.id} argument={reply} depth={depth + 1} onSelectArgument={onSelectArgument} />)}</ul>}
  </li>
);

export default function DebateList({ argumentsTree, onSelectArgument }: Props) {
  if (!argumentsTree.length) return <div className="grid h-full place-items-center p-8 text-sm text-[#7B8386]">Ainda não há argumentos neste debate.</div>;
  return <div className="mx-auto max-w-4xl p-4 sm:p-7"><ul>{argumentsTree.map(argument => <ArgumentNode key={argument.id} argument={argument} depth={0} onSelectArgument={onSelectArgument} />)}</ul></div>;
}