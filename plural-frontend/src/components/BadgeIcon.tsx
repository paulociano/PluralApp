import { IconType } from 'react-icons';
import { FiAward, FiFeather, FiGitMerge, FiMessageCircle, FiThumbsUp } from 'react-icons/fi';
import { BadgeIconProps } from '@/types';


const iconMap: Record<string, IconType> = {
FiFeather: FiFeather,
FiMessageCircle: FiMessageCircle,
FiThumbsUp: FiThumbsUp,
FiGitMerge: FiGitMerge,
FiAward: FiAward,
// Adicione outros ícones conforme necessário
};

export default function BadgeIcon({ iconName, size = 24, className = "" }: BadgeIconProps) {
const Icon = iconMap?.[iconName] || (() => <span>Ícone não encontrado</span>); // Fallback
return <Icon size={size} className={className} />;
}