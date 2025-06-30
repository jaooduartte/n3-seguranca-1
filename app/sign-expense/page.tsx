"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, PenTool, Shield, CheckCircle } from "lucide-react";
import {
  generateKeyPair,
  signData,
  createSignedData,
  simulateDigitalSignature,
  type DigitalSignature,
} from "@/lib/crypto";
import { Label } from "@/components/ui/label";

interface Expense {
  _id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: "pending" | "approved" | "rejected" | "signed";
  submittedBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function SignExpense() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [useSimulation, setUseSimulation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== "gerente") {
      router.push("/dashboard");
      return;
    }

    loadApprovedExpenses();
  }, [router]);

  const loadApprovedExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/expenses/approved", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error("Erro ao carregar relatórios aprovados:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateDigitalSignature = async (data: string): Promise<string> => {
    try {
      if (useSimulation) {
        // Usar simulação para desenvolvimento
        const mockSignature = simulateDigitalSignature(data);
        return JSON.stringify(mockSignature);
      }

      // Gerar par de chaves para assinatura digital
      const keyPair = await generateKeyPair();

      // Assinar os dados
      const signature = await signData(data, keyPair);

      return JSON.stringify(signature);
    } catch (error) {
      console.error("Erro ao gerar assinatura digital:", error);
      throw new Error("Falha ao gerar assinatura digital");
    }
  };

  const handleSignExpense = async (expense: Expense) => {
    setSigning(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      const user = JSON.parse(userData!);

      // Criar dados para serem assinados
      const signedData = createSignedData(
        expense._id,
        expense.title,
        expense.amount,
        expense.submittedBy.email,
        user.email
      );

      const dataToSign = JSON.stringify(signedData);

      // Gerar assinatura digital
      const digitalSignature = await generateDigitalSignature(dataToSign);

      // Enviar assinatura para o servidor
      const response = await fetch(`/api/expenses/${expense._id}/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          signature: digitalSignature,
          signedData: dataToSign,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Relatório assinado digitalmente com sucesso!");
        setDialogOpen(false);
        loadApprovedExpenses();
      } else {
        setError(data.message || "Erro ao assinar relatório");
      }
    } catch (error) {
      setError("Erro ao gerar assinatura digital. Tente novamente.");
    } finally {
      setSigning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "signed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "approved":
        return "Aprovado";
      case "rejected":
        return "Rejeitado";
      case "signed":
        return "Assinado";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregando...
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
              onClick={() => router.push("/dashboard")}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <PenTool className="w-6 h-6 mr-2" />
                Assinar Relatórios
              </h1>
              <p className="text-sm text-gray-600">
                Assinar digitalmente relatórios aprovados
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <Label htmlFor="simulation">
                Usar simulação de assinatura digital
              </Label>
            </div>
            {useSimulation && (
              <Alert className="mt-2">
                <AlertDescription>
                  Modo de simulação ativo. As assinaturas serão simuladas para
                  fins de desenvolvimento.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios Aprovados para Assinatura</CardTitle>
            <CardDescription>
              {expenses.length} relatório(s) aprovado(s) aguardando assinatura
              digital
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum relatório para assinar
                </h3>
                <p className="text-gray-500">
                  Todos os relatórios aprovados já foram assinados.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense._id}>
                      <TableCell className="font-medium">
                        {expense.title}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {expense.submittedBy.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {expense.submittedBy.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>
                        R${" "}
                        {expense.amount.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        {new Date(expense.date).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(expense.status)}>
                          {getStatusLabel(expense.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedExpense(expense)}
                            >
                              <PenTool className="w-4 h-4 mr-2" />
                              Assinar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center">
                                <Shield className="w-5 h-5 mr-2" />
                                Assinatura Digital
                              </DialogTitle>
                              <DialogDescription>
                                Você está prestes a assinar digitalmente o
                                relatório "{selectedExpense?.title}". Esta ação
                                garante a autenticidade e integridade do
                                documento.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {selectedExpense && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h4 className="font-medium mb-2">
                                    Detalhes do Relatório:
                                  </h4>
                                  <div className="text-sm space-y-1">
                                    <p>
                                      <strong>Título:</strong>{" "}
                                      {selectedExpense.title}
                                    </p>
                                    <p>
                                      <strong>Valor:</strong> R${" "}
                                      {selectedExpense.amount.toLocaleString(
                                        "pt-BR",
                                        { minimumFractionDigits: 2 }
                                      )}
                                    </p>
                                    <p>
                                      <strong>Funcionário:</strong>{" "}
                                      {selectedExpense.submittedBy.name}
                                    </p>
                                    <p>
                                      <strong>Data:</strong>{" "}
                                      {new Date(
                                        selectedExpense.date
                                      ).toLocaleDateString("pt-BR")}
                                    </p>
                                  </div>
                                </div>
                              )}
                              <Alert>
                                <Shield className="h-4 w-4" />
                                <AlertDescription>
                                  {useSimulation
                                    ? "Simulação de assinatura digital ativa para desenvolvimento."
                                    : "A assinatura digital será gerada usando criptografia RSA-PSS com hash SHA-256, garantindo a autenticidade e não repúdio do documento."}
                                </AlertDescription>
                              </Alert>
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setDialogOpen(false)}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={() =>
                                    selectedExpense &&
                                    handleSignExpense(selectedExpense)
                                  }
                                  disabled={signing}
                                >
                                  {signing
                                    ? "Assinando..."
                                    : "Confirmar Assinatura"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
  );
}
