import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"
import { sendEmail, emailTemplates } from "@/lib/email"

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

    const formData = await request.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const category = formData.get("category") as string
    const date = formData.get("date") as string
    const receipt = formData.get("receipt") as File | null

    if (!title || !description || !amount || !category || !date) {
      return NextResponse.json({ message: "Todos os campos obrigatórios devem ser preenchidos" }, { status: 400 })
    }

    // Find user in database
    const submittedBy = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!submittedBy) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }

    // Create new expense
    const newExpense = await prisma.expense.create({
      data: {
        title,
        description,
        amount,
        category,
        date: new Date(date),
        receiptUrl: receipt ? `/uploads/${receipt.name}` : null,
        submittedById: submittedBy.id,
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
    })

    // Send email notification to managers
    try {
      const managers = await prisma.user.findMany({
        where: { role: "GERENTE" },
        select: { email: true },
      })

      const emailTemplate = emailTemplates.expenseSubmitted(newExpense.title, submittedBy.name, newExpense.amount)

      for (const manager of managers) {
        await sendEmail({
          to: manager.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        })
      }
    } catch (emailError) {
      console.error("Error sending email notification:", emailError)
      // Don't fail the request if email fails
    }

    // In production, send email notification here
    console.log("Email notification would be sent to manager")

    return NextResponse.json({
      message: "Relatório de despesa enviado com sucesso",
      expense: {
        ...newExpense,
        _id: newExpense.id,
        status: newExpense.status.toLowerCase(),
      },
    })
  } catch (error) {
    console.error("Create expense error:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
