import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { name, email, role, department } = await request.json()

    // Check if employee exists
    const existingEmployee = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingEmployee) {
      return NextResponse.json({ message: "Funcionário não encontrado" }, { status: 404 })
    }

    // Check if email already exists (excluding current employee)
    const emailExists = await prisma.user.findFirst({
      where: {
        email,
        id: { not: params.id },
      },
    })

    if (emailExists) {
      return NextResponse.json({ message: "Email já cadastrado" }, { status: 400 })
    }

    // Update employee
    const updatedEmployee = await prisma.user.update({
      where: { id: params.id },
      data: {
        name,
        email,
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
      message: "Funcionário atualizado com sucesso",
      employee: {
        ...updatedEmployee,
        _id: updatedEmployee.id,
        role: updatedEmployee.role.toLowerCase(),
      },
    })
  } catch (error) {
    console.error("Update employee error:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if employee exists
    const existingEmployee = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingEmployee) {
      return NextResponse.json({ message: "Funcionário não encontrado" }, { status: 404 })
    }

    // Delete employee
    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Funcionário excluído com sucesso",
    })
  } catch (error) {
    console.error("Delete employee error:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
