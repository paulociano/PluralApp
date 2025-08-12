import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- CRIAÇÃO DO USUÁRIO ADMIN ---
  // Hasheia a senha para o admin
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Usa 'upsert' para criar o admin apenas se ele não existir
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@plural.com' },
    update: {}, // Não faz nada se o usuário já existir
    create: {
      email: 'admin@plural.com',
      password: adminPassword,
      name: 'Administrador',
      username: 'admin',
      role: 'ADMIN', // Define a função como ADMIN
    },
  });
  console.log(`Usuário Admin criado/verificado: ${adminUser.email}`);

  // --- SEED DE CONQUISTAS (BADGES) ---
  await prisma.badge.createMany({
    data: [
      { name: 'Iniciante Curioso', description: 'Criou seu primeiro argumento.', icon: 'FiFeather' },
      { name: 'Voz Ativa', description: 'Criou 10 argumentos.', icon: 'FiMessageCircle' },
      { name: 'Argumento Popular', description: 'Recebeu 10 votos positivos em um único argumento.', icon: 'FiThumbsUp' },
      { name: 'Mente Aberta', description: 'Criou argumentos Pró e Contra no mesmo debate.', icon: 'FiGitMerge' },
      { name: 'Membro Veterano', description: 'Completou um ano na plataforma.', icon: 'FiAward' },
    ],
    skipDuplicates: true,
  });
  console.log('Conquistas semeadas.');

  // --- SEED DE ARTIGOS ---
  await prisma.article.createMany({
    data: [
      { title: 'A Arte de Discordar com Respeito', content: '...', authorName: 'Julia T.', authorTitle: 'Especialista em Comunicação', published: true },
      { title: 'Por que a Evidência Supera a Opinião', content: '...', authorName: 'Carlos M.', authorTitle: 'Cientista de Dados', published: true },
      { title: 'Escuta Ativa: O Superpoder do Debate', content: '...', authorName: 'Ana B.', authorTitle: 'Psicóloga Organizacional', published: true },
      { title: 'Falácias Lógicas: Como Identificar e Evitar Armadilhas', content: '...', authorName: 'Roberto F.', authorTitle: 'Professor de Lógica', published: true },
      { title: 'O Debate como Ferramenta de Inovação', content: '...', authorName: 'Sofia L.', authorTitle: 'Consultora de Inovação', published: true },
    ],
    skipDuplicates: true,
  });
  console.log('Artigos semeados.');

   // --- CRIAÇÃO DO USUÁRIO IA MEDIADOR ---
  const aiModerator = await prisma.user.upsert({
    where: { email: 'mediador@plural.ai' },
    update: {},
    create: {
      id: 'cl9z9z9z90000z9z9z9z9z9z9', // ID fixo para fácil referência
      email: 'mediador@plural.ai',
      password: '', // Senha não é necessária, pois não fará login
      name: 'MedIAdor Plural',
      username: 'mediador-plural',
      role: 'ADMIN', // É importante que a IA tenha um role elevado
    },
  });
  console.log(`Usuário MedIAdor criado/verificado: ${aiModerator.email}`);

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