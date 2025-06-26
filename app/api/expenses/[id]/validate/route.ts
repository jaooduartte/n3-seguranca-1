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

    const { action, comments } = await request.json()

    // Check if expense exists and is pending
    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: {
        submittedBy: {
          select: {
            email: true,
          },
        },
      },
    })

    if (!expense) {
      return NextResponse.json({ message: "Relatório não encontrado" }, { status: 404 })
    }

    if (expense.status !== "PENDING") {
      return NextResponse.json({ message: "Relatório já foi validado" }, { status: 400 })
    }

    // Update expense status
    const updatedExpense = await prisma.expense.update({
      where: { id: params.id },
      data: {
        status: action === "approve" ? "APPROVED" : "REJECTED",
        validatedById: user.userId,
        validatedAt: new Date(),
        comments,
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        validatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Send email notification to employee
    try {
      const emailTemplate = emailTemplates.expenseValidated(
        updatedExpense.title,
        action,
        updatedExpense.validatedBy?.name || "Gerente",
        comments,
      )

      await sendEmail({
        to: expense.submittedBy.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      })
    } catch (emailError) {
      console.error("Error sending email notification:", emailError)
    }

    // In production, send email notification here
    console.log(`Email notification would be sent to ${expense.submittedBy.email}`)

    return NextResponse.json({
      message: `Relatório ${action === "approve" ? "aprovado" : "rejeitado"} com sucesso`,
      expense: {
        ...updatedExpense,
        _id: updatedExpense.id,
        status: updatedExpense.status.toLowerCase(),
      },
    })
  } catch (error) {
    console.error("Validate expense error:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
