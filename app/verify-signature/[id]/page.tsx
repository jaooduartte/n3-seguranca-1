"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface Expense {
  _id: string
  title: string
  description: string
  amount: number
  category: string
  date: string
  status: string
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
  signedData?: string
  createdAt: string
}

interface VerificationResult {
  isValid: boolean
  details: {
    signatureValid: boolean
    dataIntegrity: boolean
    timestamp: string
    signer: string
  }
}

export default function VerifySignature() {
  const [expense, setExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState("")
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
    if (user.role !== "diretor") {
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

  const verifyDigitalSignature = async (signatureData: string, originalData: string): Promise<boolean> => {
    try {
      const signature = JSON.parse(signatureData)

      // Import public key
      const publicKeyBuffer = Uint8Array.from(atob(signature.publicKey), (c) => c.charCodeAt(0))
      const publicKey = await window.crypto.subtle.importKey(
        "spki",
        publicKeyBuffer,
        {
          name: "RSA-PSS",
          hash: "SHA-256",
        },
        false,
        ["verify"],
      )

      // Convert signature from base64
      const signatureBuffer = Uint8Array.from(atob(signature.signature), (c) => c.charCodeAt(0))

      // Convert data to ArrayBuffer
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(originalData)

      // Verify signature
      const isValid = await window.crypto.subtle.verify(
        {
          name: "RSA-PSS",
          saltLength: 32,
        },
        publicKey,
        signatureBuffer,
        dataBuffer,
      )

      return isValid
    } catch (error) {
      console.error("Erro ao verificar assinatura:", error)
      return false
    }
  }

  const handleVerifySignature = async () => {
    if (!expense || !expense.digitalSignature || !expense.signedData) {
      setError("Dados de assinatura não encontrados")
      return
    }

    setVerifying(true)
    setError("")

    try {
      // Verify digital signature
      const signatureValid = await verifyDigitalSignature(expense.digitalSignature, expense.signedData)

      // Parse signed data to verify integrity
      const signedDataObj = JSON.parse(expense.signedData)
      const dataIntegrity =
        signedDataObj.expenseId === expense._id &&
        signedDataObj.title === expense.title &&
        signedDataObj.amount === expense.amount &&
        signedDataObj.submittedBy === expense.submittedBy.email

      setVerificationResult({
        isValid: signatureValid && dataIntegrity,
        details: {
          signatureValid,
          dataIntegrity,
          timestamp: signedDataObj.timestamp,
          signer: signedDataObj.signedBy,
        },
      })
    } catch (error) {
      setError("Erro ao verificar assinatura digital")
    } finally {
      setVerifying(false)
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
          <Button onClick={() => router.push("/signed-expenses")}>Voltar para relatórios assinados</Button>
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
            <Button variant="ghost" onClick={() => router.push("/signed-expenses")} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                Verificar Assinatura Digital
              </h1>
              <p className="text-sm text-gray-600">Verificar autenticidade e integridade da assinatura</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <CardTitle>{expense.title}</CardTitle>
                <CardDescription>Relatório assinado digitalmente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Funcionário</Label>
                    <p className="mt-1 font-medium">{expense.submittedBy.name}</p>
                    <p className="text-sm text-gray-500">{expense.submittedBy.email}</p>
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

                {expense.signedBy && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Assinado por</Label>
                      <p className="mt-1 font-medium">{expense.signedBy.name}</p>
                      <p className="text-sm text-gray-500">{expense.signedBy.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Data da Assinatura</Label>
                      <p className="mt-1 font-medium">
                        {expense.signedAt && new Date(expense.signedAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-gray-500">Descrição</Label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{expense.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Verificação de Assinatura */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Verificação
                </CardTitle>
                <CardDescription>Verificar autenticidade da assinatura digital</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!verificationResult ? (
                  <Button
                    className="w-full"
                    onClick={handleVerifySignature}
                    disabled={verifying || !expense.digitalSignature}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {verifying ? "Verificando..." : "Verificar Assinatura"}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <Alert
                      className={
                        verificationResult.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                      }
                    >
                      <div className="flex items-center">
                        {verificationResult.isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription className="ml-2">
                          <strong>{verificationResult.isValid ? "Assinatura Válida" : "Assinatura Inválida"}</strong>
                        </AlertDescription>
                      </div>
                    </Alert>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Assinatura Digital:</span>
                        <div className="flex items-center">
                          {verificationResult.details.signatureValid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="ml-1 text-sm">
                            {verificationResult.details.signatureValid ? "Válida" : "Inválida"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Integridade dos Dados:</span>
                        <div className="flex items-center">
                          {verificationResult.details.dataIntegrity ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="ml-1 text-sm">
                            {verificationResult.details.dataIntegrity ? "Íntegra" : "Comprometida"}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="text-sm">
                          <p>
                            <strong>Assinado por:</strong> {verificationResult.details.signer}
                          </p>
                          <p>
                            <strong>Timestamp:</strong>{" "}
                            {new Date(verificationResult.details.timestamp).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => setVerificationResult(null)}
                    >
                      Verificar Novamente
                    </Button>
                  </div>
                )}

                {!expense.digitalSignature && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>Este relatório não possui assinatura digital.</AlertDescription>
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
