"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  verifySignature,
  verifyDataIntegrity,
  simulateSignatureVerification,
  type DigitalSignature,
  type SignedData,
} from "@/lib/crypto";

interface Expense {
  _id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: string;
  submittedBy: {
    name: string;
    email: string;
  };
  signedBy?: {
    name: string;
    email: string;
  };
  signedAt?: string;
  digitalSignature?: string;
  signedData?: string;
  createdAt: string;
}

interface VerificationResult {
  isValid: boolean;
  details: {
    signatureValid: boolean;
    dataIntegrity: boolean;
    timestamp: string;
    signer: string;
  };
}

export default function VerifySignature() {
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [error, setError] = useState("");
  const [useSimulation, setUseSimulation] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== "diretor") {
      router.push("/dashboard");
      return;
    }

    loadExpense();
  }, [router, params.id]);

  const loadExpense = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/expenses/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExpense(data);
      } else {
        setError("Relatório não encontrado");
      }
    } catch (error) {
      setError("Erro ao carregar relatório");
    } finally {
      setLoading(false);
    }
  };

  const verifyDigitalSignature = async (
    signatureData: string,
    originalData: string
  ): Promise<boolean> => {
    try {
      if (useSimulation) {
        // Usar simulação para desenvolvimento
        return simulateSignatureVerification();
      }

      const signature: DigitalSignature = JSON.parse(signatureData);

      // Verificar assinatura usando Web Crypto API
      return await verifySignature(signature, originalData);
    } catch (error) {
      console.error("Erro ao verificar assinatura:", error);
      return false;
    }
  };

  const handleVerifySignature = async () => {
    if (!expense || !expense.digitalSignature || !expense.signedData) {
      setError("Dados de assinatura não encontrados");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      // Verificar assinatura digital
      const signatureValid = await verifyDigitalSignature(
        expense.digitalSignature,
        expense.signedData
      );

      // Verificar integridade dos dados
      let dataIntegrity = false;
      try {
        const signedDataObj: SignedData = JSON.parse(expense.signedData);
        dataIntegrity = verifyDataIntegrity(signedDataObj, expense);

        setVerificationResult({
          isValid: signatureValid && dataIntegrity,
          details: {
            signatureValid,
            dataIntegrity,
            timestamp: signedDataObj.timestamp,
            signer: signedDataObj.signedBy,
          },
        });
      } catch (parseError) {
        console.error("Erro ao analisar dados assinados:", parseError);
        setError("Erro ao analisar dados de assinatura");
      }
    } catch (error) {
      setError("Erro ao verificar assinatura digital");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregando...
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Relatório não encontrado</h2>
          <Button onClick={() => router.push("/signed-expenses")}>
            Voltar para relatórios assinados
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/signed-expenses")}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                Verificar Assinatura Digital
              </h1>
              <p className="text-sm text-gray-600">
                Verificar autenticidade da assinatura digital
              </p>
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

        {/* Modo de Simulação */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Modo de Desenvolvimento</CardTitle>
            <CardDescription>
              Ative a simulação para testar sem criptografia real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="simulation"
                checked={useSimulation}
                onChange={(e) => setUseSimulation(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="simulation">Usar simulação de verificação</Label>
            </div>
            {useSimulation && (
              <Alert className="mt-2">
                <AlertDescription>
                  Modo de simulação ativo. A verificação será simulada para fins
                  de desenvolvimento.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detalhes do Relatório */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Relatório</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Título</Label>
                <p className="text-lg font-semibold">{expense.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <p className="text-gray-700">{expense.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Valor</Label>
                  <p className="text-lg font-semibold text-green-600">
                    R${" "}
                    {expense.amount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Categoria</Label>
                  <p className="text-gray-700">{expense.category}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Funcionário</Label>
                  <p className="text-gray-700">{expense.submittedBy.name}</p>
                  <p className="text-sm text-gray-500">
                    {expense.submittedBy.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data</Label>
                  <p className="text-gray-700">
                    {new Date(expense.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              {expense.signedBy && (
                <div>
                  <Label className="text-sm font-medium">Assinado por</Label>
                  <p className="text-gray-700">{expense.signedBy.name}</p>
                  <p className="text-sm text-gray-500">
                    {expense.signedBy.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {expense.signedAt &&
                      new Date(expense.signedAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verificação de Assinatura */}
          <Card>
            <CardHeader>
              <CardTitle>Verificação de Assinatura</CardTitle>
              <CardDescription>
                Verificar a autenticidade da assinatura digital
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!verificationResult ? (
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">
                    Clique no botão abaixo para verificar a assinatura digital
                  </p>
                  <Button onClick={handleVerifySignature} disabled={verifying}>
                    {verifying ? "Verificando..." : "Verificar Assinatura"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert
                    variant={
                      verificationResult.isValid ? "default" : "destructive"
                    }
                  >
                    {verificationResult.isValid ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {verificationResult.isValid
                        ? "Assinatura digital válida! O documento é autêntico."
                        : "Assinatura digital inválida! O documento pode ter sido alterado."}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <h4 className="font-medium">Detalhes da Verificação:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        {verificationResult.details.signatureValid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>
                          Assinatura criptográfica:{" "}
                          {verificationResult.details.signatureValid
                            ? "Válida"
                            : "Inválida"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {verificationResult.details.dataIntegrity ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>
                          Integridade dos dados:{" "}
                          {verificationResult.details.dataIntegrity
                            ? "Preservada"
                            : "Comprometida"}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        <p>Assinado por: {verificationResult.details.signer}</p>
                        <p>
                          Data/hora:{" "}
                          {new Date(
                            verificationResult.details.timestamp
                          ).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleVerifySignature}
                    disabled={verifying}
                    variant="outline"
                  >
                    Verificar Novamente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
