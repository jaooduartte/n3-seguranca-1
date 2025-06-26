export const runtime = "nodejs"
import nodemailer from "nodemailer"

// Configure your email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Sistema de Gestão" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    })

    console.log("Email sent: %s", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error: error.message }
  }
}

// Email templates
export const emailTemplates = {
  expenseSubmitted: (expenseName: string, employeeName: string, amount: number) => ({
    subject: "Novo Relatório de Despesa Submetido",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Novo Relatório de Despesa</h2>
        <p>Um novo relatório de despesa foi submetido e aguarda sua validação:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Funcionário:</strong> ${employeeName}</p>
          <p><strong>Relatório:</strong> ${expenseName}</p>
          <p><strong>Valor:</strong> R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        <p>Acesse o sistema para validar este relatório.</p>
        <a href="${process.env.NEXTAUTH_URL}/pending-expenses" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Validar Relatório
        </a>
      </div>
    `,
    text: `Novo relatório de despesa submetido por ${employeeName}: ${expenseName} - R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
  }),

  expenseValidated: (expenseName: string, status: string, managerName: string, comments?: string) => ({
    subject: `Relatório de Despesa ${status === "approved" ? "Aprovado" : "Rejeitado"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${status === "approved" ? "#16a34a" : "#dc2626"};">
          Relatório ${status === "approved" ? "Aprovado" : "Rejeitado"}
        </h2>
        <p>Seu relatório de despesa foi ${status === "approved" ? "aprovado" : "rejeitado"}:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Relatório:</strong> ${expenseName}</p>
          <p><strong>Validado por:</strong> ${managerName}</p>
          ${comments ? `<p><strong>Comentários:</strong> ${comments}</p>` : ""}
        </div>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Ver Dashboard
        </a>
      </div>
    `,
    text: `Seu relatório "${expenseName}" foi ${status === "approved" ? "aprovado" : "rejeitado"} por ${managerName}${comments ? `. Comentários: ${comments}` : ""}`,
  }),

  expenseSigned: (expenseName: string, managerName: string) => ({
    subject: "Relatório de Despesa Assinado Digitalmente",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Relatório Assinado Digitalmente</h2>
        <p>Um relatório foi assinado digitalmente e está disponível para verificação:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Relatório:</strong> ${expenseName}</p>
          <p><strong>Assinado por:</strong> ${managerName}</p>
          <p><strong>Status:</strong> Assinado Digitalmente</p>
        </div>
        <a href="${process.env.NEXTAUTH_URL}/signed-expenses" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Verificar Assinatura
        </a>
      </div>
    `,
    text: `O relatório "${expenseName}" foi assinado digitalmente por ${managerName}`,
  }),
}
