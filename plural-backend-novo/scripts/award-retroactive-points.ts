import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Define as regras de pontuação em um só lugar para fácil manutenção
const PONTOS_POR_ARGUMENTO = 5;
const PONTOS_POR_UPVOTE_RECEBIDO = 2;
const PONTOS_POR_DOWNVOTE_RECEBIDO = -1;

async function main() {
  console.log('Iniciando script para calcular pontos retroativos...');

  // 1. Pega todos os usuários do banco de dados
  const allUsers = await prisma.user.findMany();
  console.log(`Encontrados ${allUsers.length} usuários para processar.`);

  // 2. Itera sobre cada usuário para calcular sua pontuação
  for (const user of allUsers) {
    // 2.1 Calcula pontos por argumentos criados
    const argumentCount = await prisma.argument.count({
      where: { authorId: user.id },
    });
    const pointsFromArguments = argumentCount * PONTOS_POR_ARGUMENTO;

    // 2.2 Calcula pontos por votos recebidos
    const userArguments = await prisma.argument.findMany({
      where: { authorId: user.id },
      select: { id: true },
    });

    let pointsFromVotes = 0;
    if (userArguments.length > 0) {
      const userArgumentIds = userArguments.map((arg) => arg.id);

      const upvoteCount = await prisma.vote.count({
        where: {
          argumentId: { in: userArgumentIds },
          type: 'UPVOTE',
        },
      });

      const downvoteCount = await prisma.vote.count({
        where: {
          argumentId: { in: userArgumentIds },
          type: 'DOWNVOTE',
        },
      });

      pointsFromVotes =
        upvoteCount * PONTOS_POR_UPVOTE_RECEBIDO +
        downvoteCount * PONTOS_POR_DOWNVOTE_RECEBIDO;
    }

    // 3. Soma a pontuação total
    const totalPoints = pointsFromArguments + pointsFromVotes;

    // 4. Atualiza o usuário no banco de dados
    await prisma.user.update({
      where: { id: user.id },
      data: { points: totalPoints },
    });

    console.log(
      `- Usuário '${user.name}' atualizado com ${totalPoints} pontos.`,
    );
  }

  console.log('\nScript de pontuação retroativa finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('Ocorreu um erro durante a execução do script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
