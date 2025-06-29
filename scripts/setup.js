#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Configurando Sistema de Gestão de Despesas...\n')

// Verificar se Node.js está instalado
try {
  const nodeVersion = process.version
  console.log(`✅ Node.js ${nodeVersion} detectado`)
} catch (error) {
  console.error('❌ Node.js não encontrado. Instale Node.js 18+ primeiro.')
  process.exit(1)
}

// Verificar se pnpm está instalado
try {
  execSync('pnpm --version', { stdio: 'ignore' })
  console.log('✅ pnpm detectado')
} catch (error) {
  console.log('⚠️  pnpm não encontrado. Instalando...')
  try {
    execSync('npm install -g pnpm', { stdio: 'inherit' })
    console.log('✅ pnpm instalado com sucesso')
  } catch (installError) {
    console.error('❌ Erro ao instalar pnpm. Use npm como alternativa.')
  }
}

// Instalar dependências
console.log('\n📦 Instalando dependências...')
try {
  execSync('pnpm install', { stdio: 'inherit' })
  console.log('✅ Dependências instaladas')
} catch (error) {
  console.error('❌ Erro ao instalar dependências')
  process.exit(1)
}

// Configurar banco de dados
console.log('\n🗄️  Configurando banco de dados...')
try {
  execSync('npx prisma generate', { stdio: 'inherit' })
  console.log('✅ Cliente Prisma gerado')
  
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' })
  console.log('✅ Migrações executadas')
  
  execSync('node scripts/seed.js', { stdio: 'inherit' })
  console.log('✅ Dados de teste inseridos')
} catch (error) {
  console.error('❌ Erro ao configurar banco de dados:', error.message)
  process.exit(1)
}

// Criar arquivo .env se não existir
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('\n🔧 Criando arquivo .env.local...')
  const envContent = `# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (Altere para produção)
JWT_SECRET="sua-chave-secreta-super-segura-aqui-${Date.now()}"

# Email Configuration (opcional)
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="seu-email@gmail.com"
# SMTP_PASS="sua-senha-de-app"
# SMTP_FROM="sistema@empresa.com"

# App Configuration
NEXTAUTH_URL="http://localhost:3000"
`
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Arquivo .env.local criado')
}

console.log('\n🎉 Setup concluído com sucesso!')
console.log('\n📋 Próximos passos:')
console.log('1. Configure as variáveis de email no arquivo .env.local (opcional)')
console.log('2. Execute: pnpm dev')
console.log('3. Acesse: http://localhost:3000')
console.log('\n👤 Usuários de teste:')
console.log('- admin@empresa.com (Diretor) - Senha: 123456')
console.log('- gerente@empresa.com (Gerente) - Senha: 123456')
console.log('- funcionario@empresa.com (Funcionário) - Senha: 123456')
console.log('\n🔐 Para testar a assinatura digital:')
console.log('1. Faça login como gerente')
console.log('2. Aprove um relatório')
console.log('3. Use a opção "Assinar Relatórios"')
console.log('4. Ative o modo de simulação para testes')
console.log('\n📚 Consulte o README.md para mais informações') 