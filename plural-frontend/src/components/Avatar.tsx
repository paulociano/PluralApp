import Image from 'next/image';

type AvatarProps = {
  name: string;
  size?: number; // Tamanho opcional, padrão 40px
};

export default function Avatar({ name, size = 40 }: AvatarProps) {
  // Constrói a URL para o ui-avatars.com
  // Ele gera uma imagem com as iniciais do nome fornecido.
  // Ex: name="Admin" -> URL com "&name=Admin"
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