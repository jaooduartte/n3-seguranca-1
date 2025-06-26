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

    // Get statistics from database
    const [totalEmployees, pendingExpenses, signedExpenses, totalExpenses] = await Promise.all([
      prisma.user.count(),
      prisma.expense.count({ where: { status: "PENDING" } }),
      prisma.expense.count({ where: { status: "SIGNED" } }),
      prisma.expense.count(),
    ])

    const stats = {
      totalEmployees,
      pendingExpenses,
      signedExpenses,
      totalExpenses,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
