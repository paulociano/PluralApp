/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function awardRetroactiveBeginnerBadge() {
  console.log('Iniciando script para conceder conquistas retroativas...');

  // 1. Encontra a conquista "Iniciante Curioso"
  const beginnerBadge = await prisma.badge.findUnique({
    where: { name: 'Iniciante Curioso' },
  });

  if (!beginnerBadge) {
    console.error(
      'Conquista "Iniciante Curioso" não encontrada no banco de dados. Rode o `db seed`.',
    );
    return;
  }

  // 2. Encontra todos os usuários que já criaram pelo menos 1 argumento
  const usersWithArguments = await prisma.user.findMany({
    where: {
      arguments: {
        some: {}, // Filtra usuários que têm pelo menos um argumento relacionado
      },
    },
    include: {
      badges: {
        // Inclui as conquistas que eles já têm
        select: {
          badgeId: true,
        },
      },
    },
  });

  console.log(
    `Encontrados ${usersWithArguments.length} usuários com argumentos.`,
  );

  let awardedCount = 0;

  // 3. Para cada usuário, verifica se ele já tem a conquista
  for (const user of usersWithArguments) {
    const hasBadge = user.badges.some((b) => b.badgeId === beginnerBadge.id);

    if (!hasBadge) {
      // 4. Se não tiver, concede a conquista
      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: beginnerBadge.id,
        },
      });
      console.log(
        `Conquista "Iniciante Curioso" concedida para o usuário: ${user.name}`,
      );
      awardedCount++;
    }
  }

  console.log(
    `Script finalizado. ${awardedCount} novas conquistas foram concedidas.`,
  );
}

awardRetroactiveBeginnerBadge()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
