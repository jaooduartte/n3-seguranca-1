import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"

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

    if (user.role !== "GERENTE") {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
    }

    const approvedExpenses = await prisma.expense.findMany({
      where: {
        status: "APPROVED",
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        validatedAt: "desc",
      },
    })

    // Format for frontend compatibility
    const formattedExpenses = approvedExpenses.map((expense) => ({
      ...expense,
      _id: expense.id,
      status: expense.status.toLowerCase(),
    }))

    return NextResponse.json(formattedExpenses)
  } catch (error) {
    console.error("Get approved expenses error:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
