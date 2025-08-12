# Plural - Plataforma de Debates Estruturados

![Plural Logo](https://via.placeholder.com/300x100.png?text=Plural+Logo) **Plural** é uma aplicação web full-stack inovadora, projetada para facilitar debates saudáveis e estruturados. A plataforma se diferencia por sua visualização de argumentos em um formato de grafo interativo, e pelo uso de Inteligência Artificial para enriquecer e moderar as discussões.

---

### 📖 Sobre o Projeto

Em um mundo de discussões polarizadas e rasas, a Plural nasce com a missão de criar um ambiente para o diálogo aprofundado. A plataforma incentiva os usuários a construírem argumentos bem fundamentados, citarem fontes e interagirem de forma construtiva. Com funcionalidades de gamificação, conteúdo editorial, moderação comunitária e ferramentas de IA, a Plural busca ser o principal espaço para quem acredita no poder do debate para o crescimento intelectual e coletivo.

---

### ✨ Funcionalidades Implementadas

A plataforma conta com um ecossistema robusto de funcionalidades para usuários, administradores e criadores de conteúdo.

#### Debate e Interação
* **Tópicos Criados pela Comunidade:** Usuários podem sugerir novos tópicos, que passam por uma fila de moderação para aprovação.
* **DebateGraph:** Uma visualização interativa em D3.js que mostra a árvore de argumentos e suas conexões.
* **Argumentos Estruturados:** Usuários podem postar argumentos do tipo "Pró", "Contra" ou "Neutro", com a opção de adicionar links de referência.
* **Sistema de Votos e Favoritos:** Usuários podem dar "upvotes" e "downvotes" em argumentos, além de favoritá-los para consulta futura.

#### Gamificação e Comunidade
* **Perfis de Usuário:** Páginas de perfil públicas com URLs amigáveis (`/profile/username`), avatares, bio e estatísticas detalhadas.
* **Edição de Perfil:** Usuários podem editar suas informações, incluindo um nome de usuário único para a URL.
* **Sistema de Pontos:** Usuários ganham pontos por ações como criar argumentos e receber votos, construindo sua reputação.
* **Sistema de Conquistas (Badges):** Medalhas são concedidas automaticamente ao atingir marcos (ex: "Iniciante Curioso") e exibidas no perfil.
* **Notificações:** Um sistema de notificações no app (ícone de sino) informa os usuários sobre respostas a seus argumentos.

#### Conteúdo e Moderação
* **Artigos de Colunistas:** Uma seção editorial onde administradores podem publicar artigos através de um editor de texto rico (Lexical), com uma página de leitura dedicada.
* **CRUD de Artigos:** Painel de administração para criar, ler, atualizar e deletar artigos.
* **Sistema de Denúncias (Reports):** Usuários podem denunciar argumentos que violem as regras da comunidade.
* **Painel de Administração:** Uma área segura (`/admin`) onde administradores podem gerenciar denúncias de argumentos e aprovar/rejeitar tópicos sugeridos pela comunidade.

#### Inteligência Artificial
* **Resumo de Debates com IA:** Na página de um tópico, o usuário pode solicitar um resumo gerado pela API do Google Gemini, que analisa todos os argumentos e descreve os pontos principais.
* **Análise de Qualidade de Argumento:** No formulário de resposta, uma IA pode analisar o texto do usuário e fornecer feedback sobre clareza, viés e consistência lógica.
* **MedIAdor (IA Moderadora):** Um "usuário" IA que, periodicamente, analisa debates ativos e pode postar um argumento neutro para manter a conversa nos trilhos ou aprofundar pontos de contenção.

#### Educação e Treinamento
* **Academia de Debates:** Uma seção de treinamento onde os usuários podem praticar a identificação de falácias lógicas em textos de exemplo, recebendo feedback imediato.

---

### 🚀 Tecnologias Utilizadas

**Frontend (`plural-frontend`)**
* **Framework:** Next.js (App Router)
* **Linguagem:** TypeScript
* **Estilização:** Tailwind CSS v4 (com plugin de Tipografia)
* **Editor de Texto Rico:** Lexical (da Meta)
* **Comunicação com API:** Axios
* **Gerenciamento de Estado:** React Context API
* **Visualização de Dados:** D3.js
* **Ícones:** Heroicons

**Backend (`plural-backend-novo`)**
* **Framework:** NestJS
* **Linguagem:** TypeScript
* **Banco de Dados:** PostgreSQL
* **ORM:** Prisma
* **Autenticação:** JWT com Passport.js
* **Validação:** `class-validator`
* **Tarefas Agendadas (Cron):** `@nestjs/schedule`
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
1.  **Clone o repositório e instale as dependências:**
    ```bash
    git clone [URL_DO_REPOSITORIO_BACKEND]
    cd plural-backend-novo
    npm install
    ```
2.  **Configure o `.env`:** Renomeie `.env.example` para `.env` e preencha a `DATABASE_URL` e a `GEMINI_API_KEY`.
3.  **Execute as migrações e o seed:**
    ```bash
    npx prisma migrate reset
    # ou 'npx prisma migrate dev' e 'npx prisma db seed'
    ```
4.  **Inicie o servidor:**
    ```bash
    npm run start:dev
    ```

#### Frontend (`plural-frontend`)
1.  **Clone o repositório e instale as dependências:**
    ```bash
    git clone [URL_DO_REPOSITORIO_FRONTEND]
    cd plural-frontend
    npm install
    ```
2.  **Configure o `.env.local`:** Crie o arquivo e adicione a variável `NEXT_PUBLIC_AI_MODERATOR_ID` com o ID fixo do usuário IA definido no `seed.ts`.
3.  **Inicie o servidor:**
    ```bash
    npm run dev
    ```

---

### 🧪 Testes

Para rodar a suíte de testes automatizados do backend, execute:
```bash
# Dentro da pasta do backend
npm run test