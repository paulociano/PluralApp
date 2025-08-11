# Plural - Plataforma de Debates Estruturados

**Plural** é uma aplicação web full-stack inovadora, projetada para facilitar debates saudáveis e estruturados. A plataforma se diferencia por sua visualização de argumentos em um formato de grafo interativo, permitindo que os usuários explorem o fluxo da conversa de forma lógica e intuitiva.

---

### 📖 Sobre o Projeto

Em um mundo de discussões polarizadas e rasas, a Plural nasce com a missão de criar um ambiente para o diálogo aprofundado. A plataforma incentiva os usuários a construírem argumentos bem fundamentados, citarem fontes e interagirem de forma construtiva através de um sistema de votos e respostas. Com funcionalidades de gamificação, como pontos e conquistas, e conteúdo editorial de colunistas, a Plural busca ser o principal espaço para quem acredita no poder do debate para o crescimento intelectual e coletivo.

---

### ✨ Funcionalidades Implementadas

A plataforma conta com um ecossistema robusto de funcionalidades para usuários, administradores e criadores de conteúdo.

#### Debate e Interação
* **Tópicos de Debate:** Navegação por tópicos organizados em categorias.
* **DebateGraph:** Uma visualização interativa em D3.js que mostra a árvore de argumentos e suas conexões.
* **Argumentos Estruturados:** Usuários podem postar argumentos do tipo "Pró", "Contra" ou "Neutro".
* **Sistema de Votos:** Usuários podem dar "upvotes" e "downvotes" em argumentos para sinalizar sua relevância.
* **Referências:** Possibilidade de adicionar um link de fonte/referência a cada argumento para embasar a discussão.
* **Favoritos:** Usuários podem favoritar argumentos para ler mais tarde.

#### Gamificação e Comunidade
* **Perfis de Usuário:** Páginas de perfil públicas com URLs amigáveis (`/profile/username`).
* **Avatares:** Avatares gerados dinamicamente com base nas iniciais do nome.
* **Edição de Perfil:** Usuários podem editar seu nome de exibição, nome de usuário (para a URL) e uma pequena biografia.
* **Sistema de Pontos:** Usuários ganham pontos por ações como criar argumentos e receber votos positivos, construindo sua reputação na plataforma.
* **Sistema de Conquistas (Badges):** Medalhas são concedidas automaticamente ao atingir marcos (ex: "Iniciante Curioso", "Argumento Popular").
* **Notificações:** Um sistema de notificações no app (ícone de sino) informa os usuários sobre novas respostas em seus argumentos.

#### Conteúdo e Moderação
* **Artigos de Colunistas:** Uma seção editorial onde administradores podem publicar artigos sobre temas relacionados a debate e pensamento crítico.
* **Página de Leitura de Artigos:** Uma interface limpa e focada para a leitura dos artigos.
* **CRUD de Artigos:** Painel de administração para criar, ler, atualizar e deletar artigos.
* **Sistema de Denúncias (Reports):** Usuários podem denunciar argumentos que violem as regras da comunidade.
* **Painel de Administração:** Uma área segura para administradores revisarem e gerenciarem denúncias pendentes.

#### Inteligência Artificial
* **Resumo de Debates com IA:** Na página de um tópico, o usuário pode solicitar um resumo gerado pela API do Google Gemini, que analisa todos os argumentos e descreve os pontos principais e o foco atual da discussão.

---

### 🚀 Tecnologias Utilizadas

**Frontend (`plural-frontend`)**
* **Framework:** Next.js 14+ (App Router)
* **Linguagem:** TypeScript
* **Estilização:** Tailwind CSS v4 (com plugin de Tipografia)
* **Comunicação com API:** Axios (instância centralizada)
* **Gerenciamento de Estado:** React Context API
* **Animações:** Framer Motion
* **Visualização de Dados:** D3.js
* **Ícones:** Heroicons

**Backend (`plural-backend-novo`)**
* **Framework:** NestJS
* **Linguagem:** TypeScript
* **Banco de Dados:** PostgreSQL
* **ORM:** Prisma
* **Autenticação:** JWT com Passport.js
* **Validação:** `class-validator`
* **Testes:** Jest
* **IA Generativa:** Google Gemini API

---

### ▶️ Como Executar o Projeto

#### Pré-requisitos
* Node.js (v18+)
* npm
* PostgreSQL
* Git

#### Backend (`plural-backend-novo`)
1.  **Clone o repositório:**
    ```bash
    git clone [URL_DO_REPOSITORIO_BACKEND]
    cd plural-backend-novo
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configure as variáveis de ambiente:**
    * Renomeie o arquivo `.env.example` para `.env`.
    * Preencha as variáveis, incluindo a `DATABASE_URL` para seu banco PostgreSQL e a `GEMINI_API_KEY`.
4.  **Execute as migrações e o seed do banco de dados:**
    ```bash
    npx prisma migrate dev
    npx prisma db seed
    ```
5.  **Inicie o servidor:**
    ```bash
    npm run start:dev
    ```
    O servidor estará rodando em `http://localhost:3000`.

#### Frontend (`plural-frontend`)
1.  **Clone o repositório:**
    ```bash
    git clone [URL_DO_REPOSITORIO_FRONTEND]
    cd plural-frontend
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    A aplicação estará acessível em `http://localhost:3001` (ou outra porta, se configurado).

---

### 🧪 Testes

Para rodar a suíte de testes automatizados do backend, execute:
```bash
# Dentro da pasta do backend
npm run test
```

---

### 🔮 Próximos Passos Potenciais

* **Ranking de Usuários (Leaderboard):** Criar uma página para ranquear os usuários com base em seus pontos de reputação.
* **Busca Universal:** Implementar uma busca que pesquise não apenas em tópicos, mas também em argumentos e usuários.
* **Notificações por E-mail:** Enviar e-mails para notificar usuários de novas respostas.
* **Upload de Avatar:** Permitir que os usuários façam o upload de suas próprias imagens de perfil.