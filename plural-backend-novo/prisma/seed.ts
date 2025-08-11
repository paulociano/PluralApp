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

   await prisma.article.createMany({
    data: [
      {
        title: 'A Arte de Discordar com Respeito',
        content: 'Em um mundo polarizado, a habilidade de debater ideias sem atacar indivíduos é mais crucial do que nunca. O verdadeiro debate enriquece, não divide. O objetivo não é vencer, mas crescer coletivamente através da troca de perspectivas bem fundamentadas...',
        authorName: 'Julia T.',
        authorTitle: 'Especialista em Comunicação',
        published: true,
      },
      {
        title: 'Por que a Evidência Supera a Opinião',
        content: 'Argumentos baseados em "eu acho" são frágeis. A força de um debate estruturado reside na sua capacidade de analisar fatos e evidências. Aprender a referenciar fontes e a construir uma linha de raciocínio lógica é o primeiro passo para uma discussão produtiva...',
        authorName: 'Carlos M.',
        authorTitle: 'Cientista de Dados',
        published: true,
      },
       {
        title: 'Escuta Ativa: O Superpoder do Debate',
        content: 'Muitos entram em um debate focados apenas em falar. No entanto, a ferramenta mais poderosa é a escuta. Entender verdadeiramente o ponto de vista do outro, mesmo que você discorde, é o que permite construir contra-argumentos sólidos e encontrar pontos em comum.',
        authorName: 'Ana B.',
        authorTitle: 'Psicóloga Organizacional',
        published: true,
      },
      {
        title: 'Falácias Lógicas: Como Identificar e Evitar Armadilhas',
        content: 'Do "espantalho" ao "apelo à autoridade", as falácias lógicas são atalhos que enfraquecem o debate. Conhecer as mais comuns não só fortalece seus próprios argumentos, mas também te ajuda a identificar quando uma discussão está saindo dos trilhos.',
        authorName: 'Roberto F.',
        authorTitle: 'Professor de Lógica',
        published: true,
      },
      {
        title: 'O Debate como Ferramenta de Inovação',
        content: 'As maiores inovações raramente nascem do consenso. Elas surgem do choque de ideias, do questionamento do status quo. Um ambiente de debate saudável é um catalisador para a criatividade, forçando-nos a olhar para os problemas sob novas perspectivas.',
        authorName: 'Sofia L.',
        authorTitle: 'Consultora de Inovação',
        published: true,
      },
    ],
    skipDuplicates: true,
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
