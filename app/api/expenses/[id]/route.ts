import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get("authorization"))
    if (!token) {
      return NextResponse.json({ message: "Token não fornecido" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 })
    }

    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
        validatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        signedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!expense) {
      return NextResponse.json({ message: "Relatório não encontrado" }, { status: 404 })
    }

    // Format for frontend compatibility
    const formattedExpense = {
      ...expense,
      _id: expense.id,
      status: expense.status.toLowerCase(),
    }

    return NextResponse.json(formattedExpense)
  } catch (error) {
    console.error("Get expense error:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
