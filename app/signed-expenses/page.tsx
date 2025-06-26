"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle, Eye, Shield } from "lucide-react"

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
  }
  signedBy?: {
    name: string
    email: string
  }
  signedAt?: string
  digitalSignature?: string
  createdAt: string
}

export default function SignedExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    const user = JSON.parse(userData)
    if (user.role !== "diretor") {
      router.push("/dashboard")
      return
    }

    loadSignedExpenses()
  }, [router])

  const loadSignedExpenses = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/expenses/signed", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error("Erro ao carregar relatórios assinados:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySignature = (expenseId: string) => {
    router.push(`/verify-signature/${expenseId}`)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                Relatórios Assinados
              </h1>
              <p className="text-sm text-gray-600">Visualizar e verificar relatórios com assinatura digital</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Relatórios com Assinatura Digital</CardTitle>
            <CardDescription>{expenses.length} relatório(s) assinado(s) digitalmente</CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum relatório assinado</h3>
                <p className="text-gray-500">Ainda não há relatórios com assinatura digital.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Assinado por</TableHead>
                    <TableHead>Data Assinatura</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense._id}>
                      <TableCell className="font-medium">{expense.title}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{expense.submittedBy.name}</div>
                          <div className="text-sm text-gray-500">{expense.submittedBy.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>R$ {expense.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        {expense.signedBy && (
                          <div>
                            <div className="font-medium">{expense.signedBy.name}</div>
                            <div className="text-sm text-gray-500">{expense.signedBy.email}</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {expense.signedAt && new Date(expense.signedAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(expense.status)}>
                          <Shield className="w-3 h-3 mr-1" />
                          {getStatusLabel(expense.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleVerifySignature(expense._id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Verificar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
