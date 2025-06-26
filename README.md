# 📋 Sistema de Gestão de Relatórios com Assinaturas Digitais

Um sistema completo e seguro para gestão de relatórios de despesas com assinaturas digitais, autenticação JWT e fluxo de aprovação hierárquico.

## 🎯 Visão Geral

Este sistema implementa um fluxo completo de gestão de despesas corporativas:
- **Funcionários** submetem relatórios de despesas
- **Gerentes** validam e assinam digitalmente os relatórios
- **Diretores** verificam a autenticidade das assinaturas digitais

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: SQLite (desenvolvimento) / MongoDB (produção)
- **Autenticação**: JWT (JSON Web Tokens)
- **Criptografia**: Web Crypto API (RSA-PSS + SHA-256)
- **Email**: Nodemailer
- **Containerização**: Docker + Docker Compose
- **Segurança**: Nginx, SSL/TLS, Rate Limiting

---

## 🚀 Guia de Instalação e Execução

### Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
- **npm** ou **yarn** (gerenciador de pacotes)
- **Git** - [Download](https://git-scm.com/)
- **Docker** e **Docker Compose** (opcional, para execução com containers) - [Download](https://www.docker.com/)

---

## 📦 Opção 1: Execução Local (Desenvolvimento)

### Passo 1: Clone o Repositório
\`\`\`bash
# Clone o projeto
git clone <URL_DO_REPOSITORIO>
cd expense-management-system
\`\`\`

### Passo 2: Instale as Dependências
\`\`\`bash
# Instalar dependências do projeto
npm install
\`\`\`

### Passo 3: Configure as Variáveis de Ambiente
\`\`\`bash
# Copie o arquivo de exemplo
cp .env.example .env
\`\`\`

**Edite o arquivo `.env` com suas configurações:**
\`\`\`env
# Banco de Dados (SQLite para desenvolvimento)
DATABASE_URL="file:./dev.db"

# JWT Secret (IMPORTANTE: Mude em produção!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Email (Configure com suas credenciais)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
SMTP_FROM="seu-email@gmail.com"
\`\`\`

### Passo 4: Configure o Banco de Dados
\`\`\`bash
# Gerar o cliente Prisma
npm run db:generate

# Criar o banco de dados e tabelas
npm run db:push

# Popular o banco com dados iniciais (usuários de teste)
npm run db:seed
\`\`\`

### Passo 5: Execute o Projeto
\`\`\`bash
# Iniciar o servidor de desenvolvimento
npm run dev
\`\`\`

### Passo 6: Acesse o Sistema
Abra seu navegador e acesse: **http://localhost:3000**

---

## 🐳 Opção 2: Execução com Docker (Recomendado para Produção)

### Passo 1: Clone o Repositório
\`\`\`bash
git clone <URL_DO_REPOSITORIO>
cd expense-management-system
\`\`\`

### Passo 2: Gere os Certificados SSL
\`\`\`bash
# Torne o script executável
chmod +x scripts/generate-ssl.sh

# Execute o script para gerar certificados SSL
./scripts/generate-ssl.sh
\`\`\`

### Passo 3: Configure as Variáveis de Ambiente
\`\`\`bash
# Copie o arquivo de exemplo
cp .env.example .env
\`\`\`

**Configure o arquivo `.env` para Docker:**
\`\`\`env
# MongoDB (para produção)
MONGO_ROOT_USER="admin"
MONGO_ROOT_PASS="password123"
DATABASE_URL="mongodb://admin:password123@mongodb:27017/expense_management?authSource=admin"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Next.js
NEXTAUTH_URL="https://localhost"
NEXTAUTH_SECRET="your-nextauth-secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
SMTP_FROM="seu-email@gmail.com"

# Redis
REDIS_PASSWORD="redis123"
\`\`\`

### Passo 4: Execute com Docker Compose
\`\`\`bash
# Para desenvolvimento
docker-compose up -d

# Para produção
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

### Passo 5: Acesse o Sistema
- **HTTP**: http://localhost (redireciona automaticamente para HTTPS)
- **HTTPS**: https://localhost (aceite o certificado self-signed no navegador)

---

## 👥 Usuários de Teste

Após executar o seed do banco de dados, você pode fazer login com:

| Perfil | Email | Senha | Permissões |
|--------|-------|-------|------------|
| **Diretor** | admin@empresa.com | 123456 | Todas as funcionalidades + Verificação de assinaturas |
| **Gerente** | gerente@empresa.com | 123456 | CRUD funcionários + Validação + Assinatura digital |
| **Funcionário** | funcionario@empresa.com | 123456 | Submissão de relatórios |

---

## 📧 Configuração de Email (Opcional)

Para ativar as notificações por email, configure um provedor SMTP:

### Gmail (Recomendado)
1. Ative a verificação em 2 etapas na sua conta Google
2. Gere uma "Senha de App" específica
3. Use essa senha no campo `SMTP_PASS`

### Outros Provedores
- **Outlook**: smtp-mail.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **SendGrid**: smtp.sendgrid.net:587

---

## 🔧 Scripts Disponíveis

\`\`\`bash
# Desenvolvimento
npm run dev              # Executar em modo desenvolvimento
npm run build            # Build para produção
npm run start            # Executar build de produção
npm run lint             # Verificar código com ESLint

# Banco de Dados
npm run db:generate      # Gerar cliente Prisma
npm run db:push          # Aplicar schema ao banco
npm run db:seed          # Popular banco com dados iniciais
npm run db:studio        # Abrir Prisma Studio (interface visual)
npm run db:reset         # Resetar banco e popular novamente

# Docker
docker-compose up -d     # Executar com Docker
docker-compose down      # Parar containers
docker-compose logs      # Ver logs dos containers
\`\`\`

---

## 🎮 Como Usar o Sistema

### 1. **Login**
- Acesse a página inicial
- Use um dos usuários de teste listados acima
- Será redirecionado para o dashboard

### 2. **Funcionário - Submeter Relatório**
- No dashboard, clique em "Submeter Relatório"
- Preencha todos os campos obrigatórios
- Anexe um comprovante (opcional)
- Clique em "Enviar Relatório"

### 3. **Gerente - Validar Relatórios**
- Acesse "Relatórios Pendentes"
- Clique em "Validar" no relatório desejado
- Analise os detalhes e comprovantes
- Aprove ou rejeite com comentários

### 4. **Gerente - Assinar Digitalmente**
- Acesse "Assinar Relatórios"
- Clique em "Assinar" no relatório aprovado
- Confirme a assinatura digital
- O sistema gerará automaticamente a assinatura criptográfica

### 5. **Diretor - Verificar Assinaturas**
- Acesse "Relatórios Assinados"
- Clique em "Verificar" no relatório assinado
- O sistema validará automaticamente a autenticidade da assinatura

---

## 🔐 Recursos de Segurança Implementados

### ✅ Autenticação e Autorização
- JWT tokens com expiração de 24 horas
- Senhas criptografadas com bcrypt (10 rounds)
- Controle de acesso baseado em roles
- Middleware de autenticação em todas as rotas protegidas

### ✅ Assinaturas Digitais
- Algoritmo RSA-PSS com chaves de 2048 bits
- Hash SHA-256 para integridade dos dados
- Chaves públicas/privadas geradas dinamicamente
- Verificação automática de autenticidade

### ✅ Proteções Web
- Headers de segurança (CSP, HSTS, X-Frame-Options)
- Proteção contra CSRF, XSS e injeção de código
- Rate limiting nas APIs (10 req/s geral, 5 req/min login)
- Validação e sanitização de todas as entradas

### ✅ Infraestrutura
- HTTPS obrigatório com certificados TLS
- Containers Docker com políticas de segurança
- Nginx reverse proxy com configurações otimizadas
- Isolamento de rede entre serviços

---

## 🚨 Solução de Problemas

### Problema: "Cannot connect to database"
**Solução:**
\`\`\`bash
# Verifique se o banco foi criado
npm run db:push

# Se usar Docker, verifique se o MongoDB está rodando
docker-compose ps
\`\`\`

### Problema: "JWT token invalid"
**Solução:**
- Verifique se a variável `JWT_SECRET` está configurada
- Limpe o localStorage do navegador
- Faça login novamente

### Problema: "Email not sending"
**Solução:**
- Verifique as credenciais SMTP no arquivo `.env`
- Para Gmail, use uma "Senha de App" específica
- Verifique se a porta SMTP está correta (587 ou 465)

### Problema: "SSL certificate error" (Docker)
**Solução:**
\`\`\`bash
# Regenere os certificados SSL
./scripts/generate-ssl.sh

# Reinicie os containers
docker-compose down && docker-compose up -d
\`\`\`

### Problema: "Port already in use"
**Solução:**
\`\`\`bash
# Encontre o processo usando a porta
lsof -i :3000

# Mate o processo
kill -9 <PID>

# Ou use uma porta diferente
PORT=3001 npm run dev
\`\`\`

---

## 📊 Estrutura do Projeto

\`\`\`
expense-management-system/
├── app/                          # Páginas Next.js (App Router)
│   ├── api/                      # API Routes
│   ├── dashboard/                # Dashboard principal
│   ├── employees/                # CRUD de funcionários
│   ├── login/                    # Página de login
│   └── ...                       # Outras páginas
├── components/                   # Componentes React reutilizáveis
├── lib/                          # Utilitários e configurações
│   ├── auth.ts                   # Funções de autenticação
│   ├── email.ts                  # Configuração de email
│   └── prisma.ts                 # Cliente Prisma
├── prisma/                       # Schema e migrações do banco
├── scripts/                      # Scripts utilitários
├── docker-compose.yml            # Configuração Docker
├── Dockerfile                    # Imagem Docker da aplicação
├── nginx.conf                    # Configuração Nginx
└── README.md                     # Este arquivo
\`\`\`

---

## 🤝 Contribuição

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. Abra um **Pull Request**

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 📞 Suporte

Se encontrar algum problema ou tiver dúvidas:

1. Verifique a seção "Solução de Problemas" acima
2. Consulte os logs do sistema:
   \`\`\`bash
   # Para execução local
   npm run dev
   
   # Para Docker
   docker-compose logs app
   \`\`\`
3. Abra uma issue no repositório do projeto

---

## 🎉 Pronto!

Seu sistema de gestão de relatórios com assinaturas digitais está funcionando! 

Acesse **http://localhost:3000** (local) ou **https://localhost** (Docker) e comece a usar o sistema.

**Lembre-se**: Em produção, sempre altere as senhas padrão e configure adequadamente as variáveis de ambiente de segurança.
