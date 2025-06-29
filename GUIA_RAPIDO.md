# 🚀 Guia Rápido - Sistema de Gestão de Despesas

## ⚡ Setup Inicial (5 minutos)

```bash
# 1. Clone e entre no projeto
git clone <url-do-repositorio>
cd n3-claudinei

# 2. Execute o setup automático
node scripts/setup.js

# 3. Inicie o servidor
pnpm dev
```

Acesse: http://localhost:3000

## 👤 Login Rápido

| Usuário         | Email                   | Senha  | Função                |
| --------------- | ----------------------- | ------ | --------------------- |
| **Diretor**     | admin@empresa.com       | 123456 | Verificar assinaturas |
| **Gerente**     | gerente@empresa.com     | 123456 | Validar e assinar     |
| **Funcionário** | funcionario@empresa.com | 123456 | Submeter relatórios   |

## 🔄 Fluxo Completo (Demo)

### 1. Funcionário Submete Relatório

```
Login: funcionario@empresa.com
→ Dashboard → "Submeter Relatório"
→ Preencha o formulário
→ Envie o relatório
```

### 2. Gerente Valida

```
Login: gerente@empresa.com
→ Dashboard → "Relatórios Pendentes"
→ Clique em "Validar"
→ Aprove ou rejeite
```

### 3. Gerente Assina Digitalmente

```
→ Dashboard → "Assinar Relatórios"
→ Selecione relatório aprovado
→ Clique em "Assinar"
→ Confirme a assinatura
```

### 4. Diretor Verifica

```
Login: admin@empresa.com
→ Dashboard → "Relatórios Assinados"
→ Clique em "Verificar"
→ Analise os resultados
```

## 🔐 Assinatura Digital

### Modo Real (Produção)

- ✅ Criptografia RSA-PSS 2048 bits
- ✅ Hash SHA-256
- ✅ Verificação de integridade
- ✅ Não repúdio garantido

### Modo Simulação (Desenvolvimento)

- 🧪 Para testes rápidos
- 🧪 Sem criptografia real
- 🧪 Ative a checkbox "Usar simulação"

## 📧 Configuração de Email

Edite `.env.local`:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
```

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
pnpm dev

# Banco de dados
pnpm db:studio    # Visualizar banco
pnpm db:reset     # Reset completo
pnpm db:seed      # Dados de teste

# Produção
pnpm build
pnpm start
```

## 📱 Funcionalidades por Role

### 👷 Funcionário

- ✅ Submeter relatórios
- ✅ Visualizar histórico
- ✅ Receber notificações

### 👨‍💼 Gerente

- ✅ Validar relatórios
- ✅ Assinar digitalmente
- ✅ Gerenciar funcionários
- ✅ Receber notificações

### 👨‍💻 Diretor

- ✅ Verificar assinaturas
- ✅ Visualizar estatísticas
- ✅ Gerenciar funcionários
- ✅ Auditoria completa

## 🔍 Troubleshooting

### Problema: Erro de login

**Solução**: Execute `pnpm db:seed` para recriar usuários

### Problema: Assinatura não funciona

**Solução**: Ative "Modo de simulação" para testes

### Problema: Email não envia

**Solução**: Configure SMTP no `.env.local` ou deixe vazio para desenvolvimento

### Problema: Banco não conecta

**Solução**: Execute `pnpm db:generate && pnpm db:migrate`

## 📊 Estrutura do Projeto

```
app/
├── api/                    # APIs REST
├── dashboard/             # Dashboard principal
├── employees/             # Gestão de funcionários
├── submit-expense/        # Submissão de relatórios
├── pending-expenses/      # Relatórios pendentes
├── sign-expense/          # Assinatura digital
├── signed-expenses/       # Relatórios assinados
└── verify-signature/      # Verificação de assinatura

lib/
├── auth.ts               # Autenticação JWT
├── crypto.ts             # Criptografia
├── email.ts              # Notificações
└── prisma.ts             # Banco de dados
```

## 🎯 Próximos Passos

1. **Teste o fluxo completo** com os usuários de exemplo
2. **Configure email** para notificações reais
3. **Personalize** cores e logo da empresa
4. **Deploy** em produção com HTTPS
5. **Configure backup** do banco de dados

## 📞 Suporte

- 📖 **Documentação completa**: README.md
- 🔐 **Assinatura digital**: docs/ASSINATURA_DIGITAL.md
- 🐛 **Issues**: GitHub Issues
- 💬 **Dúvidas**: Consulte os logs do console

---

**🎉 Sistema pronto para uso! Teste todas as funcionalidades e aproveite!**
