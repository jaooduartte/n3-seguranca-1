import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken, getTokenFromHeader, hashPassword } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get("authorization"))
    if (!token) {
      return NextResponse.json({ message: "Token não fornecido" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 })
    }

    if (user.role !== "DIRETOR" && user.role !== "GERENTE") {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
    }

    const employees = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Convert role to lowercase for frontend compatibility
    const formattedEmployees = employees.map((emp) => ({
      ...emp,
      _id: emp.id,
      role: emp.role.toLowerCase(),
    }))

    return NextResponse.json(formattedEmployees)
  } catch (error) {
    console.error("Get employees error:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get("authorization"))
    if (!token) {
      return NextResponse.json({ message: "Token não fornecido" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 })
    }

    if (user.role !== "DIRETOR" && user.role !== "GERENTE") {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
    }

    const { name, email, role, department, password } = await request.json()

    if (!name || !email || !role || !department || !password) {
      return NextResponse.json({ message: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: "Email já cadastrado" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new employee
    const newEmployee = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role.toUpperCase(),
        department,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      message: "Funcionário cadastrado com sucesso",
      employee: {
        ...newEmployee,
        _id: newEmployee.id,
        role: newEmployee.role.toLowerCase(),
      },
    })
  } catch (error) {
    console.error("Create employee error:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
