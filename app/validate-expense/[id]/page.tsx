"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle, XCircle, FileText, Download } from "lucide-react"

interface Expense {
  _id: string
  title: string
  description: string
  amount: number
  category: string
  date: string
  status: "pending" | "approved" | "rejected" | "signed"
  submittedBy: {
    name: string
    email: string
    department: string
  }
  receiptUrl?: string
  createdAt: string
}

export default function ValidateExpense() {
  const [expense, setExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [comments, setComments] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    const user = JSON.parse(userData)
    if (user.role !== "gerente") {
      router.push("/dashboard")
      return
    }

    loadExpense()
  }, [router, params.id])

  const loadExpense = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/expenses/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setExpense(data)
      } else {
        setError("Relatório não encontrado")
      }
    } catch (error) {
      setError("Erro ao carregar relatório")
    } finally {
      setLoading(false)
    }
  }

  const handleValidation = async (action: "approve" | "reject") => {
    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/expenses/${params.id}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          comments,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Relatório ${action === "approve" ? "aprovado" : "rejeitado"} com sucesso!`)
        setTimeout(() => {
          router.push("/pending-expenses")
        }, 2000)
      } else {
        setError(data.message || "Erro ao validar relatório")
      }
    } catch (error) {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "signed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente"
      case "approved":
        return "Aprovado"
      case "rejected":
        return "Rejeitado"
      case "signed":
        return "Assinado"
      default:
        return status
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  if (!expense) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Relatório não encontrado</h2>
          <Button onClick={() => router.push("/pending-expenses")}>Voltar para relatórios pendentes</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" onClick={() => router.push("/pending-expenses")} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="w-6 h-6 mr-2" />
                Validar Relatório de Despesa
              </h1>
              <p className="text-sm text-gray-600">Analise e aprove ou rejeite o relatório</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Detalhes do Relatório */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{expense.title}</CardTitle>
                    <CardDescription>
                      Submetido em {new Date(expense.createdAt).toLocaleDateString("pt-BR")}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(expense.status)}>{getStatusLabel(expense.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Funcionário</Label>
                    <p className="mt-1 font-medium">{expense.submittedBy.name}</p>
                    <p className="text-sm text-gray-500">{expense.submittedBy.email}</p>
                    <p className="text-sm text-gray-500">{expense.submittedBy.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Valor</Label>
                    <p className="mt-1 text-2xl font-bold text-green-600">
                      R$ {expense.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Categoria</Label>
                    <p className="mt-1 font-medium">{expense.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Data da Despesa</Label>
                    <p className="mt-1 font-medium">{new Date(expense.date).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Descrição</Label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{expense.description}</p>
                </div>

                {expense.receiptUrl && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Comprovante</Label>
                    <div className="mt-2">
                      <Button variant="outline" asChild>
                        <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Visualizar Comprovante
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ações de Validação */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Validação</CardTitle>
                <CardDescription>Aprove ou rejeite este relatório</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="comments">Comentários (opcional)</Label>
                  <Textarea
                    id="comments"
                    placeholder="Adicione comentários sobre a validação..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => handleValidation("approve")}
                    disabled={submitting || expense.status !== "pending"}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {submitting ? "Processando..." : "Aprovar Relatório"}
                  </Button>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleValidation("reject")}
                    disabled={submitting || expense.status !== "pending"}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {submitting ? "Processando..." : "Rejeitar Relatório"}
                  </Button>
                </div>

                {expense.status !== "pending" && (
                  <Alert>
                    <AlertDescription>Este relatório já foi validado e não pode ser alterado.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
