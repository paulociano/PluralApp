import Image from 'next/image';
import { AvatarProps } from '@/types';

export default function Avatar({ name, size = 40 }: AvatarProps) {
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=2D4F5A&color=fff&bold=true`;

  return (
    <Image
      src={avatarUrl}
      alt={`Avatar de ${name}`}
      width={size}
      height={size}
      className="rounded-full"
      priority // Carrega a imagem com prioridade
    />
  );
}