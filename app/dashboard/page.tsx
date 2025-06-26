"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, PenTool, CheckCircle, Clock, AlertCircle, LogOut, Plus } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "funcionario" | "gerente" | "diretor"
}

interface DashboardStats {
  totalEmployees: number
  pendingExpenses: number
  signedExpenses: number
  totalExpenses: number
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingExpenses: 0,
    signedExpenses: 0,
    totalExpenses: 0,
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(userData))
    loadDashboardStats()
  }, [router])

  const loadDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (!user) {
    return <div>Carregando...</div>
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "diretor":
        return "bg-red-100 text-red-800"
      case "gerente":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "diretor":
        return "Diretor"
      case "gerente":
        return "Gerente"
      default:
        return "Funcionário"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Bem-vindo, {user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={getRoleColor(user.role)}>{getRoleLabel(user.role)}</Badge>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Funcionários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Relatórios Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingExpenses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Relatórios Assinados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.signedExpenses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Relatórios</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExpenses}</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Funcionários */}
          {(user.role === "diretor" || user.role === "gerente") && (
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push("/employees")}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Gerenciar Funcionários
                </CardTitle>
                <CardDescription>Cadastrar, editar e visualizar funcionários</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Acessar
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Submeter Relatório */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push("/submit-expense")}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Submeter Relatório
              </CardTitle>
              <CardDescription>Criar novo relatório de despesas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Novo Relatório
              </Button>
            </CardContent>
          </Card>

          {/* Relatórios Pendentes - Gerente */}
          {user.role === "gerente" && (
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push("/pending-expenses")}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Relatórios Pendentes
                </CardTitle>
                <CardDescription>Validar relatórios de despesas</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-transparent" variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
                  Validar ({stats.pendingExpenses})
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Assinar Relatórios - Gerente */}
          {user.role === "gerente" && (
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push("/sign-expense")}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PenTool className="w-5 h-5 mr-2" />
                  Assinar Relatórios
                </CardTitle>
                <CardDescription>Assinar digitalmente relatórios validados</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-transparent" variant="outline">
                  <PenTool className="w-4 h-4 mr-2" />
                  Assinar
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Relatórios Assinados - Diretor */}
          {user.role === "diretor" && (
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push("/signed-expenses")}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Relatórios Assinados
                </CardTitle>
                <CardDescription>Verificar relatórios assinados</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-transparent" variant="outline">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verificar ({stats.signedExpenses})
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Verificar Assinaturas - Diretor */}
          {user.role === "diretor" && (
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push("/verify-signature")}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Verificar Assinaturas
                </CardTitle>
                <CardDescription>Verificar autenticidade das assinaturas</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-transparent" variant="outline">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verificar
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
