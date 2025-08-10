/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  await prisma.badge.createMany({
    data: [
      {
        name: 'Iniciante Curioso',
        description: 'Criou seu primeiro argumento.',
        icon: 'FiFeather',
      },
      {
        name: 'Voz Ativa',
        description: 'Criou 10 argumentos.',
        icon: 'FiMessageCircle',
      },
      {
        name: 'Argumento Popular',
        description: 'Recebeu 10 votos positivos em um único argumento.',
        icon: 'FiThumbsUp',
      },
      {
        name: 'Mente Aberta',
        description: 'Criou argumentos Pró e Contra no mesmo debate.',
        icon: 'FiGitMerge',
      },
      {
        name: 'Membro Veterano',
        description: 'Completou um ano na plataforma.',
        icon: 'FiAward',
      },
    ],
    skipDuplicates: true, // Não cria se o 'name' já existir
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
