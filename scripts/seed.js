const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Hash password for all users
  const hashedPassword = await bcrypt.hash("123456", 10)

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: "admin@empresa.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@empresa.com",
      password: hashedPassword,
      role: "DIRETOR",
      department: "Administração",
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: "gerente@empresa.com" },
    update: {},
    create: {
      name: "Gerente Silva",
      email: "gerente@empresa.com",
      password: hashedPassword,
      role: "GERENTE",
      department: "Operações",
    },
  })

  const employee = await prisma.user.upsert({
    where: { email: "funcionario@empresa.com" },
    update: {},
    create: {
      name: "João Funcionário",
      email: "funcionario@empresa.com",
      password: hashedPassword,
      role: "FUNCIONARIO",
      department: "Vendas",
    },
  })

  // Create sample expenses
  const expense1 = await prisma.expense.create({
    data: {
      title: "Viagem de Negócios - São Paulo",
      description: "Viagem para reunião com cliente importante. Incluindo passagem aérea, hospedagem e alimentação.",
      amount: 1250.5,
      category: "Viagem",
      date: new Date("2024-01-15"),
      status: "PENDING",
      submittedById: employee.id,
    },
  })

  const expense2 = await prisma.expense.create({
    data: {
      title: "Material de Escritório",
      description: "Compra de material de escritório para o departamento de vendas.",
      amount: 350.75,
      category: "Material",
      date: new Date("2024-01-10"),
      status: "APPROVED",
      submittedById: employee.id,
      validatedById: manager.id,
      validatedAt: new Date(),
    },
  })

  const expense3 = await prisma.expense.create({
    data: {
      title: "Almoço com Cliente",
      description: "Almoço de negócios com cliente potencial.",
      amount: 180.0,
      category: "Alimentação",
      date: new Date("2024-01-08"),
      status: "SIGNED",
      submittedById: employee.id,
      validatedById: manager.id,
      signedById: manager.id,
      validatedAt: new Date("2024-01-09"),
      signedAt: new Date("2024-01-10"),
      digitalSignature: JSON.stringify({
        signature: "sample_signature_hash",
        publicKey: "sample_public_key",
        algorithm: "RSA-PSS",
        hash: "SHA-256",
      }),
      signedData: JSON.stringify({
        expenseId: "sample_id",
        title: "Almoço com Cliente",
        amount: 180.0,
        submittedBy: "funcionario@empresa.com",
        signedBy: "gerente@empresa.com",
        timestamp: new Date().toISOString(),
      }),
    },
  })

  console.log("✅ Database seeded successfully!")
  console.log("👤 Users created:")
  console.log("  - Admin: admin@empresa.com (password: 123456)")
  console.log("  - Manager: gerente@empresa.com (password: 123456)")
  console.log("  - Employee: funcionario@empresa.com (password: 123456)")
  console.log("📊 Sample expenses created")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
