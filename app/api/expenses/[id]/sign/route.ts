import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { signature, signedData } = await request.json()

    // Check if expense exists and is approved
    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
    })

    if (!expense) {
      return NextResponse.json({ message: "Relatório não encontrado" }, { status: 404 })
    }

    if (expense.status !== "APPROVED") {
      return NextResponse.json({ message: "Apenas relatórios aprovados podem ser assinados" }, { status: 400 })
    }

    // Update expense with digital signature
    const updatedExpense = await prisma.expense.update({
      where: { id: params.id },
      data: {
        status: "SIGNED",
        signedById: user.userId,
        signedAt: new Date(),
        digitalSignature: signature,
        signedData,
      },
      include: {
        submittedBy: {
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

    // Send email notification to directors
    try {
      const directors = await prisma.user.findMany({
        where: { role: "DIRETOR" },
        select: { email: true },
      })

      const emailTemplate = emailTemplates.expenseSigned(
        updatedExpense.title,
        updatedExpense.signedBy?.name || "Gerente",
      )

      for (const director of directors) {
        await sendEmail({
          to: director.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        })
      }
    } catch (emailError) {
      console.error("Error sending email notification:", emailError)
    }

    // In production, send email notification here
    console.log("Email notification would be sent to director about signed expense")

    return NextResponse.json({
      message: "Relatório assinado digitalmente com sucesso",
      expense: {
        ...updatedExpense,
        _id: updatedExpense.id,
        status: updatedExpense.status.toLowerCase(),
      },
    })
  } catch (error) {
    console.error("Sign expense error:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
